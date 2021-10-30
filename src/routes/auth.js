const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth')
const verifyToken = require('../middlewares/auth')

router.get('/', verifyToken, controller.checkAuth)

// register
router.post('/register', controller.register)

// login
router.post('/login', controller.login)

// login with google
router.post('/google-login', controller.loginWithGG)

// check verify code
router.post('/check-verify', verifyToken, controller.checkVerify)

// logout
router.get('/logout', verifyToken, controller.logout)

// refresh token
router.post('/refresh-token', controller.refreshToken)

// forgot password
router.post('/forgot-password', controller.forgotPassword)

// check code to change password
router.post('/check-change-password-code', controller.checkChangePasswordCode)

module.exports = router
