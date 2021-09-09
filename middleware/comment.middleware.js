const { Comment } = require("../models");

const commentMiddleware = async (req, res, next) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (comment) {
      req.comment = comment;
      next();
    } else {
      return res.status(404).json({
        ok: false,
        message: "Comment not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Internal server error with fetching like",
    });
  }
};

module.exports = commentMiddleware;
