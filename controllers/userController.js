const { ctrlWrapper, httpError } = require("../helpers");
const { User } = require("../models");
// const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, refreshSecretKey } = require("../configs/configs");

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

  const accessToken = jwt.sign(
    {
      email: user.email,
      id: user._id,
      name: user.name,
    },
    jwtSecretKey,
    { expiresIn: "10m" }
  );

  const refreshToken = jwt.sign(
    {
      email: user.email,
    },
    refreshSecretKey,
    { expiresIn: "1d" }
  );

  await User.findByIdAndUpdate(_id, { token: accessToken }, { new: true });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json(user);
};

const refreshUser = async (req, res) => {
  if (req.cookies?.jwt) {
    const refreshToken = req.cookies.jwt;

    jwt.verify(refreshToken, refreshSecretKey, (err, decoded) => {
      if (err) {
        throw httpError(406, "Unauthorized");
      } else {
        const accessToken = jwt.sign(
          {
            email: decoded.email,
            id: decoded.id,
            name: decoded.name,
          },
          jwtSecretKey,
          { expiresIn: "10m" }
        );
        return res.json({ accessToken });
      }
    });
  }
};

const getCurrentUser = async (req, res) => {
  const { email, name } = req.user;

  res.json({ email, name });
};

module.exports = {
  createUser: ctrlWrapper(createUser),
  loginUser: ctrlWrapper(loginUser),
  refreshUser: ctrlWrapper(refreshUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
};
