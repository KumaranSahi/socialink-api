const getPostContentLikesAndComments = (posts, { name, image, _id }) => {
  const userPosts = [];
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
      userPosts.push({
        userName: name,
        userImage: image,
        postUserId: _id,
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
  return userPosts;
};

module.exports = { getPostContentLikesAndComments };
