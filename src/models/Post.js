const { Schema, model } = require("mongoose");

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
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  {
    versionKey: false,
  },
  { timestamps: true }
);

module.exports = model("posts", PostSchema);
