const { ctrlWrapper, httpError } = require("../helpers");
const { User } = require("../models");
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

  const result = await User.findByIdAndUpdate(
    _id,
    { token: refreshToken },
    { new: true }
  );

  result.password = undefined;

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken: accessToken,
  });
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
  if (!req.cookies?.jwt) {
    throw httpError(401, "No token provided");
  }

  const refreshToken = req.cookies.jwt;
  const decoded = jwt.verify(refreshToken, refreshSecretKey);
  const user = await User.findOne({ email: decoded.email });

  if (!user) {
    throw httpError(404, "User not found");
  }

  res.json({
    name: user.name,
    email: user.email,
  });
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) throw httpError(401, "No refresh token provided");
  const decoded = jwt.verify(refreshToken, refreshSecretKey);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  await User.findOneAndUpdate({ email: decoded.email }, { token: null });

  res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  createUser: ctrlWrapper(createUser),
  loginUser: ctrlWrapper(loginUser),
  refreshUser: ctrlWrapper(refreshUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  logoutUser: ctrlWrapper(logoutUser),
};
