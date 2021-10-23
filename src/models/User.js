const { Schema, model } = require('mongoose')
const {
  DEFAULT_BACKGROUND_IMAGE,
  DEFAULT_AVATAR_IMAGE,
} = require('../constants')

const BackgroundSchema = new Schema({
  publicId: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: DEFAULT_BACKGROUND_IMAGE,
  },
  _id: false,
})

const AvatarSchema = new Schema({
  publicId: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: DEFAULT_AVATAR_IMAGE,
  },
  _id: false,
})

const UserSchema = new Schema(
  {
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
    },
    password: {
      type: String,
      // required: true,
      min: 6,
      max: 255,
    },
    gender: {
      type: Number,
      enum: [0, 1, 2], // 0: male | 1: female | 2: other
      default: null,
    },
    avatar: {
      type: AvatarSchema,
      default: {
        publicId: '',
        url: DEFAULT_AVATAR_IMAGE,
      },
    },
    background: {
      type: BackgroundSchema,
    },
    friends: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    from: {
      type: String,
      default: '',
    },
    relationship: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: alone :) | 1: dang hen ho | 2: dang trong 1 mqh | 3: da ket hon
      default: 0,
    },
    sendFriendRequests: {
      type: Array,
      default: [],
    },
    friendRequests: {
      type: Array,
      default: [],
    },
    blockUsers: {
      type: Array,
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    isVerifiedMail: {
      type: Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
      default: '',
    },
  },
  {
    versionKey: false,
  }
)

module.exports = model('user', UserSchema)
