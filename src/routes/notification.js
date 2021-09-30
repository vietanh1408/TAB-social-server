const express = require('express')
const router = express.Router()
const controller = require('../controllers/notification')
const verifyToken = require('../middlewares/auth')

// create notification
router.post('/notify', verifyToken, controller.createNotification)

module.exports = router
