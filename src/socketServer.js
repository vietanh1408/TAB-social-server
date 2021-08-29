let users = [];

const EditData = (data, id, call) => {
  const newData = data.map((item) =>
    item.id === id ? { ...item, call } : item
  );
  return newData;
};

module.exports.SocketServer = (socket) => {
  // Connect - Disconnect
  socket.on("joinUser", (user) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      followers: user.followers,
    });
  });

  socket.on("disconnect", () => {
    const data = users.find((user) => user.socketId === socket.id);
    if (data) {
      const clients = users.filter((user) =>
        data.followers.find((item) => item._id === user.id)
      );

      if (clients.length > 0) {
        clients.forEach((client) => {
          socket.to(`${client.socketId}`).emit("CheckUserOffline", data.id);
        });
      }

      if (data.call) {
        const callUser = users.find((user) => user.id === data.call);
        if (callUser) {
          users = EditData(users, callUser.id, null);
          socket.to(`${callUser.socketId}`).emit("callerDisconnect");
        }
      }
    }

    users = users.filter((user) => user.socketId !== socket.id);
  });
};

// const usersOnline = [];
// io.on("connection", (socket) => {
//   // user connect

//   // user disconnect
//   socket.on("disconnect", () => {
//     console.log(socket.id, "đã ngắt kết nối");
//   });

//   // user online
//   socket.on("online", (data) => {
//     console.log(`${data.user} đang online`);
//     socket.broadcast.emit("online", {
//       user: data.user,
//     });
//   });

//   // someone typing ...
//   socket.on("typing", (data) => {
//     console.log(`${data.user} đang gõ ...`);
//     socket.broadcast.emit("notifyTyping", {
//       user: data.user,
//       message: data.message,
//     });
//   });

//   // when someone stop typing
//   socket.on("stopTyping", () => {
//     socket.broadcast.emit("notifyStopTyping");
//   });

//   // chat
//   socket.on("chat message", (msg) => {
//     // broadcast message to everyone, except you
//     socket.broadcast.emit("received", { message: msg });

//     // save chat to DB
//     let chatMessage = new Message({
//       message: msg,
//       senderId: "123",
//       receiverId: "456",
//     });

//     chatMessage.save();
//   });
// });
