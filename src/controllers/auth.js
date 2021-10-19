require('dotenv').config()
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/User')
const { generateCode } = require('../extensions/generate')
const {
  createAccessToken,
  createRefreshToken,
} = require('../helpers/generateToken')

const { google } = require('googleapis')
const { findById } = require('../models/User')
const { OAuth2 } = google.auth

const client = new OAuth2(process.env.GOOGLE_CLIENT_ID)

// check authenticated
module.exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng không tồn tại',
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Vui lòng đăng nhập để tiếp tục',
      user: user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'server error',
    })
  }
}

// CHECK VERIFY CODE
module.exports.checkVerify = async (req, res) => {
  try {
    const correctUser = await User.findOneAndUpdate(
      {
        verifyCode: req.body.code,
        _id: req.userId,
      },
      { $set: { isVerifiedMail: true } },
      { new: true }
    )

    if (!correctUser) {
      return res.status(400).json({
        success: false,
        message: 'Mã code không hợp lêk',
        isVerify: false,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Xác minh thành công',
      isVerify: true,
      user: correctUser,
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
      message: 'Email đã được đăng ký',
    })
  }
  // check phone number
  const phoneExist = await User.findOne({ phone: req.body.phone })
  if (phoneExist) {
    return res.status(400).json({
      success: false,
      message: 'Số diện thoại đã được đăng ký',
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
      process.env.ACCESS_TOKEN_SECRET
    )
    // send mail
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
      to: newUser.email,
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
      await User.updateOne(
        { _id: ObjectId(newUser._id) },
        {
          verifyCode: randomCode,
        }
      )
      return res.status(200).json({
        success: true,
        message: 'Gửi mail thành công',
        accessToken,
        user: newUser,
      })
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
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại không tồn tại',
      })
    }
    // check password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không chính xác',
      })
    }
    //create and assign a token
    const accessToken = await createAccessToken(
      user._id,
      process.env.ACCESS_TOKEN_SECRET
    )
    const refreshToken = await createRefreshToken(
      user._id,
      process.env.REFRESH_TOKEN_SECRET
    )

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
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
      message: 'Đăng xuất thành công',
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

// login with google
module.exports.loginWithGG = async (req, res) => {
  try {
    const { tokenId } = req.body
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { email_verified, email, name, picture } = verify.payload
    const password = email + process.env.GOOGLE_CLIENT_CODE
    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email của bạn chưa được xác thực',
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
          message: 'Mật khẩu không chính xác',
        })
      }
      //create and assign a token
      const accessToken = await createAccessToken(
        user._id,
        process.env.ACCESS_TOKEN_SECRET
      )
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
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
        process.env.ACCESS_TOKEN_SECRET
      )
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập với tài khoản Google thành công',
        accessToken,
        user: newUser,
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
