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
            likeUserImage: likeUserImage ? likeUserImage.imageUrl : null,
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
            commentUserImage: commentUserImage
              ? commentUserImage.imageUrl
              : null,
            commentUserId: commentUserId,
            commentEdited: commentEdited,
          })
      );
      userPosts.push({
        userName: name,
        userImage: image ? image.imageUrl : null,
        postUserId: _id,
        postId: postId,
        content: content,
        image: postImage ? postImage.imageUrl : null,
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
