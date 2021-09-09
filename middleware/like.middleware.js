const { Like } = require("../models");

const likeMiddleware = async (req, res, next) => {
  const { likeId } = req.params;
  try {
    const like = await Like.findById(likeId);
    if (like) {
      req.like = like;
      next();
    } else {
      return res.status(404).json({
        ok: false,
        message: "Like not found",
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

module.exports = likeMiddleware;
