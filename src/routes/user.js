const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const verifyToken = require("../middlewares/auth");

// check match password
router.post("/check-password", verifyToken, controller.checkPassword);

// GET api/user/friend-request => get friend request
router.get("/friend-request", verifyToken, controller.getFriendRequest);

// POST api/user/addfriend/:id => send add friend request
router.post("/send-friend-request", verifyToken, controller.sendFriendRequest);

router.put("/edit/:id", verifyToken, controller.editProfile);

router.get("/:id", verifyToken, controller.getUserProfile);

// GET api/user/posts => get your posts (access public)
router.get("/posts", verifyToken, controller.getOwnPost);

module.exports = router;
