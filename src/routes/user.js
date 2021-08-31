const express = require('express')
const router = express.Router()
const controller = require('../controllers/user')
const verifyToken = require('../middlewares/auth')

// check match password
router.post('/check-password', verifyToken, controller.checkPassword)

// get friend requests
router.get('/friend-request', verifyToken, controller.getFriendRequest)

// send add friend request
router.post('/send-friend-request', verifyToken, controller.sendFriendRequest)

// accept friend request
router.put(
  '/accept-friend-request',
  verifyToken,
  controller.acceptFriendRequest
)

// get all friend
router.get('/friends', verifyToken, controller.getAllFriend)

// unfriend
router.delete('/unfriend', verifyToken, controller.unFriend)

// eidt profile
router.put('/edit/:id', verifyToken, controller.editProfile)

// get profile
router.get('/:id', verifyToken, controller.getUserProfile)

// get own posts
router.get('/posts', verifyToken, controller.getOwnPost)

module.exports = router
