const express = require("express");
const router = express.Router();
const passport = require("passport");

//middlewares

const postMiddleware = require("../middleware/post.middleware");
const requestMiddleware = require("../middleware/request.middleware");

//controller

const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
const friendController = require("../controllers/friend.controller");

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

//Friend Routes

router.get(
  "/friends/top-users",
  passport.authenticate("jwt", { session: false }),
  friendController.getTopUsers
);

router.post(
  "/friends/send-request",
  passport.authenticate("jwt", { session: false }),
  friendController.sendFriendRequest
);

router.put(
  "/friends/:requestId",
  passport.authenticate("jwt", { session: false }),
  requestMiddleware,
  friendController.acceptFriendRequest
);

router.delete(
  "/friends/:requestId",
  passport.authenticate("jwt", { session: false }),
  requestMiddleware,
  friendController.deleteFriendRequest
);

module.exports = router;
