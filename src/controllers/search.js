const { messages } = require('../constants')
const RoomChat = require('../models/RoomChat')
const Message = require('../models/Message')
const User = require('../models/User')
const Post = require('../models/Post')

module.exports.search = async(req, res) => {
    try {
        const { keyword } = req.query || {}

        let searchResult = {
            users: [],
            posts: [],
            count: 0,
        }

        const searchUser = await User.find({ name: { $regex: keyword } }, { name: 1, avatar: 1 })

        const countUser = await User.countDocuments({ name: { $regex: keyword } })

        console.log('countUser...', countUser)

        if (searchUser && searchUser.length > 0)
            searchResult.users.push(...searchUser)

        const searchPost = await Post.find({
            description: { $regex: keyword },
            isPublic: true,
        }, {
            description: 1,
            image: 1,
            likeLength: 1,
            commentLength: 1,
        }).populate('user', ['id', 'name', 'avatar'])

        if (searchPost && searchPost.length > 0)
            searchResult.posts.push(...searchPost)

        return res.status(200).json({
            status: true,
            message: messages.SUCCESS,
            result: searchResult,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}