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
    relationShip: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    sendFriendRequests: {
      type: Array,
      default: [],
    },
    friendRequests: {
      type: Array,
      default: [],
    },
  },
  {
    versionKey: false,
  },
  {
    timestamps: true,
  }
);

module.exports = model("users", UserSchema);
