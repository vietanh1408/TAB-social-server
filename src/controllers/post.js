// libs
const ObjectId = require('mongodb').ObjectID
    // models
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')
    // constants
const { messages } = require('../constants/index')
    // extensions
const deleteImageFromCloudinary = require('../extensions/deleteImage')
const Pagination = require('../extensions/pagination')

// get all post of friend
module.exports.index = async(req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.userId }, { followings: 1, _id: 1 })
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

        const postLength = await Post.countDocuments({ user: [...followings, _id] })

        const result = posts.map((post) => {
            const checkOwn = JSON.stringify(post.user._id) === JSON.stringify(_id)
            const checkLiked = post.likes.some(
                (id) => JSON.stringify(id) === JSON.stringify(currentUser._id)
            )
            return {
                ...post._doc,
                isYour: checkOwn,
                isLiked: checkLiked,
            }
        })

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            posts: result,
            postLength,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// get post by id
module.exports.getPostById = async(req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.userId }, { _id: 1 })

        const post = await Post.findOne({ _id: ObjectId(req.params.id) })
            .populate('user', ['name', 'avatar'])
            .populate('comment')
        if (!post) {
            return res.status(404).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        const checkLiked = post.likes.some(
            (id) => JSON.stringify(id) === JSON.stringify(currentUser._id)
        )

        const checkOwnPost =
            JSON.stringify(post.user) === JSON.stringify(currentUser._id)
        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            post: {
                ...post._doc,
                isYours: checkOwnPost,
                isLiked: checkLiked,
            },
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// create post
module.exports.createPost = async(req, res) => {
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
        return res.status(201).json({
            success: true,
            message: messages.CREATE_SUCCESS,
            post: post,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// edit post
module.exports.editPost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }
        // check own post
        if (post.user != req.userId) {
            return res.status(400).json({
                success: false,
                message: messages.CAN_UPDATE_YOUR_POST,
            })
        }
        // delete previous image
        await deleteImageFromCloudinary(post)

        // edit post
        const editedPost = await Post.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true }
        ).populate('user', ['name', 'avatar'])

        return res.status(200).json({
            success: true,
            message: messages.UPDATE_SUCCESS,
            post: editedPost,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// delete post
module.exports.deletePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }
        // check own post
        if (post.user == req.userId) {
            await Post.findByIdAndDelete({ _id: req.params.id })
            await deleteImageFromCloudinary(post)

            return res.status(200).json({
                success: true,
                message: messages.DELETE_SUCCESS,
                postId: req.params.id,
            })
        } else {
            return res.status(400).json({
                success: false,
                message: messages.CAN_UPDATE_YOUR_POST,
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// like a post
module.exports.likeAPost = async(req, res) => {
    try {
        const currentPost = await Post.findOne({ _id: ObjectId(req.body.postId) }, { _id: 1, likeLength: 1 })

        if (!currentPost) {
            return res.status(500).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        const updatedPost = await Post.findByIdAndUpdate({
            _id: ObjectId(currentPost._id),
        }, {
            $addToSet: {
                likes: req.userId,
            },
            $set: {
                likeLength: currentPost.likeLength + 1,
            },
        }, {
            new: true,
        })
        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            post: updatedPost,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// dislike a post
module.exports.dislikeAPost = async(req, res) => {
    try {
        const currentPost = await Post.findOne({ _id: ObjectId(req.body.postId) }, { _id: 1, likeLength: 1 })

        if (!currentPost) {
            return res.status(500).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        const updatedPost = await Post.findByIdAndUpdate({
            _id: ObjectId(req.body.postId),
        }, {
            $pull: { likes: req.userId },
            $set: {
                likeLength: currentPost.likeLength - 1,
            },
        }, {
            new: true,
        })

        console.log('dislike....', updatedPost)

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            post: updatedPost,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// comment a post
module.exports.commentAPost = async(req, res) => {
    try {
        const { postId, comment, authorId } = req.body

        const currentPost = await Post.findOne({ _id: ObjectId(postId) }, { _id: 1, commentLength: 1 })
        console.log('req.body.....', req.body)

        if (!currentPost) {
            return res.status(500).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        const newComment = new Comment({
            content: comment,
            user: req.userId,
            postId,
            postUserId: authorId,
        })

        const commentDoc = await newComment.save()

        const user = await User.findById(req.userId)

        console.log('comment...', commentDoc)

        const updatedPost = await Post.findByIdAndUpdate({
            _id: ObjectId(currentPost._id),
        }, {
            $addToSet: {
                comments: ObjectId(commentDoc._id),
            },
            $set: {
                commentLength: currentPost.commentLength + 1,
            },
        }, {
            new: true,
        })

        console.log('updatedPost....', updatedPost)

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            comment: Object.assign(newComment, { user }),
            postId: postId,
            post: updatedPost,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// remove comment
module.exports.removeComment = async(req, res) => {
    try {
        // check own comment ( chi ban hoac tac gia bai viet moi co the xoa comment)
        const { comments, userId } = await Post.findById(req.body.postId)

        const checkOwnerComment = comments.some(
            (comment) => comment.friendId === req.userId
        )
        const checkAuthor = userId === req.userId ? true : false

        if (checkAuthor || checkOwnerComment) {
            await Post.updateMany({ _id: ObjectId(req.body.postId) }, {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            })

            return res.status(200).json({
                success: true,
                message: messages.SUCCESS,
            })
        } else {
            // neu k phai chu bai viet hoac chu comment => k dc xoa comment
            return res.status(400).json({
                success: false,
                message: messages.FAILED,
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// get comment by post id
module.exports.getCommentById = async(req, res) => {
    try {
        const currentPost = await Post.findById(req.params.id)

        if (!currentPost) {
            return res.status(404).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        const commentQuery = new Pagination(
            Comment.find({ postId: req.params.id }),
            req.query
        ).paginating()

        const commentList = await commentQuery.query
            .sort({ createdAt: -1 })
            .populate('user', ['name', 'avatar', '_id'])

        if (!commentList) {
            return res.status(404).json({
                success: false,
                message: messages.POST_NOT_EXIST,
            })
        }

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            post: {
                ...currentPost._doc,
                comments: commentList,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}