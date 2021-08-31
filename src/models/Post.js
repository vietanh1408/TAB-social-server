const { Schema, model } = require('mongoose')

const CommentSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
  },
})

const PostSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      max: 1024,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    likes: {
      type: Array,
      default: [],
    },
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

module.exports = model('posts', PostSchema)
