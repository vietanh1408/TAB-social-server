// libs
const ObjectId = require('mongodb').ObjectID
// models
const Notification = require('../models/Notification')
// constants
const { messages } = require('../constants/index')

module.exports.createNotification = async (req, res) => {
  try {
    // check duplicate notification
    await Notification.findOneAndDelete({
      text: req.body.text,
    })

    const newNotification = new Notification({
      sender: req.userId,
      receivers: [req.body.receivers],
      url: req.body.url,
      text: req.body.text,
      image: req.body.image,
      isRead: false,
    })

    await newNotification.save()

    const notification = await Notification.findOne({
      _id: newNotification._id,
    }).populate('sender', ['name', 'avatar'])

    return res.status(201).json({
      success: true,
      message: messages.CREATE_SUCCESS,
      notification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}

module.exports.getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receivers: ObjectId(req.userId),
    })
      .sort({ createdAt: -1 })
      .populate('sender', ['name', 'avatar'])
    const notificationCount = await Notification.countDocuments({
      receivers: ObjectId(req.userId),
      isRead: false,
    })
    return res.status(200).json({
      success: true,
      message: messages.SUCCESS,
      notifications,
      notificationCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}

module.exports.readNotification = async (req, res) => {
  try {
    const currentNotification = await Notification.findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      {
        isRead: req.body.isRead,
      },
      { new: true }
    ).populate('sender', ['name', 'avatar'])

    if (!currentNotification) {
      return res.status(400).json({
        success: false,
        message: messages.NOTIFICATION_NOT_EXIST,
      })
    }

    const notificationCount = await Notification.countDocuments({
      receivers: ObjectId(req.userId),
      isRead: false,
    })

    return res.status(200).json({
      success: true,
      message: messages.SUCCESS,
      notification: currentNotification,
      notificationCount,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}
