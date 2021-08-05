const Post = require("../models/Post");
const postValidation = require("../validations/post.create");
const ObjectId = require("mongodb").ObjectID;
const ServerFail = require("../constants/request");

// get all post
module.exports.index = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", ["name", "avatar"])
      .sort({ createAt: -1 });
    return res.status(200).json({
      success: true,
      message: "get all posts successfully",
      posts: posts,
    });
  } catch (err) {
    ServerFail();
  }
};

// get post by id
module.exports.getPostById = async (req, res) => {
  try {
    const id = ObjectId(req.params.id);
    const post = await Post.findOne({ _id: id }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "get post by id successfully",
      post: post,
    });
  } catch (err) {
    ServerFail();
  }
};

// create post
module.exports.createPost = async (req, res) => {
  const { description, image } = req.body;

  // validate create post
  const { error } = postValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: "haha",
    });

  try {
    const newPost = new Post({
      userId: req.userId,
      description,
      image,
    });

    await newPost.save();

    return res.status(200).json({
      success: true,
      message: "create a new post successfully",
      post: newPost,
    });
  } catch (err) {
    ServerFail();
  }
};

// edit post
module.exports.editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    // check own post
    if (post.userId === req.userId) {
      try {
        await Post.findByIdAndUpdate(req.params.id, { $set: req.body });
        return res.status(200).json({
          success: true,
          message: "Update post successfully",
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "You only can edit your post",
      });
    }
  } catch (err) {
    ServerFail();
  }
};

// delete post
module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    // check own post
    if (post.userId === req.userId) {
      try {
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({
          success: true,
          message: "Delete post successfully",
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "You only can edit your post",
      });
    }
  } catch (err) {
    ServerFail();
  }
};
