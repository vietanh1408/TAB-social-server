require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {

    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({
        success: false,
        message: "Access token not found"
    })

    try {

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)

        req.userId = decodedToken.userId
        next()
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Interal server error"
        })
    }

}

module.exports = verifyToken