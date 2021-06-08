const { Friend, User } = require("../models");

const getTopUsers = async (req, res) => {
  const user = req.user;
  try {
    const users = await User.find().sort({ posts: -1 }).limit(10);
    return res.status(200).json({
      ok: true,
      message: "Have some top users",
      data: users.filter(({ _id })=>!user._id.equals(_id)).map(({ _id, name, image }) => ({
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

module.exports = { getTopUsers };
