require('dotenv').config()
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const { messages } = require('../../constants')
const { generateCode } = require('../../extensions/generate')
const User = require('../../models/User')

module.exports.sendVerifiedEmail = async (user) => {
  try {
    const randomCode = generateCode(6)
    const smtpTransport = await nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    })
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: messages.VERIFIED_SUBJECT,
      text: `${messages.VERIFIED_TEXT} ${randomCode}`,
    }
    await smtpTransport.sendMail(mailOptions, async (err, response) => {
      if (err) {
        return messages.SERVER_ERROR
      }
      await User.updateOne(
        { _id: ObjectId(user._id) },
        {
          verifyCode: randomCode,
        }
      )
      return user
    })
  } catch (err) {
    return messages.SERVER_ERROR
  }
}
