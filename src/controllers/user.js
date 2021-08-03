const Post = require("../models/Post");
const User = require("../models/User");
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcryptjs");
const postValidation = require("../validations/post.create");
const ServerFail = require("../constants/request");

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
    ServerFail();
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
    ServerFail();
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
    ServerFail();
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
    ServerFail();
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
    ServerFail();
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
    ServerFail();
  }
};

// send add friend request
module.exports.sendFriendRequest = async (req, res) => {
  try {
    const profile = await User.findById(req.userId);
    const friend = await User.findById(req.body.friendId);

    if (!profile || !friend) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // add to DB
    if (profile.sendFriendRequests.includes(req.body.friendId)) {
      return res.status(400).json({
        success: false,
        message: "You have already send friend request",
      });
    } else {
      await User.findByIdAndUpdate(req.userId, {
        $push: { sendFriendRequests: req.body.friendId },
      });
    }

    // send friend request to friend
    await User.findByIdAndUpdate(req.body.friendId, {
      $push: { friendRequests: req.userId },
    });

    return res.status(200).json({
      success: true,
      message: "Send Friend Request successfully",
    });
  } catch (err) {
    ServerFail();
  }
};
