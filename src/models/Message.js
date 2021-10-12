const { Schema, model } = require('mongoose')

const MessageSchema = new Schema(
  {
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
    roomId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = model('message', MessageSchema)
