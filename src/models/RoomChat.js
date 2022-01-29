const mongoose = require('mongoose')

const RoomChatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
  {
    versionKey: false,
  }
)

module.exports = mongoose.model('roomChat', RoomChatSchema)
