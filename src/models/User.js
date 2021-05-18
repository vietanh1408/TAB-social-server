const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        email: true,
    },
    phone: {
        type: String,
        required: true,
        min: 8,
        max: 12,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    avatar: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
})

module.exports = model('users', userSchema)