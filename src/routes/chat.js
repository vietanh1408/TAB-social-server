const express = require('express')
const router = express.Router()
const controller = require('../controllers/chat')
const verifyToken = require('../middlewares/auth')

// get conversation by roomId
router.get('/:id', verifyToken, controller.getConversation)

// create message
router.post('/', verifyToken, controller.createMessage)

module.exports = router
