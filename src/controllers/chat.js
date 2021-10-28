const { messages } = require('../constants')
const RoomChat = require('../models/RoomChat')
const Message = require('../models/Message')

module.exports.getConversation = async (req, res) => {
  try {
    // get RoomID
    const currentRoomChat = await RoomChat.findOne({
      $and: [{ users: req.userId }, { users: req.params.id }],
    }).populate('[users]')
    if (!currentRoomChat) {
      // create room chat
      const roomChat = new RoomChat({
        users: [req.userId, req.params.id],
      })
      const newRoomChat = await roomChat.save()

      return res.status(200).json({
        success: true,
        message: 'OK',
        roomChat: newRoomChat,
        conversation: [],
      })
    } else {
      // get conversation
      const conversation = await Message.find({ roomId: currentRoomChat._id })
      return res.status(200).json({
        success: true,
        message: 'OK3',
        roomChat: currentRoomChat,
        conversation,
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}
