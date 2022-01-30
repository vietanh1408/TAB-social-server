// libs
const environments = require('../constants/environment')
const bcrypt = require('bcryptjs')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const client = new OAuth2(environments.GOOGLE_CLIENT_ID)
    // models
const User = require('../models/User')
    // helpers
const { createAccessToken } = require('../helpers/generateToken')
    // constants
const { messages } = require('../constants/index')
const { queues } = require('../jobs/queues/index')

// check authenticated
module.exports.checkAuth = async(req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }
        return res.status(200).json({
            success: true,
            message: messages.AUTHENTICATION_ERROR,
            user: user,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// CHECK VERIFY CODE
module.exports.checkVerify = async(req, res) => {
    try {
        const correctUser = await User.findOneAndUpdate({
            verifyCode: req.body.code,
            _id: req.userId,
        }, { $set: { isVerifiedMail: true } }, { new: true })

        if (!correctUser) {
            return res.status(400).json({
                success: false,
                message: messages.INVALID_CODE,
                isVerify: false,
            })
        }

        return res.status(200).json({
            success: true,
            message: messages.VERIFY_SUCCESS,
            isVerify: true,
            user: correctUser,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// REGISTER
module.exports.register = async(req, res) => {
    // check email already exist
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) {
        return res.status(400).json({
            success: false,
            message: messages.EMAIL_ALREADY_USED,
        })
    }
    // check phone number
    const phoneExist = await User.findOne({ phone: req.body.phone })
    if (phoneExist) {
        return res.status(400).json({
            success: false,
            message: message.PHONE_ALREADY_USED,
        })
    }
    // hash password
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt)

    try {
        // create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        })
        const newUser = await user.save()
            // return token
        const accessToken = await createAccessToken(
            newUser._id,
            environments.ACCESS_TOKEN_SECRET
        )

        const result = await queues.processSendVerifiedEmail.add(newUser)

        console.log('result........', result)

        return res.status(200).json({
            success: true,
            message: messages.SEND_MAIL_SUCCESS,
            accessToken,
            user: result.data,
        })

        // if (!result || result.data === messages.SERVER_ERROR) {
        //     return res.status(500).json({
        //         success: false,
        //         message: messages.SERVER_ERROR,
        //     })
        // } else {

        // }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// LOGIN
module.exports.login = async(req, res) => {
    try {
        // check email login
        const user = await User.findOne({
            $or: [{ email: req.body.emailOrPhone }, { phone: req.body.emailOrPhone }],
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: messages.EMAIL_OR_PHONE_NUMBER_NOT_EXIST,
            })
        }
        // check password
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: messages.INVALID_PASSWORD,
            })
        }
        //create and assign a token
        const accessToken = await createAccessToken(
            user._id,
            environments.ACCESS_TOKEN_SECRET
        )

        return res.status(200).json({
            success: true,
            message: messages.LOGIN_SUCCESS,
            accessToken,
            user,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// LOGOUT
module.exports.logout = async(req, res) => {
    try {
        res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' })
        return res.status(200).json({
            success: true,
            message: messages.LOGOUT_SUCCESS,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// refresh token
module.exports.refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// login with google
module.exports.loginWithGG = async(req, res) => {
    try {
        const { tokenId } = req.body
        const verify = await client.verifyIdToken({
            idToken: tokenId,
            audience: environments.GOOGLE_CLIENT_ID,
        })
        const { email_verified, email, name, picture } = verify.payload
        const password = email + environments.GOOGLE_CLIENT_CODE
            // hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        if (!email_verified) {
            return res.status(400).json({
                success: false,
                message: messages.EMAIL_NOT_VERIFIED,
            })
        }
        // check da ton tai user trong DB chua
        const user = await User.findOne({ email })
            // da co user
        if (user) {
            // check password
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    message: messages.INVALID_PASSWORD,
                })
            }
            //create and assign a token
            const accessToken = await createAccessToken(
                user._id,
                environments.ACCESS_TOKEN_SECRET
            )
            return res.status(200).json({
                success: true,
                message: messages.LOGIN_SUCCESS,
                accessToken,
                user,
            })
        } else {
            // create new user
            const user = new User({
                name,
                email,
                avatar: {
                    url: picture,
                    publicId: '',
                },
                password: hashPassword,
                isVerifiedMail: true,
            })
            const newUser = await user.save()
                // return token
            const accessToken = await createAccessToken(
                newUser._id,
                environments.ACCESS_TOKEN_SECRET
            )
            return res.status(200).json({
                success: true,
                message: messages.LOGIN_SUCCESS,
                accessToken,
                user: newUser,
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// forgot password
module.exports.forgotPassword = async(req, res) => {
    try {
        // check user exist
        const currentUser = await User.findOne({ email: req.body.email })
        if (!currentUser) {
            return res.status(400).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }

        // send verified code to email
        const result = await queues.processSendVerifiedEmail.add(currentUser)
        if (!result || result.data === messages.SERVER_ERROR) {
            return res.status(500).json({
                success: false,
                message: messages.SERVER_ERROR,
            })
        } else {
            return res.status(200).json({
                success: true,
                message: messages.SEND_MAIL_SUCCESS,
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// check change password code
module.exports.checkChangePasswordCode = async(req, res) => {
    try {
        // check valid code
        const currentUser = await User.findOne({ verifyCode: req.body.code })
        if (!currentUser) {
            return res.status(400).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}