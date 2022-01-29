// libs
const ObjectId = require('mongodb').ObjectID
const bcrypt = require('bcryptjs')
    // models
const Post = require('../models/Post')
const User = require('../models/User')
    // constants
const { messages } = require('../constants/index')

// get all user
module.exports.getUserProfile = async(req, res) => {
    try {
        const profile = await User.findOne({ _id: req.params.id })

        const currentUser = await User.findOne({ _id: req.userId })

        const checkFriend = profile.friends.some(
            (id) => JSON.stringify(id) === JSON.stringify(currentUser._id)
        )

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            profile: {
                ...profile._doc,
                isFriend: checkFriend,
            },
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

module.exports.getPostByUserId = async(req, res) => {
    try {
        const myPosts = await Post.find({ user: req.params.id }).populate('user', [
            'name',
            'avatar',
        ])

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            posts: myPosts,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// edit profile
module.exports.editProfile = async(req, res) => {
        // check own profile
        if (req.userId !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: messages.CAN_UPDATE_YOU_PROFILE,
            })
        } else {
            try {
                // doi mat khau
                if (req.body.data.password) {
                    const salt = await bcrypt.genSalt(10)
                    req.body.data.password = await bcrypt.hash(req.body.data.password, salt)
                }
                const profile = await User.findByIdAndUpdate(
                    req.params.id, {
                        $set: req.body.data,
                    }, {
                        new: true,
                    }
                )
                console.log('profile..........', profile)
                return res.status(200).json({
                    success: true,
                    message: messages.UPDATE_SUCCESS,
                    profile,
                })
            } catch (err) {
                throw err
                    // return res.status(500).json({
                    //     success: false,
                    //     message: messages.SERVER_ERROR,
                    // })
            }
        }
    }
    // check password
module.exports.checkPassword = async(req, res) => {
    try {
        const profile = await User.findById(req.userId)

        const isDuplicated = bcrypt.compareSync(req.body.password, profile.password)

        if (isDuplicated) {
            return res.status(200).json({
                success: true,
                message: messages.SUCCESS,
            })
        } else {
            return res.status(400).json({
                success: false,
                message: messages.INVALID_PASSWORD,
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// send add friend request
module.exports.sendFriendRequest = async(req, res) => {
    try {
        if (req.userId === req.body.friendId) {
            return res.status(400).json({
                success: false,
                message: messages.FAILED,
            })
        }

        // user1(you) => add user2 to sendFriendRequests and followings
        const currentUser = await User.findOneAndUpdate({ _id: req.userId }, {
            $addToSet: {
                sendFriendRequests: req.body.friendId,
                followings: req.body.friendId,
            },
        }, { new: true })

        // user2 ==> add user1 to friendRequests and followers
        await User.findOneAndUpdate({ _id: req.body.friendId }, {
            $addToSet: {
                friendRequests: req.userId,
                followers: req.userId,
            },
        })

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user: currentUser,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// cancel send friend request
module.exports.cancelSendFriendRequest = async(req, res) => {
    try {
        // remove send friend request from your send friend request list
        const currentUser = await User.findByIdAndUpdate({ _id: req.userId }, {
            $pull: {
                sendFriendRequests: req.body.friendId,
                followings: req.body.friendId,
            },
        }, { new: true })

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }

        // remove friend request from friend's friend request
        await User.findOneAndUpdate({ _id: req.body.friendId }, {
            $pull: { friendRequests: req.userId, followers: req.userId },
        })

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user: currentUser,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// accept friend request
module.exports.acceptFriendRequest = async(req, res) => {
    try {
        // delete in friendRequest and add to friends
        const user = await User.findOneAndUpdate({ _id: ObjectId(req.userId) }, {
            $addToSet: {
                friends: req.body.friendId,
                followings: req.body.friendId,
                followers: req.body.friendId,
            },
            $pull: { friendRequests: req.body.friendId },
        }, { new: true })

        // add friends
        await User.findOneAndUpdate({ _id: ObjectId(req.body.friendId) }, {
            $addToSet: {
                friends: req.userId,
                followings: req.userId,
                followers: req.userId,
            },
            $pull: { sendFriendRequests: req.userId },
        })

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// cancel friend request
module.exports.cancelFriendRequest = async(req, res) => {
    try {
        const currentUser = await User.findByIdAndUpdate({ _id: req.userId }, {
            $pull: {
                friendRequests: req.body.friendId,
            },
        }, { new: true })

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: messages.USER_NOT_EXIST,
            })
        }

        await User.findOneAndUpdate({ _id: req.body.friendId }, {
            $pull: { sendFriendRequests: req.userId },
        })

        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user: currentUser,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// unfriend
module.exports.unFriend = async(req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: ObjectId(req.userId) }, {
            $pull: {
                friends: req.body.friendId,
                followers: req.body.friendId,
                followings: req.body.friendId,
            },
        }, { new: true })
        await User.findOneAndUpdate({ _id: ObjectId(req.body.friendId) }, {
            $pull: {
                friends: req.userId,
                followers: req.userId,
                followings: req.userId,
            },
        })
        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// follow
module.exports.follow = async(req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: ObjectId(req.userId) }, {
            $addToSet: {
                followings: req.body.friendId,
            },
        }, { new: true })
        await User.findOneAndUpdate({ _id: ObjectId(req.body.friendId) }, {
            $addToSet: {
                followers: req.userId,
            },
        })
        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// follow
module.exports.unfollow = async(req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: ObjectId(req.userId) }, {
            $pull: {
                followings: req.body.friendId,
            },
        }, { new: true })
        await User.findOneAndUpdate({ _id: ObjectId(req.body.friendId) }, {
            $pull: {
                followers: req.userId,
            },
        })
        return res.status(200).json({
            success: true,
            message: messages.SUCCESS,
            user,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}

// change password
module.exports.changePassword = async(req, res) => {
    try {} catch (err) {
        return res.status(500).json({
            success: false,
            message: messages.SERVER_ERROR,
        })
    }
}