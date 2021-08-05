require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginValidation = require("../validations/auth.login");
const { ServerError } = require("../constants/request");

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
    ServerError();
  }
};

// REGISTER
module.exports.register = async (req, res) => {
  // check email already exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({
      success: false,
      message: "Email address already exists",
      body: req.body,
    });
  // check phone number
  const phoneExist = await User.findOne({ phone: req.body.phone });
  if (phoneExist)
    return res.status(400).json({
      success: false,
      message: "phone number already used",
      body: req.body,
    });

  // hash password
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });

    const newUser = await user.save();
    // return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.TOKEN_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "Register successfully !",
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
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.TOKEN_SECRET
    );
    return res.status(200).json({
      success: true,
      message: "Login successfully !",
      accessToken,
    });
  } catch (err) {
    ServerError();
  }
};
