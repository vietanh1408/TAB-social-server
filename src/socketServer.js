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

  // notification when send friend request
  // socket.on('sendFriendRequest', request => {
  //   const
  // })

  // lang nghe su kien likePost => gui thong bao
  socket.on('likePost', (notification) => {
    console.log('notification socket....', notification)
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
}
