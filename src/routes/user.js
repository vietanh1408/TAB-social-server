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

// cancel send add friend request
router.post(
  '/cancel-send-friend-request',
  verifyToken,
  controller.cancelSendFriendRequest
)

// accept friend request
router.put(
  '/accept-friend-request',
  verifyToken,
  controller.acceptFriendRequest
)

// unfriend
router.put('/unfriend', verifyToken, controller.unFriend)

// follow
router.put('/follow', verifyToken, controller.follow)

// un follow
router.put('/unfollow', verifyToken, controller.unfollow)

// edit profile
router.put('/:id', verifyToken, controller.editProfile)

// get profile
router.get('/:id', verifyToken, controller.getUserProfile)

// get own posts
router.get('/posts', verifyToken, controller.getOwnPost)

module.exports = router
