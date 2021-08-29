require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const loginValidation = require("../validations/auth.login");
const { generateCode } = require("../extensions/generate");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

    const msg = {
      from: "14081999lva@gmail.com",
      to: req.body.email,
      subject: "TAB-social - Verify your email contact",
      text: "Hello, welcome to TAB-social! Nice to meet you! Please copy this code and paste into verify code input to verify your account",
      html: `
        <h1>This is your code: ${randomCode}</h1>
      `,
    };
    // send code to email
    sgMail.send(msg, (err, info) => {
      if (err) {
        console.log("err...............", err);
      } else {
        return res.status(200).json({
          msg: "Success",
          info,
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
      body: req.body,
    });
  }

  // check phone number
  const phoneExist = await User.findOne({ phone: req.body.phone });
  if (phoneExist) {
    return res.status(400).json({
      success: false,
      message: "phone number already used",
      body: req.body,
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
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      body: req.body,
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
        body: req.body,
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
        body: req.body,
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
