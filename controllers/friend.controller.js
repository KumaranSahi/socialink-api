const { Friend, User } = require("../models");

const getTopUsers = async (req, res) => {
  const user = req.user;
  try {
    const userRequests = await Friend.find({
      from: user._id,
    });
    const recievedRequests = await Friend.find({
      to: user._id,
    });
    let userList = [];
    userRequests.forEach(({ to }) => {
      userList.push(to);
    });
    recievedRequests.forEach(({ from }) => {
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
          image: image,
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
    secondUser.recievedRequests.push(friendRequest._id);
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
      $pull: { recievedRequests: friendRequest._id },
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
      $pull: { recievedRequests: friendRequest._id },
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
      { path: "recievedRequests", populate: { path: "from" } },
    ]);
    const sentRequests = populatedUser.sentRequests.map(
      ({ _id: requestId, to: { _id: userId, name, image } }) => ({
        requestId: requestId,
        userId: userId,
        name: name,
        image: image,
      })
    );
    const recievedRequests = populatedUser.recievedRequests.map(
      ({ _id: requestId, from: { _id: userId, name, image } }) => ({
        requestId: requestId,
        userId: userId,
        name: name,
        image: image,
      })
    );

    return res.status(200).json({
      ok: true,
      message: "User request",
      data: {
        sentRequests: sentRequests,
        recievedRequests: recievedRequests,
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

module.exports = {
  getTopUsers,
  sendFriendRequest,
  deleteFriendRequest,
  acceptFriendRequest,
  getUserRequests,
};
