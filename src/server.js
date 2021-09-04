require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const cors = require('cors')

// import libs
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { connectDB } = require('./utils/mongodb')
const { SocketServer } = require('./socketServer')
const http = require('http').createServer(app)
const io = require('socket.io')(http, { cors: { origin: '*' } })

//import routes
const authRoute = require('./routes/auth')
const postRoute = require('./routes/post')
const userRoute = require('./routes/user')
const uploadRoute = require('./routes/upload')

// app use
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(
  fileUpload({
    useTempFiles: true,
  })
)

// route api
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/user', userRoute)
app.use('/api/', uploadRoute)

// connect mongoDB
connectDB()

// connect socket.io
io.on('connection', (socket) => {
  SocketServer(socket)
})

// app listener
http.listen(port, () => {
  console.log(`🚀🚀🚀 Server start at http://localhost:${port} 🚩🚩🚩`)
})
