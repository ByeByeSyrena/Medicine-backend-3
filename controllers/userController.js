const { ctrlWrapper, httpError } = require("../helpers");
const { User } = require("../models");
// const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("../configs/configs");

const createUser = async (req, res) => {
  const { email, password, name } = req.body;

  if (await User.exists({ email })) throw httpError(409, "Email in use");
  if (!name) throw httpError(401, "Fill all the fields");

  const result = await User.create({
    name,
    email,
    password,
  });

  result.password = undefined;
  res.status(201).json(result);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw httpError(401, "Email or password is wrong");

  const isEquel = await user.checkPassword(password, user.password);
  if (!isEquel) throw httpError(401, "Email or password is wrong");

  const { _id } = user;

  jwt.sign(
    { email: user.email, id: user._id, name: user.name },
    jwtSecretKey,
    { expiresIn: "1h" },
    async (err, token) => {
      if (err) throw httpError(400, "Authorization failed");

      const result = await User.findByIdAndUpdate(
        _id,
        { token },
        { new: true }
      );
      result.password = undefined;

      res.cookie("token", token).json(result);
    }
  );
};

module.exports = {
  createUser: ctrlWrapper(createUser),
  loginUser: ctrlWrapper(loginUser),
};
