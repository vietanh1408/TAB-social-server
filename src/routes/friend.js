const express = require('express')
const router = express.Router()
const controller = require('../controllers/friend')
const verifyToken = require('../middlewares/auth')
// get all friend
router.get('/', verifyToken, controller.getAllFriend)

module.exports = router
