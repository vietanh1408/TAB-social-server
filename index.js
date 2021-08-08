require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { connectDB } = require("./src/utils/mongodb");

const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

const usersOnline = [];
io.on("connection", (socket) => {
  console.log(socket.id, " da ket noi");

  // truyen thong tin user vao mang user online
  socket.on("client-send-current-user", (data) => {
    console.log("data...........", data);
    socket.Username = data;
    if (!usersOnline.includes(data)) {
      usersOnline.push(data);
    }
    // gui thong tin cac user dang online
    io.sockets.emit("server-send-users-online-list", usersOnline);
    console.log(usersOnline);
  });

  socket.on("disconnect", () => {
    console.log(socket.id, " đã ngắt kết nối");

    io.sockets.emit("server-send-users-online-list", usersOnline);
    console.log(usersOnline);
  });
});

//import routes
const authRoute = require("./src/routes/auth");
const postRoute = require("./src/routes/post");
const userRoute = require("./src/routes/user");
const uploadRoute = require("./src/routes/upload");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// route middleware
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/user", userRoute);
app.use("/api/", uploadRoute);

// connect mongoDB
connectDB();

http.listen(port, () => {
  console.log(`Server start at http://localhost:${port}`);
});
