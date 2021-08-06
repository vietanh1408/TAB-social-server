const express = require("express");
const router = express.Router();
const controller = require("../controllers/post");
const verifyToken = require("../middlewares/auth");

// GET api/post => get all posts(private access token)
router.get("/", verifyToken, controller.index);

// POST api/post/create => create a post (private access token)
router.post("/create", verifyToken, controller.createPost);

// like a post
router.post("/like", verifyToken, controller.likeAPost);

// dislike a post
router.delete("/dislike", verifyToken, controller.dislikeAPost);

// comment a post
router.post("/comment", verifyToken, controller.commentAPost);

// delete a comment
router.delete("/remove-comment", verifyToken, controller.removeComment);

// PUT api/posts/edit/:id
router.put("/edit/:id", verifyToken, controller.editPost);

// DELETE api/posts/delete/:id
router.delete("/delete/:id", verifyToken, controller.deletePost);

// GET api/post/:id => get one post(private access token)
router.get("/:id", verifyToken, controller.getPostById);

module.exports = router;
