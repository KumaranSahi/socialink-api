const { Post, Like, User } = require("../models");

const getFeedPosts = async (req, res) => {
  const user = req.user;
  try {
    const feedPosts = [];
    const populatedUser = await user.execPopulate({
      path: "friends",
      populate: {
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "likes",
          options: { sort: { createdAt: -1 } },
          populate: { path: "by" },
        },
      },
    });
    populatedUser.friends.forEach(({ name, image, posts }) => {
      posts.forEach(
        ({ _id: postId, content, image: postImage, createdAt, likes }) => {
          const postLikes = [];
          likes.forEach(
            ({
              _id: likeId,
              by: { name: likeUserName, image: likeUserImage, _id: likeUserId },
            }) =>
              postLikes.push({
                likeId: likeId,
                likeUserName: likeUserName,
                likeUserImage: likeUserImage,
                likeUserId: likeUserId,
              })
          );
          feedPosts.push({
            userName: name,
            userImage: image,
            postId: postId,
            content: content,
            image: postImage,
            createdAt: createdAt,
            likes: postLikes,
          });
        }
      );
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
    const populatedUser = await user.execPopulate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "likes",
        options: { sort: { createdAt: -1 } },
        populate: { path: "by" },
      },
    });
    const userPosts = [];
    populatedUser.posts.forEach(
      ({ _id: postId, content, image: postImage, createdAt, likes }) => {
        const postLikes = [];
        likes.forEach(
          ({
            _id: likeId,
            by: { name: likeUserName, image: likeUserImage, _id: likeUserId },
          }) =>
            postLikes.push({
              likeId: likeId,
              likeUserName: likeUserName,
              likeUserImage: likeUserImage,
              likeUserId: likeUserId,
            })
        );
        userPosts.push({
          postId: postId,
          content: content,
          image: postImage,
          createdAt: createdAt,
          likes: postLikes,
        });
      }
    );

    return res.status(200).json({
      ok: true,
      message: "Have your posts",
      data: userPosts,
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
    post.likes.forEach(async (likeId) => {
      const like = await Like.findById(likeId);
      await User.findByIdAndUpdate(like.by, { $pull: { likes: like._id } });
      await like.remove();
    });
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
