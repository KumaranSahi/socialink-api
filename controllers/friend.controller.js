const { Friend, User } = require("../models");
const { formatUserFriends, formatSearchUser } = require("../utils/friendUtils");

const getTopUsers = async (req, res) => {
  const user = req.user;
  try {
    const userRequests = await Friend.find({
      from: user._id,
    });
    const receivedRequests = await Friend.find({
      to: user._id,
    });
    let userList = [];
    userRequests.forEach(({ to }) => {
      userList.push(to);
    });
    receivedRequests.forEach(({ from }) => {
      userList.push(from);
    });
    user.friends.forEach((item) => userList.push(item));

    const users = await User.find({ _id: { $nin: userList } })
      .sort({ posts: -1 })
      .limit(10);
    return res.status(200).json({
      ok: true,
      message: "Have some top users",
      data: users
        .filter(({ _id }) => !user._id.equals(_id))
        .map(({ _id, name, image }) => ({
          userId: _id,
          name: name,
          image: image ? image.imageUrl : null,
        })),
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load top users",
    });
  }
};

const sendFriendRequest = async (req, res) => {
  const user = req.user;
  const { linkTo } = req.body;
  try {
    const friendRequest = await Friend.create({
      from: user._id,
      to: linkTo,
    });
    user.sentRequests.push(friendRequest._id);
    await user.save();
    const secondUser = await User.findById(linkTo);
    secondUser.receivedRequests.push(friendRequest._id);
    await secondUser.save();
    return res.status(201).json({
      ok: true,
      message: "Friend Request Sent",
      data: {
        requestId: friendRequest._id,
        toUser: linkTo,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to send friend request",
    });
  }
};

const deleteFriendRequest = async (req, res) => {
  const user = req.user;
  const friendRequest = req.friendRequest;
  const { requestId } = req.params;
  try {
    await user.update({ $pull: { sentRequests: friendRequest._id } });
    await User.findByIdAndUpdate(friendRequest.to, {
      $pull: { receivedRequests: friendRequest._id },
    });
    await friendRequest.remove();
    return res.status(201).json({
      ok: true,
      message: "Friend Request deleted",
      data: requestId,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to delete friend request",
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  const user = req.user;
  const friendRequest = req.friendRequest;
  const { requestId } = req.params;
  try {
    user.friends.push(friendRequest.from);
    await user.save();
    await user.update({
      $pull: { receivedRequests: friendRequest._id },
    });
    const requestSender = await User.findById(friendRequest.from);
    await requestSender.update({
      $pull: { sentRequests: friendRequest._id },
    });
    requestSender.friends.push(friendRequest.to);
    await requestSender.save();
    await friendRequest.remove();
    return res.status(200).json({
      ok: true,
      data: requestId,
      message: "Successfully added friend!",
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to accept friend request",
    });
  }
};

const getUserRequests = async (req, res) => {
  const user = req.user;
  try {
    const populatedUser = await user.execPopulate([
      { path: "sentRequests", populate: { path: "to" } },
      { path: "receivedRequests", populate: { path: "from" } },
    ]);
    const sentRequests = populatedUser.sentRequests.map(
      ({ _id: requestId, to: { _id: userId, name, image } }) => ({
        requestId: requestId,
        userId: userId,
        name: name,
        image: image ? image.imageUrl : null,
      })
    );
    const receivedRequests = populatedUser.receivedRequests.map(
      ({ _id: requestId, from: { _id: userId, name, image } }) => ({
        requestId: requestId,
        userId: userId,
        name: name,
        image: image ? image.imageUrl : null,
      })
    );

    return res.status(200).json({
      ok: true,
      message: "User request",
      data: {
        sentRequests: sentRequests,
        receivedRequests: receivedRequests,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load user requests",
    });
  }
};

const getUserFriends = async (req, res) => {
  const user = req.user;
  try {
    const populatedUser = await user.execPopulate("friends");
    return res.status(200).json({
      ok: true,
      message: "Have some user friends",
      data: formatUserFriends(populatedUser.friends),
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load user friends",
    });
  }
};

const unlinkUser = async (req, res) => {
  const user = req.user;
  const { userId: userToUnlink } = req.params;
  try {
    await user.update({ $pull: { friends: userToUnlink } });
    await User.findByIdAndUpdate(userToUnlink, {
      $pull: { friends: user._id },
    });
    return res.status(201).json({
      ok: true,
      message: "User unlinked",
      data: userToUnlink,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to unlink user",
    });
  }
};

const getUser = async (req, res) => {
  const user = req.user;
  const { userId: requiredUserId } = req.params;
  const isFriend = user.friends.some(
    (friend) => friend.toString() === requiredUserId
  );
  try {
    const requiredUser = await User.findById(requiredUserId);
    let userFriends = [];
    if (!requiredUser.privacy || isFriend) {
      const populatedUser = await requiredUser.execPopulate({
        path: "friends",
      });
      userFriends = formatUserFriends(populatedUser.friends);
    }
    if (isFriend) {
      return res.status(200).json({
        ok: true,
        message: "User found",
        data: {
          foundUserId: requiredUser._id,
          foundUserName: requiredUser.name,
          foundUserImage: requiredUser.image
            ? requiredUser.image.imageUrl
            : null,
          foundUserBio: requiredUser.bio,
          foundUserPostCount: requiredUser.posts.length,
          foundUserFriends: userFriends,
          foundUserFriendsCount: requiredUser.friends.length,
          foundUserPrivacy: requiredUser.privacy,
          friend: {
            friendStatus: "FRIEND",
          },
        },
      });
    }
    const sentRequestPending = await Friend.findOne({
      from: user._id,
      to: requiredUser._id,
    });
    if (sentRequestPending) {
      return res.status(200).json({
        ok: true,
        message: "User found",
        data: {
          foundUserId: requiredUser._id,
          foundUserName: requiredUser.name,
          foundUserImage: requiredUser.image
            ? requiredUser.image.imageUrl
            : null,
          foundUserBio: requiredUser.bio,
          foundUserPostCount: requiredUser.posts.length,
          foundUserFriends: userFriends,
          foundUserFriendsCount: requiredUser.friends.length,
          foundUserPrivacy: requiredUser.privacy,
          friend: {
            friendStatus: "SENT_REQUEST_PENDING",
            requestId: sentRequestPending._id,
          },
        },
      });
    }
    const receivedRequestPending = await Friend.findOne({
      from: requiredUser._id,
      to: user._id,
    });
    if (receivedRequestPending) {
      return res.status(200).json({
        ok: true,
        message: "User found",
        data: {
          foundUserId: requiredUser._id,
          foundUserName: requiredUser.name,
          foundUserImage: requiredUser.image
            ? requiredUser.image.imageUrl
            : null,
          foundUserBio: requiredUser.bio,
          foundUserPostCount: requiredUser.posts.length,
          foundUserFriends: userFriends,
          foundUserFriendsCount: requiredUser.friends.length,
          foundUserPrivacy: requiredUser.privacy,
          friend: {
            friendStatus: "RECEIVED_REQUEST_PENDING",
            requestId: receivedRequestPending._id,
          },
        },
      });
    }
    return res.status(200).json({
      ok: true,
      message: "User found",
      data: {
        foundUserId: requiredUser._id,
        foundUserName: requiredUser.name,
        foundUserImage: requiredUser.image ? requiredUser.image.imageUrl : null,
        foundUserBio: requiredUser.bio,
        foundUserPostCount: requiredUser.posts.length,
        foundUserFriends: userFriends,
        foundUserFriendsCount: requiredUser.friends.length,
        foundUserPrivacy: requiredUser.privacy,
        friendStatus: {
          friendStatus: "STRANGER",
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to load User",
    });
  }
};

const searchUser = async (req, res) => {
  const { userToSearch } = req.params;
  const user = req.user;
  try {
    const searchResults = await User.find({
      name: { $regex: userToSearch.trim(), $options: "i" },
      _id: { $ne: user._id },
    }).sort({ posts: -1 });
    return res.status(200).json({
      ok: true,
      data: formatSearchUser(searchResults),
      message: "These are the user that I could found",
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to search User",
    });
  }
};

module.exports = {
  getTopUsers,
  sendFriendRequest,
  deleteFriendRequest,
  acceptFriendRequest,
  getUserRequests,
  getUserFriends,
  unlinkUser,
  getUser,
  searchUser,
};
