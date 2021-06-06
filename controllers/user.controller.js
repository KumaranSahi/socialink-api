const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  emailIdCheck,
  hashingPasswords,
  confirmPasswordCheck,
} = require("../utils/userUtils");
const { User } = require("../models");

const signupUser = async (req, res) => {
  const { name, email, password, image, DOB } = req.body;
  let data = null;
  if (!name && !email && !password && !emailIdCheck(email)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid Request",
    });
  }
  try {
    if (await User.findOne({ email: email })) {
      return res.status(409).json({
        ok: false,
        message: "User Already exists in the system",
      });
    }
    const newPassword = await hashingPasswords(password);
    data = await User.create({
      name: name,
      email: email,
      password: newPassword,
      image: image,
      DOB: new Date(DOB),
      privacy: false,
    });
    if (data) {
      return res.status(201).json({
        ok: true,
        message: "User Added Successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Internal error please try again later",
    });
  }
};

const changePassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    if (confirmPasswordCheck(password, confirmPassword)) {
      return res.status(405).json({
        ok: false,
        message: "Passwords are invalid",
      });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      const newPassword = await hashingPasswords(password);
      await user.update({ password: newPassword });
      return res.status(200).json({
        ok: true,
        message: "Password Updated Successfully",
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "invalid Email ID",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to update password please try again later",
    });
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        ok: false,
        message: "Invalid username or password",
      });
    }
    return res.status(200).json({
      message: "Sign in successful, here is your token, please keep it safe!",
      ok: true,
      data: {
        token: jwt.sign({ userId: user._id }, process.env["SECRET"], {
          expiresIn: "24h",
        }),
        userName: user.name,
        image: user.image,
        userId: user._id,
        bio: user.bio,
        privacy: user.privacy,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

const editUser = async (req, res) => {
  const user = req.user;
  const { name, bio, password, privacy } = req.body;
  try {
    if (password) {
      const newPassword = await hashingPasswords(password);
      await user.update({
        name: name,
        bio: bio,
        password: newPassword,
        privacy: privacy,
      });
    } else {
      await user.update({
        name: name,
        bio: bio,
        privacy: privacy,
      });
    }
    await user.save();
    const newUser = await User.findById(user._id);
    return res.status(201).json({
      message: "User details updated",
      ok: true,
      data: {
        name: newUser.name,
        bio: newUser.bio,
        privacy: newUser.privacy,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: "Unable to edit user please try again later",
    });
  }
};

module.exports = { signinUser, changePassword, signupUser, editUser };
