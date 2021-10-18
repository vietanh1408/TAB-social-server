const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')
const ObjectId = require('mongodb').ObjectID

class Pagination {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 10
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

// get all post of friend
module.exports.index = async (req, res) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId })
    const { followings, _id } = currentUser

    // get post of followings
    const postQuery = new Pagination(
      Post.find({
        user: [...followings, _id],
      }),
      req.query
    ).paginating()

    const posts = await postQuery.query
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')

    return res.status(200).json({
      success: true,
      message: 'get all posts successfully',
      posts: posts,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// get post by id
module.exports.getPostById = async (req, res) => {
  try {
    const id = ObjectId(req.params.id)
    const post = await Post.findOne({ _id: id })
      .populate('user', ['name', 'avatar'])
      .populate('comment')
    if (!post) {
      return res.status(400).json({
        success: false,
        message: 'Post not found',
      })
    }
    return res.status(200).json({
      success: true,
      message: 'get post by id successfully',
      post: post,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// create post
module.exports.createPost = async (req, res) => {
  try {
    const { description, image } = req.body
    const newPost = new Post({
      user: req.userId,
      description,
      image,
    })
    await newPost.save()
    const post = await Post.findOne({ _id: newPost._id }).populate('user', [
      'name',
      'avatar',
    ])
    return res.status(200).json({
      success: true,
      message: 'create a new post successfully',
      post: post,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// edit post
module.exports.editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(400).json({
        success: false,
        message: 'Post not found',
      })
    }
    // check own post
    if (post.user === req.userId) {
      await Post.findByIdAndUpdate(req.params.id, { $set: req.body })
      return res.status(200).json({
        success: true,
        message: 'Update post successfully',
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'You only can edit your post',
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// delete post
module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(400).json({
        success: false,
        message: 'Post not found',
      })
    }
    // check own post
    if (post.user == req.userId) {
      await Post.findByIdAndDelete({ _id: req.params.id })
      return res.status(200).json({
        success: true,
        message: 'Delete post successfully',
        postId: req.params.id,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'You only can edit your post',
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// like a post
module.exports.likeAPost = async (req, res) => {
  try {
    await Post.updateOne(
      {
        _id: ObjectId(req.body.postId),
      },
      {
        $addToSet: {
          likes: req.userId,
        },
      }
    )
    return res.status(200).json({
      success: true,
      message: 'Like this post successfully',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// dislike a post
module.exports.dislikeAPost = async (req, res) => {
  try {
    await Post.updateOne(
      {
        _id: ObjectId(req.body.postId),
      },
      {
        $pull: { likes: req.userId },
      }
    )
    return res.status(200).json({
      success: true,
      message: 'dislike this post successfully',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// comment a post
module.exports.commentAPost = async (req, res) => {
  try {
    const { postId, comment, authorId } = req.body
    const newComment = new Comment({
      content: comment,
      user: req.userId,
      postId,
      postUserId: authorId,
    })

    await newComment.save()

    const commentLength = await Comment.countDocuments({ postId: postId })

    await Post.findByIdAndUpdate(
      { _id: postId },
      { commentLength: commentLength }
    )

    return res.status(200).json({
      success: true,
      message: 'comment this post successfully',
      comment: newComment,
      postId: postId,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// remove comment
module.exports.removeComment = async (req, res) => {
  try {
    // check own comment ( chi ban hoac tac gia bai viet moi co the xoa comment)
    const { comments, userId } = await Post.findById(req.body.postId)

    const checkOwnerComment = comments.some(
      (comment) => comment.friendId === req.userId
    )
    const checkAuthor = userId === req.userId ? true : false

    if (checkAuthor || checkOwnerComment) {
      await Post.updateMany(
        { _id: ObjectId(req.body.postId) },
        {
          $pull: {
            comments: {
              _id: req.body.commentId,
            },
          },
        }
      )

      return res.status(200).json({
        success: true,
        message: 'remove comment this post successfully',
      })
    } else {
      // neu k phai chu bai viet hoac chu comment => k dc xoa comment
      return res.status(400).json({
        success: false,
        message: "You cant remove other's comment",
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// get comment by post id
module.exports.getCommentById = async (req, res) => {
  try {
    const currentPost = await Post.findById(req.params.id)
    if (!currentPost) {
      return res.status(400).json({
        success: false,
        message: 'This post not exist',
      })
    }

    const commentList = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', ['name', 'avatar', '_id'])

    if (!commentList) {
      return res.status(400).json({
        success: false,
        message: 'This post not exist',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Get comment by post id success',
      comments: commentList,
      postId: currentPost._id,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}
