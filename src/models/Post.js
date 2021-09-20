const { Schema, model, Types } = require('mongoose')

const CommentSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
  },
})

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

const PostSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'user',
      required: true,
    },
    description: {
      type: String,
      required: true,
      max: 1024,
      default: '',
    },
    image: {
      type: ImageSchema,
      default: {
        publicId: '',
        url: '',
      },
    },
    likes: [{ type: Types.ObjectId, ref: 'user' }],
    comments: {
      type: [CommentSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    versionKey: false,
  }
)

module.exports = model('post', PostSchema)
