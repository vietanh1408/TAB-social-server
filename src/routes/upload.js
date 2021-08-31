const router = require('express').Router()
const controller = require('../controllers/upload')
const verifyToken = require('../middlewares/auth')

router.post('/upload', verifyToken, controller.upload)

router.delete('/remove-upload', verifyToken, controller.removeFileUpload)

module.exports = router
