let users = []

module.exports.SocketServer = (socket) => {
  socket.on('joinSocket', (user) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      name: user.name,
      avatar: user.avatar,
    })
  })

  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketId !== socket.id)
  })

  socket.on('userOnline', (data) => {
    const followings = users.filter((user) =>
      data.followings.find((following) => following === user.id)
    )

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
