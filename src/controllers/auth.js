require('dotenv').config()
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/User')
const loginValidation = require('../validations/auth.login')
const { generateCode } = require('../extensions/generate')
const {
  createAccessToken,
  createRefreshToken,
} = require('../helpers/generateToken')

//  check authenticated
module.exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Not found user',
      })
    }
    return res.status(200).json({
      success: true,
      message: 'authenticated',
      user: user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// send mail
module.exports.sendMail = async (req, res) => {
  console.log('req.body...', req.body)
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
      to: req.body.email,
      subject: 'Mã xác thực tài khoản TAB-social',
      text: `Mã xác thực tài khoản TAB-social của bạn là ${randomCode}`,
    }

    smtpTransport.sendMail(mailOptions, async (err, response) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Server error',
        })
      }

      console.log('code....', randomCode)
      await User.updateOne(
        { _id: ObjectId(req.userId) },
        {
          verifyCode: randomCode,
        }
      )
      return res.status(200).json({
        success: true,
        message: 'send mail success',
      })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

// CHECK VERIFY CODE
module.exports.checkVerify = async (req, res) => {
  try {
    const isMatchCode = await User.findOne({ verifyCode: req.body.code })

    if (!isMatchCode) {
      return res.status(400).json({
        success: false,
        message: 'Code is invalid',
      })
    }

    await User.findOneAndUpdate(
      { verifyCode: req.body.code },
      {
        isVerifiedMail: true,
      }
    )

    return res.status(200).json({
      success: true,
      message: 'Verify email success',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

// REGISTER
module.exports.register = async (req, res) => {
  // check email already exist
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) {
    return res.status(400).json({
      success: false,
      message: 'Email address already exists',
    })
  }

  // check phone number
  const phoneExist = await User.findOne({ phone: req.body.phone })
  if (phoneExist) {
    return res.status(400).json({
      success: false,
      message: 'phone number already used',
    })
  }

  // hash password
  const salt = await bcrypt.genSalt(10)
  req.body.password = await bcrypt.hash(req.body.password, salt)

  try {
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
      process.env.ACCESS_TOKEN_SECRET
    )

    const refreshToken = await createRefreshToken(
      newUser._id,
      process.env.REFRESH_TOKEN_SECRET
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/api/auth/refresh-token',
      maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      success: true,
      message: 'Register successfully',
      accessToken,
      user: newUser,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// LOGIN
module.exports.login = async (req, res) => {
  try {
    // check email login
    const user = await User.findOne({
      $or: [{ email: req.body.emailOrPhone }, { phone: req.body.emailOrPhone }],
    })
    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Sai tên đăng nhập hoặc mật khẩu',
      })

    // check password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword)
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không chính xác',
      })

    //create and assign a token
    const accessToken = await createAccessToken(
      user._id,
      process.env.ACCESS_TOKEN_SECRET
    )
    const refreshToken = await createRefreshToken(
      user._id,
      process.env.REFRESH_TOKEN_SECRET
    )

    console.log('accessToken..............', accessToken)

    return res.status(200).json({
      success: true,
      message: 'Login successfully',
      accessToken,
      user,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// LOGOUT
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' })
    return res.status(200).json({
      success: true,
      message: 'Logout successfully',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// refresh token
module.exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
