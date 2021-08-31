const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { cors: { origin: '*' } })

module.exports.connectSocket = () => {
  const usersOnline = []
  io.on('connection', (socket) => {
    console.log(socket.id, ' da ket noi')

    // truyen thong tin user vao mang user online
    socket.on('client-send-current-user', (data) => {
      console.log('data...........', data)
      socket.Username = data
      if (!usersOnline.includes(data)) {
        usersOnline.push(data)
      }

      // gui thong tin cac user dang online
      io.sockets.emit('server-send-users-online-list', usersOnline)
      console.log(usersOnline)
    })

    socket.on('disconnect', () => {
      console.log(socket.id, ' đã ngắt kết nối')

      io.sockets.emit('server-send-users-online-list', usersOnline)
      console.log(usersOnline)
    })
  })
}
