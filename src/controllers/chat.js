const { messages } = require('../constants')
const RoomChat = require('../models/RoomChat')
const Message = require('../models/Message')
const User = require('../models/User')

module.exports.getAllConversation = async (req, res) => {
  try {
    // get all owner room chat
    const roomChats = await RoomChat.find({ users: req.userId }).populate(
      'users',
      'name avatar'
    )

    // get latest message
    const messages = await Message.find({ roomId: { $in: roomChats } })
      .sort({
        createdAt: -1,
      })
      .populate('from', 'name avatar')

    const conversations = roomChats.map((room) => {
      const message = messages.find(
        (message) => JSON.stringify(message.roomId) === JSON.stringify(room._id)
      )
      if (message) {
        return {
          room,
          message,
        }
      }
    })

    return res.status(200).json({
      status: true,
      message: messages.SUCCESS,
      conversations,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}

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

module.exports.createMessage = async (req, res) => {
  try {
    const createRoomChat = async (user, receiver) => {
      const { name } = await User.findById(receiver)
      // create room chat
      const roomChat = new RoomChat({
        users: [user, receiver],
        name,
      })
      await roomChat.save()

      return roomChat
    }

    // get roomId
    let roomId = ''

    if (!req.body.roomId) {
      // create room chat
      roomId = await createRoomChat(req.userId, req.body.receiver)
    } else {
      roomId = await RoomChat.findById(req.body.roomId)
      if (!roomId) {
        // create room chat
        roomId = await createRoomChat(req.userId, req.body.receiver)
      }
    }

    const message = new Message({
      roomId: roomId,
      from: req.userId,
      to: [req.body.receiver],
      message: req.body.message,
      isRead: false,
    })

    const newMessage = await message.save()

    return res.status(201).json({
      success: false,
      message: messages.CREATE_SUCCESS,
      newMessage: newMessage,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}
