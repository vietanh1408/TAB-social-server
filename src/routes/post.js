const express = require('express')
const router = express.Router()
const controller = require('../controllers/post')
const verifyToken = require('../middlewares/auth')

// GET api/post => get all posts(private access token)
router.get('/', verifyToken, controller.index)

// GET api/post/:id => get one post(private access token)
router.get('/:id', verifyToken, controller.getPostById)

// POST api/post/create => create a post (private access token)
router.post('/create', verifyToken, controller.createPost)

module.exports = router