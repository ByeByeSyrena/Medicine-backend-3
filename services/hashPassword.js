const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

module.exports = {
  hashPassword,
};

// compare method for User you can find in User model, there is also hashing while login happens
