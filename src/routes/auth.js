const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth')
const verifyToken = require('../middlewares/auth')

router.get('/', verifyToken, controller.checkAuth)

// register
router.post('/register', controller.register)

// login
router.post('/login', controller.login)

// send mail to verify email
router.post('/send-mail', verifyToken, controller.sendMail)

// check verify code
router.post('/check-verify', verifyToken, controller.checkVerify)

// logout
router.get('/logout', verifyToken, controller.logout)

// refresh token
router.post('/refresh-token', controller.refreshToken)

module.exports = router
