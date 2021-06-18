const formatUserFriends = (friends) =>
  friends.map(({ _id, name, image }) => ({
    friendId: _id,
    friendName: name,
    friendImage: image,
  }));

  module.exports={formatUserFriends }