const { messages } = require('../constants')
const RoomChat = require('../models/RoomChat')
const Message = require('../models/Message')
const User = require('../models/User')
const Post = require('../models/Post')
const Pagination = require('../extensions/pagination')

module.exports.search = async(req, res) => {
    try {
        const { keyword, type } = req.query || {}

        let searchResult = {
            users: [],
            posts: [],
            totalUser: 0,
            totalPost: 0,
        }

        if (!type || type === 'User') {
            const searchUserQuery = new Pagination(
                User.find({ name: { $regex: keyword } }),
                req.query
            ).paginating()

            const currentUser = await User.findOne({ _id: req.userId }, { _id: 1 })

            const searchUser = await searchUserQuery.query.sort({ name: -1 })

            const users = searchUser.map((user) => {
                const checkFriend = user.friends.some(
                    (friendId) => friendId == currentUser._id
                )
                if (checkFriend) {
                    return {
                        ...user._doc,
                        isFriend: true,
                    }
                }
                return {
                    ...user._doc,
                    isFriend: false,
                }
            })

            const countUser = await User.countDocuments({ name: { $regex: keyword } })

            searchResult.totalUser = countUser

            if (users && users.length > 0) {
                searchResult.users.push(...users)
            }
        }
        if (type === 'Post') {
            const searchPostQuery = new Pagination(
                Post.find({
                    description: { $regex: keyword },
                    isPublic: true,
                }),
                req.query
            ).paginating()

            const searchPost = await searchPostQuery.query
                .sort({ createdAt: -1 })
                .populate('user', ['id', 'name', 'avatar'])

            const countPost = await Post.countDocuments({
                description: { $regex: keyword },
                isPublic: true,
            })

            searchResult.totalPost = countPost

            if (searchPost && searchPost.length > 0) {
                searchResult.posts.push(...searchPost)
            }
        }

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