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
      posts.forEach(
        ({
          _id: postId,
          content,
          image: postImage,
          createdAt,
          likes,
          comments,
          edited,
        }) => {
          const postLikes = [];
          const postComments = [];
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
          comments.forEach(
            ({
              _id: commentId,
              content: commentContent,
              edited: commentEdited,
              by: {
                name: commentUserName,
                image: commentUserImage,
                _id: commentUserId,
                createdAt,
              },
            }) =>
              postComments.push({
                commentId: commentId,
                commentContent: commentContent,
                commentUserName: commentUserName,
                createdAt: createdAt,
                commentUserImage: commentUserImage,
                commentUserId: commentUserId,
                commentEdited: commentEdited,
              })
          );
          feedPosts.push({
            userName: name,
            userImage: image,
            userId: _id,
            postId: postId,
            content: content,
            image: postImage,
            createdAt: createdAt,
            likes: postLikes,
            comments: postComments,
            postEdited: edited,
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
    const userPosts = [];
    populatedUser.posts.forEach(
      ({
        _id: postId,
        content,
        image: postImage,
        createdAt,
        likes,
        comments,
        edited,
      }) => {
        const postLikes = [];
        const postComments = [];
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
        comments.forEach(
          ({
            _id: commentId,
            content: commentContent,
            edited: commentEdited,
            by: {
              name: commentUserName,
              image: commentUserImage,
              _id: commentUserId,
            },
          }) =>
            postComments.push({
              commentId: commentId,
              commentContent: commentContent,
              commentUserName: commentUserName,
              commentUserImage: commentUserImage,
              commentUserId: commentUserId,
              commentEdited: commentEdited,
            })
        );
        userPosts.push({
          postId: postId,
          content: content,
          image: postImage,
          createdAt: createdAt,
          likes: postLikes,
          comments: postComments,
          postEdited: edited,
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

module.exports = {
  createPost,
  deletePost,
  getUserPosts,
  getFeedPosts,
  editPost,
};
