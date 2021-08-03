const express = require("express");
const router = express.Router();
const controller = require("../controllers/post");
const verifyToken = require("../middlewares/auth");

// GET api/post => get all posts(private access token)
router.get("/", verifyToken, controller.index);

// POST api/post/create => create a post (private access token)
router.post("/create", verifyToken, controller.createPost);

// PUT api/posts/edit/:id
router.put("/edit/:id", verifyToken, controller.editPost);

// DELETE api/posts/delete/:id
router.delete("/delete/:id", verifyToken, controller.deletePost);

// GET api/post/:id => get one post(private access token)
router.get("/:id", verifyToken, controller.getPostById);

module.exports = router;
