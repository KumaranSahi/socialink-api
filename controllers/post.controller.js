const { Post, User } = require("../models");

const getFeedPosts = async (req, res) => {
  const user = req.user;
  try {
    const feedPosts = [];
    const populatedUser = await user.execPopulate({
      path: "friends",
      populate: { path: "posts", options: { sort: { createdAt: -1 } } },
    });
    populatedUser.friends.forEach(({ name, image, posts }) => {
      posts.forEach(({ _id: postId, content, image: postImage, createdAt }) => {
        feedPosts.push({
          userName: name,
          userImage: image,
          postId: postId,
          postContent: content,
          postImage: postImage,
          createdAt: createdAt,
        });
      });
    });

    return res.status(200).json({
      ok: true,
      message: "Have some feed posts",
      data: feedPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load feed posts",
    });
  }
};

const getUserPosts = async (req, res) => {
  const user = req.user;
  try {
    const populatedUser = await user.execPopulate("posts");
    return res.status(200).json({
      ok: true,
      message: "Have your posts",
      data: populatedUser.posts.map(({ content, image, createdAt, _id }) => ({
        content,
        image,
        createdAt,
        postId: _id,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load user posts",
    });
  }
};

const createPost = async (req, res) => {
  const user = req.user;
  const { content, image } = req.body;
  try {
    const newPost = await Post.create({
      content: content,
      image: image,
      by: user._id,
    });
    user.posts.push(newPost._id);
    user.save();
    return res.status(201).json({
      ok: true,
      message: "New post created",
      data: {
        content: newPost.content,
        image: newPost.image,
        postId: newPost._id,
        createdAt: newPost.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to create post please try again later",
    });
  }
};

const deletePost = async (req, res) => {
  const user = req.user;
  const post = req.post;
  try {
    await user.update({ $pull: { posts: post._id } });
    await user.save();
    await post.remove();
    return res.status(201).json({
      ok: true,
      message: "Post has been deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to delete post please try again later",
    });
  }
};

module.exports = { createPost, deletePost, getUserPosts, getFeedPosts };
