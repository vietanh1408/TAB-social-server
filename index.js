require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const mongoose = require('mongoose')
const cors = require('cors')

//import routes
const authRoute = require('./src/routes/auth')
const postRoute = require('./src/routes/post')
const userRoute = require('./src/routes/user')

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.DB,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
            })
        console.log('connected database !')
    } catch (err) {
        console.log('connect database fail !')
    }
}
connectDB()

app.use(express.json())
app.use(cors())


// route middleware
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/user', userRoute)

app.listen(port, () => {
    console.log(`Server start at http://localhost:${port}`)
})