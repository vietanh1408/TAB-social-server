const { Schema, model, Types } = require('mongoose')

const MessageSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'roomChat' },
    from: { type: Types.ObjectId, ref: 'user' },
    to: [{ type: Types.ObjectId, ref: 'user' }],
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

module.exports = model('message', MessageSchema)
