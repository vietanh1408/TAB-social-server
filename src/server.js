// import libs
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { SocketServer } = require('./socketServer')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { cors: { origin: '*' } })

// connect DB
const { connectDB } = require('./utils/mongodb')
const { connectRedis } = require('./utils/redis')

// environments
const environments = require('./constants/environment')
const port = environments.PORT

//import routes
const authRoute = require('./routes/auth')
const postRoute = require('./routes/post')
const userRoute = require('./routes/user')
const friendRoute = require('./routes/friend')
const uploadRoute = require('./routes/upload')
const notificationRoute = require('./routes/notification')
const chatRoute = require('./routes/chat')
const searchRoute = require('./routes/search')

const { arena } = require('./jobs/arena')

// app use
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(cors())
app.use(
    fileUpload({
        useTempFiles: true,
    })
)

// arena
app.use('/', arena)

// route api
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/users', userRoute)
app.use('/api/friends', friendRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/chats', chatRoute)
app.use('/api/search', searchRoute)
app.use('/api/', uploadRoute)

// connect mongoDB
connectDB()

// connect Redis
connectRedis()

// connect socket.io
io.on('connection', (socket) => {
    console.log(socket.id, 'connected')
    SocketServer(socket)
})

// app listener
http.listen(port, () => {
    console.log(`🚀🚀🚀 Server start at http://localhost:${port} 🚩🚩🚩`)
})