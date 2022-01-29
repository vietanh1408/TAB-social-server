const express = require('express')
const router = express.Router()
const controller = require('../controllers/chat')
const verifyToken = require('../middlewares/auth')

// get all conversation
router.get('/', verifyToken, controller.getAllConversation)

// get conversation by roomId
router.get('/get-conversation', verifyToken, controller.getConversation)

// create message
router.post('/', verifyToken, controller.createMessage)

module.exports = router
