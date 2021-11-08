const User = require('../models/User')
const ObjectId = require('mongodb').ObjectID
const { messages } = require('../constants/index')
const Pagination = require('../extensions/pagination')

// get all friend
module.exports.getAllFriend = async (req, res) => {
  try {
    const { friends } = await User.findById(req.userId).populate('friends', [
      'name',
      'avatar',
    ])

    return res.status(200).json({
      success: true,
      message: messages.SUCCESS,
      friends,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}

// get friend Request
module.exports.getFriendRequest = async (req, res) => {
  try {
    const query = new Pagination(
      User.findOne({ _id: ObjectId(req.userId) }),
      req.query
    ).paginating()

    const { friendRequests } = await query.query
      .sort({ createdAt: -1 })
      .populate('friendRequests', 'name avatar')

    const total = await User.countDocuments({ _id: ObjectId(req.userId) })

    return res.status(200).json({
      success: true,
      message: messages.SUCCESS,
      friendRequests: friendRequests,
      total,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}
