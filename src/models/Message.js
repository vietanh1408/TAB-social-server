const { Schema, model } = require('mongoose')

const MessageSchema = new Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: Array,
    required: true,
    default: [],
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  roomId: {
    type: String,
    required: true,
  },
})

module.exports = model('messages', MessageSchema)
