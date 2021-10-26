let users = [] // --> all user connect socket

module.exports.SocketServer = (socket) => {
  // Join socket: server <---(user)---- client
  socket.on('joinSocket', (user) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      name: user.name,
      avatar: user.avatar,
    })
  })
  // Disconnect socket
  socket.on('disconnect', () => {
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
        socket.to(`${follower.socketId}`).emit('checkUserOnlineToClient', data)
      })
    }
  })

  // lang nghe su kien sendFriendRequest
  socket.on('sendFriendRequest', (notification) => {
    const ids = [...notification.user, notification.receivers]
    const clients = users.filter((user) => ids.includes(user.id))
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit('receiveFriendRequest', notification)
      })
    }
  })

  // lang nghe su kien likePost => gui thong bao
  socket.on('likePost', (notification) => {
    const ids = [...notification.user, notification.receivers]
    const clients = users.filter((user) => ids.includes(user.id))
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit('sendNotificationLikePost', notification)
      })
    }
  })

  // lang nghe su kien commentPost => gui thong bao
  socket.on('commentPost', (notification) => {
    const ids = [...notification.user, notification.receivers]
    const clients = users.filter((user) => ids.includes(user.id))
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit('sendNotificationCommentPost', notification)
      })
    }
  })
}
