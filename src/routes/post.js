const express = require('express')
const router = express.Router()
const controller = require('../controllers/post')
const verifyToken = require('../middlewares/auth')

// get all posts
router.get('/', verifyToken, controller.index)

// create a post
router.post('/', verifyToken, controller.createPost)

// like a post
router.post('/like', verifyToken, controller.likeAPost)

// dislike a post
router.post('/dislike', verifyToken, controller.dislikeAPost)

// comment a post
router.post('/comment', verifyToken, controller.commentAPost)

// delete a comment
router.post('/remove-comment', verifyToken, controller.removeComment)

// get comment by post id
router.get('/comments/:id', verifyToken, controller.getCommentById)

// edit post
router.patch('/:id', verifyToken, controller.editPost)

// delete post
router.delete('/:id', verifyToken, controller.deletePost)

// get one post
router.get('/:id', verifyToken, controller.getPostById)

module.exports = router
