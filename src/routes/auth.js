const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth')
const verifyToken = require('../middlewares/auth')

router.get('/', verifyToken, controller.checkAuth)

// POST api/auth/register => register user(access public)
router.post('/register', controller.register)

// POST api/auth/login => login(access public)
router.post('/login', controller.login)


module.exports = router