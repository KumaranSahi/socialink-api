const { Post, Like, User } = require("../models");
const { getPostContentLikesAndComments } = require("../utils/postUtils");
const { cloudinary } = require("../config/cloudinary");

const getFeedPosts = async (req, res) => {
  const user = req.user;
  try {
    let feedPosts = [];
    const populatedUser = await user.execPopulate({
      path: "friends",
      populate: {
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: "likes",
            options: { sort: { createdAt: -1 } },
            populate: { path: "by" },
          },
          {
            path: "comments",
            options: { sort: { createdAt: -1 } },
            populate: { path: "by" },
          },
        ],
      },
    });
    populatedUser.friends.forEach(({ _id, name, image, posts }) => {
      feedPosts = [
        ...feedPosts,
        ...getPostContentLikesAndComments(posts, {
          _id,
          name,
          image,
        }),
      ];
    });
    const sortedPosts = feedPosts.sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({
      ok: true,
      message: "Have some feed posts",
      data: sortedPosts,
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
      populate: [
        {
          path: "likes",
          options: { sort: { createdAt: -1 } },
          populate: { path: "by" },
        },
        {
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: { path: "by" },
        },
      ],
    });
    const userPosts = getPostContentLikesAndComments(populatedUser.posts, {
      name: user.name,
      image: user.image,
      _id: user._id,
    });
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
    let uploadInfo;
    let imageData;
    if (image) {
      uploadInfo = await cloudinary.uploader.upload(image);
      imageData = {
        public_id: uploadInfo.public_id,
        imageUrl: uploadInfo.url,
      };
    }
    const newPost = await Post.create({
      content: content,
      image: imageData,
      by: user._id,
    });
    user.posts.push(newPost._id);
    await user.save();
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
  const { postId } = req.params;
  try {
    post.likes.forEach(async (likeId) => {
      const like = await Like.findById(likeId);
      await User.findByIdAndUpdate(like.by, { $pull: { likes: like._id } });
      await like.remove();
    });
    await user.update({ $pull: { posts: post._id } });
    await user.save();
    if (post.image.public_id)
      await cloudinary.uploader.destroy(post.image.public_id);
    await post.remove();
    return res.status(201).json({
      ok: true,
      data: postId,
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

const editPost = async (req, res) => {
  const post = req.post;
  const { content } = req.body;
  try {
    await post.update({
      content: content,
      edited: true,
    });
    return res.status(201).json({
      message: "Post has been edited successfully",
      ok: true,
      data: {
        content: content,
        postId: post._id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to edit post please try again later",
    });
  }
};

const getLoadedUserPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const loadedUser = await User.findById(userId);
    const populatedLoadedUser = await loadedUser.execPopulate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
      populate: [
        {
          path: "likes",
          options: { sort: { createdAt: -1 } },
        },
        {
          path: "comments",
          options: { sort: { createdAt: -1 } },
        },
      ],
    });
    const userPosts = getPostContentLikesAndComments(
      populatedLoadedUser.posts,
      {
        _id: populatedLoadedUser._id,
        name: populatedLoadedUser.name,
        image: populatedLoadedUser.image,
      }
    );
    return res.status(200).json({
      ok: true,
      message: "Have some user posts",
      data: userPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load user posts please try again later",
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getUserPosts,
  getFeedPosts,
  editPost,
  getLoadedUserPosts,
};
