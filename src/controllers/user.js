const Post = require("../models/Post");
const User = require("../models/User");
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcryptjs");

// get all user
module.exports.getUserProfile = async (req, res) => {
  try {
    const profile = await User.findOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "get your profile successfully",
      profile: profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

module.exports.getOwnPost = async (req, res) => {
  try {
    const myPosts = await Post.find({ user: req.userId }).populate("user", [
      "name",
      "avatar",
    ]);

    return res.status(200).json({
      success: true,
      message: "get your posts successfully",
      posts: myPosts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// get friend Request
module.exports.getFriendRequest = async (req, res) => {
  try {
    const pageIndex = Number(req.body.pageIndex || 0);
    const pageSize = Number(req.body.pageSize || 12);
    const skip = (pageIndex - 1) * pageSize;

    const { friendRequests } = await User.findOne(
      {
        _id: ObjectId(req.userId),
      },
      { friendRequests: { $slice: [skip, pageSize] } }
    );

    return res.status(200).json({
      success: true,
      message: "get friend request successfully",
      friendRequests: friendRequests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// get all friend
module.exports.getAllFriend = async (req, res) => {
  try {
    const { friends } = await User.findById(req.userId);

    return res.status(200).json({
      success: true,
      message: "Get all friend successfully",
      friends,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// edit profile
module.exports.editProfile = async (req, res) => {
  // check own profile
  if (req.userId !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "You only can edit your profile",
    });
  } else {
    try {
      // doi mat khau
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json({
        success: true,
        message: "update profile successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};
// check password
module.exports.checkPassword = async (req, res) => {
  try {
    const profile = await User.findById(req.userId);

    const isDuplicated = bcrypt.compareSync(
      req.body.password,
      profile.password
    );

    if (isDuplicated) {
      return res.status(200).json({
        success: true,
        message: "password is matched",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "password not match",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// send add friend request
module.exports.sendFriendRequest = async (req, res) => {
  try {
    if (req.userId === req.body.friendId) {
      return res.status(400).json({
        success: false,
        message: "You cant send friend request your self",
      });
    }
    const profile = await User.findById(req.userId);
    const friend = await User.findById(req.body.friendId);

    if (!profile || !friend) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // add to DB
    if (profile.sendFriendRequests.includes(req.body.friendId)) {
      return res.status(400).json({
        success: false,
        message: "You have already send friend request",
      });
    } else {
      await User.findByIdAndUpdate(req.userId, {
        $push: { sendFriendRequests: req.body.friendId },
      });
    }

    // send friend request to friend
    await User.findByIdAndUpdate(req.body.friendId, {
      $push: { friendRequests: req.userId },
    });

    return res.status(200).json({
      success: true,
      message: "Send Friend Request successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// accept friend request
module.exports.acceptFriendRequest = async (req, res) => {
  try {
    // delete in friendRequest and add to friends
    await User.updateMany(
      { _id: ObjectId(req.userId) },
      {
        $addToSet: {
          friends: req.body.friendId,
          followings: req.body.friendId,
          followers: req.body.friendId,
        },
        $pull: { friendRequests: req.body.friendId },
      }
    );

    // add friends
    await User.updateMany(
      { _id: ObjectId(req.body.friendId) },
      {
        $addToSet: {
          friends: req.userId,
          followings: req.userId,
          followers: req.userId,
        },
        $pull: { sendFriendRequests: req.userId },
      }
    );

    return res.status(200).json({
      success: true,
      message: "add friend successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// unfriend
module.exports.unFriend = async (req, res) => {
  try {
    await User.updateMany(
      { _id: ObjectId(req.userId) },
      {
        $pull: {
          friends: req.body.friendId,
          followers: req.body.friendId,
          followings: req.body.friendId,
        },
      }
    );
    await User.updateMany(
      { _id: ObjectId(req.body.friendId) },
      {
        $pull: {
          friends: req.userId,
          followers: req.userId,
          followings: req.userId,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "unfriend successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
