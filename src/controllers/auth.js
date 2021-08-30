require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const loginValidation = require("../validations/auth.login");
const { generateCode } = require("../extensions/generate");
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const nodemailer = require("nodemailer");
const {
  createAccessToken,
  createRefreshToken,
} = require("../helpers/generateToken");

//  check authenticated
module.exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Not found user",
      });
    }
    return res.status(200).json({
      success: true,
      message: "authenticated",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// send mail
module.exports.sendMail = async (req, res) => {
  try {
    const randomCode = generateCode(6);
    const smtpTransport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Invoices due",
      text: `Mã xác thực tài khoản TAB-social của bạn là ${randomCode}`,
    };

    smtpTransport.sendMail(mailOptions, (err, res) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Server error",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "send mail success",
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REGISTER
module.exports.register = async (req, res) => {
  // check email already exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).json({
      success: false,
      message: "Email address already exists",
    });
  }

  // check phone number
  const phoneExist = await User.findOne({ phone: req.body.phone });
  if (phoneExist) {
    return res.status(400).json({
      success: false,
      message: "phone number already used",
    });
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      isVerifiedMail: true,
    });

    const newUser = await user.save();
    // return token
    const accessToken = await createAccessToken(
      newUser._id,
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = await createRefreshToken(
      newUser._id,
      process.env.REFRESH_TOKEN_SECRET
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh-token",
      maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Register successfully",
      accessToken,
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGIN
module.exports.login = async (req, res) => {
  // validate login
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  try {
    // check email login
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Incorrect username or password",
      });

    // check password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).json({
        success: false,
        message: "Password invalid!",
      });

    //create and assign a token
    const accessToken = await createAccessToken(
      user._id,
      process.env.ACCESS_TOKEN_SECRET
    );
    const refreshToken = await createRefreshToken(
      user._id,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log("accessToken..............", accessToken);

    return res.status(200).json({
      success: true,
      message: "Login successfully !",
      accessToken,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// LOGOUT
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// refresh token
module.exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
