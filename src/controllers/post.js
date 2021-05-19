const Post = require('../models/Post')
const postValidation = require('../validations/post.create')
const ObjectId = require('mongodb').ObjectID

module.exports.index = async (req, res, next) => {

    try {
        const posts = await Post.find().populate('user', ['name', 'avatar']).sort({ 'createAt': -1 })
        res.json({
            success: true,
            message: "get all posts successfully",
            posts: posts
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }

}

module.exports.getPostById = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id)
        const post = await Post.findOne({ _id: id }).populate('user', ['name', 'avatar'])
        res.json({
            success: true,
            message: "get post by id successfully",
            post: post
        })


    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

module.exports.createPost = async (req, res, next) => {

    const { title, description, image, status, user, reaction, comment } = req.body

    // validate create post
    const { error } = postValidation(req.body)
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    })

    try {

        const newPost = new Post({
            title,
            description,
            image,
            status,
            user: req.userId,
            reaction: [],
            comment: []
        })

        await newPost.save()

        res.json({
            success: true,
            message: "create a new post successfully",
            post: newPost,
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}