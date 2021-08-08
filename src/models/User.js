const { Schema, model } = require("mongoose");

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
      type: String,
      default: "",
    },
    background: {
      type: String,
      default: "",
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
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    from: {
      type: String,
      default: "",
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
  },
  {
    versionKey: false,
  }
);

module.exports = model("users", UserSchema);
