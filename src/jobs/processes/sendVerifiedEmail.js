require('dotenv').config()
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const { messages } = require('../../constants')
const { generateCode } = require('../../extensions/generate')
const User = require('../../models/User')

module.exports.sendVerifiedEmail = async(job) => {
    try {
        const user = job.data
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
        await smtpTransport.sendMail(mailOptions, async(err, response) => {
            console.log('run.................0', err)
            if (err) {
                throw messages.SERVER_ERROR
            }
            return true
                // await User.findByIdAndUpdate(user._id, {
                //         $set: {
                //             verifyCode: randomCode,
                //         },
                //     })
                // await User.findByIdAndUpdate(user._id, {
                //     verifyCode: randomCode,
                // })
        })
    } catch (err) {
        return messages.SERVER_ERROR
    }
}