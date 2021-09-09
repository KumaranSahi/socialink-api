const formatUserFriends = (friends) =>
  friends.map(({ _id, name, image }) => ({
    friendId: _id,
    friendName: name,
    friendImage: image ? image.imageUrl : null,
  }));

const formatSearchUser = (users) =>
  users.map(({ _id, name, image }) => ({
    searchUserId: _id,
    searchUserName: name,
    searchUserImage: image ? image.imageUrl : null,
  }));

module.exports = { formatUserFriends, formatSearchUser };
