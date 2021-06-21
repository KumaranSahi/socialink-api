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
          likeUserImage: user.image.imageUrl,
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

const addComment = async (req, res) => {
  const user = req.user;
  const post = req.post;
  const { content } = req.body;
  try {
    const comment = await Comment.create({
      content: content,
      by: user._id,
      for: post._id,
    });
    user.comments.push(comment._id);
    await user.save();
    post.comments.push(comment._id);
    await post.save();
    return res.status(201).json({
      ok: true,
      message: "Comment added to post",
      data: {
        comment: {
          commentId: comment._id,
          commentContent: comment.content,
          commentEdited: false,
          createdAt: comment.createdAt,
          commentUserName: user.name,
          commentUserImage: user.image.imageUrl,
          commentUserId: user._id,
        },
        postId: post._id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to add comment ",
    });
  }
};

const editComment = async (req, res) => {
  const user = req.user;
  const comment = req.comment;
  const { content } = req.body;
  try {
    await comment.update({
      content: content,
      edited: true,
    });
    const newComment = await Comment.findById(comment._id);
    return res.status(201).json({
      ok: true,
      message: "Comment has been edited",
      data: {
        comment: {
          commentId: newComment._id,
          commentContent: newComment.content,
          commentEdited: newComment.edited,
          createdAt: newComment.createdAt,
          commentUserName: user.name,
          commentUserImage: user.image.imageUrl,
          commentUserId: user._id,
        },
        postId: comment.for,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to edit comment ",
    });
  }
};

const removeComment = async (req, res) => {
  const user = req.user;
  const comment = req.comment;
  const { commentId } = req.params;
  try {
    await user.update({ $pull: { comment: comment._id } });
    const post = await Post.findById(comment.for);
    await post.update({ $pull: { comment: comment._id } });
    await comment.remove();
    return res.status(201).json({
      ok: true,
      message: "Comment has been edited",
      data: {
        commentId: commentId,
        postId: post._id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to delete comment ",
    });
  }
};

module.exports = {
  addLike,
  removeLike,
  addComment,
  editComment,
  removeComment,
};
