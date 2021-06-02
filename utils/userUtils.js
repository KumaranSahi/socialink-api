const bcrypt = require("bcrypt");

const emailIdCheck = (email) =>
  new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$").test(email);

const hashingPasswords = async (password) => {
  const salt = await bcrypt.genSalt(8);
  return bcrypt.hashSync(password, salt);
};

const confirmPasswordCheck = (password, confirmPassword) =>
  !password || !confirmPassword || password !== confirmPassword;

module.exports = { emailIdCheck, hashingPasswords, confirmPasswordCheck };
