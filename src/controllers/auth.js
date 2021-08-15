require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginValidation = require("../validations/auth.login");
const { generateCode } = require("../extensions/generate");
const { ADMIN_EMAIL } = require("../constants");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const nodemailer = require("nodemailer");

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

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLC: true,
      auth: {
        user: "laizeus1408@gmail.com",
        pass: "vietanh1408",
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    await transporter
      .sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "laizeus1408@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<h1>${randomCode}</h1>`, // html body
      })
      .then((Response) => {
        console.log("res..........", Response);
        return res.status(200).json({
          msg: "Success",
        });
      })
      .catch((err) => {
        console.log("err..........", err);
      });

    // console.log("Message sent: %s", info);

    // return res.status(200).json({
    //   msg: "Success",
    //   info,
    // });

    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: "14081999lva@gmail.com",
    //     pass: "vietanh1408",
    //   },
    // });

    // const msg = {
    //   from: "14081999lva@gmail.com",
    //   to: req.body.email,
    //   subject: "TAB-social - Verify your email contact",
    //   text: "Hello, welcome to TAB-social! Nice to meet you! Please copy this code and paste into verify code input to verify your account",
    //   html: `
    //     <h1>This is your code: ${randomCode}</h1>
    //   `,
    // };
    // // send code to email
    // transporter.sendMail(msg, (err, info) => {
    //   if (err) {
    //     throw err;
    //   }
    //   return res.status(200).json({
    //     msg: "Success",
    //     info,
    //   });
    // });
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

  // check email code
  // if(!req.body.mailCode) {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'You must verify your mail'
  //   })
  // }

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
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
