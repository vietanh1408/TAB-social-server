require('dotenv').config()
const nodemailer = require('nodemailer')
const { messages } = require('../../constants')

module.exports.sendVerifiedEmail = async (job) => {
    try {
        const { email, code } = job.data
        const smtpTransport = await nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: messages.VERIFIED_SUBJECT,
            text: `${messages.VERIFIED_TEXT} ${code}`,
        }

        await smtpTransport.sendMail(mailOptions, async (error, response) => {
            if (error) {
                throw error
            }
        })
    } catch (error) {
        return error
    }
}