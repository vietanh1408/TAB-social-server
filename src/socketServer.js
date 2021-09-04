let users = [] // --> all user connect socket

module.exports.SocketServer = (socket) => {
  // Join socket: server <---(user)---- client
  socket.on('joinSocket', (user) => {
    console.log(socket.id, ' connected')
    users.push({
      id: user._id,
      socketId: socket.id,
      friends: user.friends,
      name: user.name,
      avatar: user.avatar,
    })
  })
  // Disconnect socket
  socket.on('disconnect', () => {
    console.log(socket.id, ' disconnected')
    users = users.filter((user) => user.socketId !== socket.id)
  })

  // Check User Online : server <----(user)---- server
  socket.on('userOnline', (data) => {
    const followings = users.filter((user) =>
      data.followings.find((following) => following === user.id)
    )
    // server ---->(online followings)----> client
    socket.emit('ownUserOnline', followings)

    const followers = users.filter((user) =>
      data.followers.find((follower) => follower === user.id)
    )

    if (followers.length > 0) {
      followers.forEach((follower) => {
        socket
          .to(`${follower.socketId}`)
          .emit('checkUserOnlineToClient', data._id)
      })
    }
  })
}

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
