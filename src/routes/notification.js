const express = require('express')
const router = express.Router()
const controller = require('../controllers/notification')
const verifyToken = require('../middlewares/auth')

// get notification
router.get('/', verifyToken, controller.getNotification)

// create notification
router.post('/', verifyToken, controller.createNotification)

module.exports = router
