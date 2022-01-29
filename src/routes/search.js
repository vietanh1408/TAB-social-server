const express = require('express')
const router = express.Router()
const controller = require('../controllers/search')
const verifyToken = require('../middlewares/auth')

router.get('/', verifyToken, controller.search)

module.exports = router