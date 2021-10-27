const User = require('../models/User')
const { messages } = require('../constants/index')

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
