require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { connectDB } = require("./utils/mongodb");
const Message = require("./models/Message");

const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

const usersOnline = [];
io.on("connection", (socket) => {
  // user connect

  // user disconnect
  socket.on("disconnect", () => {
    console.log(socket.id, "đã ngắt kết nối");
  });

  // user online
  socket.on("online", (data) => {
    console.log(`${data.user} đang online`);
    socket.broadcast.emit("online", {
      user: data.user,
    });
  });

  // someone typing ...
  socket.on("typing", (data) => {
    console.log(`${data.user} đang gõ ...`);
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message,
    });
  });

  // when someone stop typing
  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  // chat
  socket.on("chat message", (msg) => {
    console.log("message................", msg);

    // broadcast message to everyone, except you
    socket.broadcast.emit("received", { message: msg });

    // save chat to DB
    let chatMessage = new Message({
      message: msg,
      senderId: "123",
      receiverId: "456",
    });

    chatMessage.save();
  });
});

//import routes
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const userRoute = require("./routes/user");
const uploadRoute = require("./routes/upload");

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
