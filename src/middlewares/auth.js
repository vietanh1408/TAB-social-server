require('dotenv').config()
const jwt = require('jsonwebtoken')
const { messages } = require('../constants')

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(401).json({
      success: false,
      message: messages.AUTHENTICATION_ERROR,
    })

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    req.userId = decodedToken.userId
    next()
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: messages.SERVER_ERROR,
    })
  }
}

module.exports = verifyToken
