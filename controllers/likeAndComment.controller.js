const { Like, Comment, Post } = require("../models");

const addLike = async (req, res) => {
  const user = req.user;
  const post = req.post;
  try {
    const like = await Like.create({
      by: user._id,
      for: post._id,
    });
    post.likes.push(like._id);
    await post.save();
    user.likes.push(like._id);
    await user.save();
    return res.status(201).json({
      ok: true,
      message: "Like added",
      data: {
        like: {
          likeId: like._id,
          likeUserName: user.name,
          likeUserImage: user.image,
          likeUserId: user._id,
        },
        postId: post._id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to like post",
    });
  }
};

const removeLike = async (req, res) => {
  const user = req.user;
  const like = req.like;
  const { likeId } = req.params;
  try {
    await user.update({ $pull: { likes: like._id } });
    const post = await Post.findById(like.for);
    await post.update({ $pull: { likes: like._id } });
    await like.remove();
    return res.status(200).json({
      ok: true,
      message: "Like deleted successfully",
      data: { likeId: likeId, postId: post._id },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to remove like ",
    });
  }
};

module.exports = { addLike, removeLike };
