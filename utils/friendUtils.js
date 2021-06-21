const formatUserFriends = (friends) =>
  friends.map(({ _id, name, image }) => ({
    friendId: _id,
    friendName: name,
    friendImage: image.imageUrl,
  }));

const formatSearchUser = (users) =>
  users.map(({ _id, name, image }) => ({
    searchUserId: _id,
    searchUserName: name,
    searchUserImage: image.imageUrl,
  }));

module.exports = { formatUserFriends, formatSearchUser };
