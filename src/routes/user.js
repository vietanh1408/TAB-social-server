const express = require('express')
const router = express.Router()
const controller = require('../controllers/user')
const verifyToken = require('../middlewares/auth')

// GET api/user/posts => get your posts (access public)
router.get('/posts', verifyToken, controller.getOwnPost)

router.get('/posts/:id', verifyToken, controller.getPostById)

router.put('/posts/:id', verifyToken, controller.editPost)

router.delete('/posts/:id', verifyToken, controller.deletePost)

module.exports = router