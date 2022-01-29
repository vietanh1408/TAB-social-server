const express = require('express')
const router = express.Router()
const controller = require('../controllers/notification')
const verifyToken = require('../middlewares/auth')

// get notification
router.get('/', verifyToken, controller.getNotification)

// create notification
router.post('/', verifyToken, controller.createNotification)

// read notification
router.patch('/:id', verifyToken, controller.readNotification)

module.exports = router
