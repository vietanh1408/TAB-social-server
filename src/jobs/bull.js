require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { arena } = require('./arena')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/', arena)

app.use(
    bodyParser.json({
        limit: '50mb',
    })
)

app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
    })
)

app.listen({ port: process.env.PORT_ARENA }, () => {
    console.log(
        `🚀 Server listening on port http://localhost:${process.env.PORT_ARENA}/arena`
    )
})