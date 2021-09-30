const { Schema, model, Types } = require('mongoose')

const ImageSchema = new Schema({
  publicId: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  _id: false,
})

const NotificationSchema = new Schema(
  {
    id: Types.ObjectId,
    user: {
      type: Types.ObjectId,
      ref: 'user',
    },
    receivers: [Types.ObjectId],
    url: String,
    text: String,
    content: String,
    image: {
      type: ImageSchema,
      default: {
        publicId: '',
        url: '',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = model('notification', NotificationSchema)
