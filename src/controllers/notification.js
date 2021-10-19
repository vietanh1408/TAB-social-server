const Notification = require('../models/Notification')
const ObjectId = require('mongodb').ObjectID

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

    return res.status(200).json({
      success: true,
      message: 'Tạo thông báo thành công',
      notification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
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
      message: 'Lấy thông báo thành công',
      notifications,
      notificationCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}
