const { Post } = require("../models");

// const getAllPosts = async (req, res) => {
//     try{

//     }catch(error){

//     }

// };

const createPost = async (req, res) => {
  const user = req.user;
  const { content, image } = req.body;
  try {
    const newPost = await Post.create({
      content: content,
      image: image,
      by: user._id,
    });
    user.post.push(newPost._id);
    user.save();
    return res.status(201).json({
      ok: true,
      message: "New post created",
      data: {
        content: newPost.content,
        image: newPost.image,
        postId: newPost._id,
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
    await user.update({ $pull: { post: post._id } });
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

module.exports = { createPost, deletePost };
