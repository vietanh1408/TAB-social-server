const Post = require('../models/Post')
const ObjectId = require('mongodb').ObjectID
const postValidation= require('../validations/post.create')

module.exports.getOwnPost = async (req, res, next) => {
    try {
        const myPosts = await Post.find({ user: req.userId }).populate('user', ['name', 'avatar'])

        res.json({
            success: true,
            message: 'get your posts successfully',
            posts: myPosts
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }
}

module.exports.getPostById = async (req, res, next) => {
    try {

        const id = ObjectId(req.params.id)

        const post = await Post.findOne({ _id: id })

        res.json({
            success: true,
            message: 'get post successfully',
            post: post
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }
}

module.exports.editPost = async (req, res, next) => {

    const { title, description, image, status, reaction, comment } = req.body

    
    let editedPost = {
        title,
        description,
        image,
        status,
        reaction,
        comment
    }
    const {error} = postValidation(editedPost)
    if(error) return res.status(400).json({
        success: false,
        error: error.details[0].message
    })

    try {

        const condition = {_id: req.params.id, user: req.userId}
        
        editedPost = await Post.findOneAndUpdate(condition, editedPost, {new: true})

        if(!editedPost) return res.status(401).json({
            success: false,
            error: 'Post not found'
        })

        res.json({
            success: true,
            message: 'Edit post successfully',
            post: editedPost
        })

    }catch (err) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }

}

module.exports.deletePost = async(req, res, next) => {

    try{

        const condition = {_id: req.params.id, user: req.userId}
        const deletedPost = await Post.findOneAndDelete(condition)

        if(!deletedPost) return res.status(401).json({
            success: false,
            error: 'Post not found'
        })

        res.json({
            success: true,
            message: 'Delete post successfully',
            post: deletedPost
        })

    }catch(err) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }
}