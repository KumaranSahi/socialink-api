const express = require("express");
const router = express.Router();
const passport = require("passport");

//middlewares

const postMiddleware = require("../middleware/post.middleware");

//controller

const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");

//User routes

router.post("/users/signin", userController.signinUser);
router.post("/users/signup", userController.signupUser);
router.post("/users/password", userController.changePassword);
router.put(
  "/users/edit",
  passport.authenticate("jwt", { session: false }),
  userController.editUser
);

//Post Routes

router.get(
  "/posts/user-posts",
  passport.authenticate("jwt", { session: false }),
  postController.getUserPosts
);
router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);
router.post(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  postMiddleware,
  postController.deletePost
);

module.exports = router;
