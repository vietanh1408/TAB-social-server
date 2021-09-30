const Notification = require('../models/Notification')

module.exports.createNotification = async (req, res) => {
  try {
    const { id, receivers, url, text, content, image } = req.body
    if (receivers.includes(req.userId.toString())) return

    console.log('req.body.............', req.body)

    // const notification = new Notification({
    //     id, receivers, url, text, content, image, user: req.userId
    // })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}
