require('dotenv').config()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const registerValidation = require('../validations/auth.register')
const loginValidation = require('../validations/auth.login')

//  check authenticated
module.exports.checkAuth = async (req, res, next) => {

    try {
        const user = await User.findById(req.userId)
        if(!user) return res.status(400).json({
            success: false,
            message: 'Not found user'
        })
        res.json({
            success: true,
            message: 'authenticated',
            user: user
        })

        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// REGISTER
module.exports.register = async (req, res, next) => {
    // validate register
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message,
        body: req.body
    })

    // check email already exist
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).json({
        success: false,
        message: 'Email address already exists',
        body: req.body
    })

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword,
    })

    try {
        const newUser = await user.save()
        // return token
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET)

        res.json({
            success: true,
            message: "Register successfully !",
            accessToken
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            body: req.body
        })
    }
}

// LOGIN

module.exports.login = async (req, res, next) => {

    // validate login
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    })

    try {
        // check email login
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(400).json({
            success: false,
            message: "Incorrect username or password",
            body: req.body
        })

        // check password
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) return res.status(400).json({
            success: false,
            message: "Password invalid!",
            body: req.body
        })

        //create and assign a token
        const accessToken = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET)
        res.json({
            success: true,
            message: "Login successfully !",
            accessToken
        })


    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}