const express = require("express");
const router = express.Router();
const passport = require("passport");

//middlewares

const postMiddleware = require("../middleware/post.middleware");
const requestMiddleware = require("../middleware/request.middleware");
const likeMiddleware = require("../middleware/like.middleware");
const commentMiddleware = require("../middleware/comment.middleware");

//controller

const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
const friendController = require("../controllers/friend.controller");
const likesAndCommentsController = require("../controllers/likeAndComment.controller");

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
  "/posts",
  passport.authenticate("jwt", { session: false }),
  postController.getFeedPosts
);

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

router.delete(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  postMiddleware,
  postController.deletePost
);

router.put(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  postMiddleware,
  postController.editPost
);

//Friend Routes

router.get(
  "/friends/requests",
  passport.authenticate("jwt", { session: false }),
  friendController.getUserRequests
);

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

router.get(
  "/friends",
  passport.authenticate("jwt", { session: false }),
  friendController.getUserFriends
);

// Likes Routes

router.put(
  "/likes/:postId",
  passport.authenticate("jwt", { session: false }),
  postMiddleware,
  likesAndCommentsController.addLike
);

router.delete(
  "/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  likeMiddleware,
  likesAndCommentsController.removeLike
);

//Comment Routes

router.post(
  "/comments/:postId",
  passport.authenticate("jwt", { session: false }),
  postMiddleware,
  likesAndCommentsController.addComment
);

router.put(
  "/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  commentMiddleware,
  likesAndCommentsController.editComment
);

router.delete(
  "/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  commentMiddleware,
  likesAndCommentsController.removeComment
);

module.exports = router;
