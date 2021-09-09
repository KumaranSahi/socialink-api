const { Friend } = require("../models");

const friendMiddleware = async (req, res, next) => {
  const { requestId } = req.params;
  try {
    const friendRequest = await Friend.findById(requestId);
    if (friendRequest) {
      req.friendRequest = friendRequest;
      next();
    } else {
      return res.status(404).json({
        ok: false,
        message: "Friend request not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Internal server error with fetching friend request",
    });
  }
};

module.exports = friendMiddleware;
