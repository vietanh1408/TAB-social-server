const Post = require("../models/Post");
const User = require("../models/User");
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcryptjs");
const postValidation = require("../validations/post.create");

// get all user
module.exports.getUserProfile = async (req, res, next) => {
  try {
    const profile = await User.findOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "get your profile successfully",
      profile: profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.getOwnPost = async (req, res, next) => {
  try {
    const myPosts = await Post.find({ user: req.userId }).populate("user", [
      "name",
      "avatar",
    ]);

    return res.status(200).json({
      success: true,
      message: "get your posts successfully",
      posts: myPosts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.getPostById = async (req, res, next) => {
  try {
    const id = ObjectId(req.params.id);

    const post = await Post.findOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "get post successfully",
      post: post,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.editPost = async (req, res, next) => {
  const { title, description, image, status, reaction, comment } = req.body;

  let editedPost = {
    title,
    description,
    image,
    status,
    reaction,
    comment,
  };
  const { error } = postValidation(editedPost);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  try {
    const condition = { _id: req.params.id, user: req.userId };

    editedPost = await Post.findOneAndUpdate(condition, editedPost, {
      new: true,
    });

    if (!editedPost)
      return res.status(401).json({
        success: false,
        message: "Post not found",
      });

    return res.status(200).json({
      success: true,
      message: "Edit post successfully",
      post: editedPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.deletePost = async (req, res, next) => {
  try {
    const condition = { _id: req.params.id, user: req.userId };
    const deletedPost = await Post.findOneAndDelete(condition);

    if (!deletedPost)
      return res.status(401).json({
        success: false,
        message: "Post not found",
      });

    return res.status(200).json({
      success: true,
      message: "Delete post successfully",
      post: deletedPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// edit profile
module.exports.editProfile = async (req, res) => {
  // check own profile
  if (req.userId !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "You only can edit your post",
    });
  } else {
    try {
      // doi mat khau
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json({
        success: true,
        message: "update profile successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};
// check password
module.exports.checkPassword = async (req, res) => {
  try {
    const profile = await User.findById(req.userId);

    const isDuplicated = bcrypt.compareSync(
      req.body.password,
      profile.password
    );

    if (isDuplicated) {
      return res.status(200).json({
        success: true,
        message: "password is matched",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "password not match",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
