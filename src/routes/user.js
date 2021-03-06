const express = require('express')
const router = express.Router()
const controller = require('../controllers/user')
const verifyToken = require('../middlewares/auth')

// check match password
router.post('/check-password', verifyToken, controller.checkPassword)

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

router.put(
  '/cancel-friend-request',
  verifyToken,
  controller.cancelFriendRequest
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
router.get('/:id/posts', verifyToken, controller.getPostByUserId)

// change password
router.patch('/change-password', controller.changePassword)

module.exports = router
