const { ctrlWrapper, httpError } = require("../helpers");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { accessTokenKey, refreshTokenKey } = require("../configs/configs");

const createUser = async (req, res) => {
  const { email, password, name } = req.body;

  if (await User.exists({ email })) throw httpError(409, "Email in use");
  if (!name || !password) throw httpError(401, "Fill all the fields");

  const result = await User.create({
    name,
    email,
    password,
  });

  result.password = undefined;
  res.status(201).json({ user: result, message: "New user was created" });
};

const loginUser = async (req, res) => {
  const cookies = req.cookies;

  const { email, password } = req.body;

  const foundUser = await User.findOne({ email });
  if (!foundUser || !password)
    throw httpError(401, "Email or password is wrong");

  const isEqual = await foundUser.checkPassword(password, foundUser.password);
  if (!isEqual) throw httpError(401, "Password does not match");

  if (isEqual) {
    const roles = Object.values(foundUser.roles).filter(Boolean);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          name: foundUser.name,
          roles: roles,
        },
      },
      accessTokenKey,
      { expiresIn: "30m" }
    );
    const newRefreshToken = jwt.sign(
      { name: foundUser.name },
      refreshTokenKey,
      { expiresIn: "1d" }
    );

    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      if (!foundToken) {
        console.log("attempted refresh token reuse at login!");
        newRefreshTokenArray = [];
        throw httpError(204, "Token was not found");
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    foundUser.password = undefined;
    foundUser.refreshToken = undefined;

    const sendData = {
      foundUser,
      accessToken: accessToken,
    };

    res.json(sendData);
  }
};

const refreshUserToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    jwt.verify(refreshToken, refreshTokenKey, async (err, decoded) => {
      if (err) throw httpError(403, "Unsuccessful decoding, error");
      const hackedUser = await User.findOne({
        name: decoded.name,
      }).exec();
      hackedUser.refreshToken = [];
      await hackedUser.save();
    });
    return httpError(403, "User was not found after decoding");
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  jwt.verify(refreshToken, refreshTokenKey, async (err, decoded) => {
    if (err) {
      foundUser.refreshToken = [...newRefreshTokenArray];
      await foundUser.save();
    }
    if (err || foundUser.name !== decoded.name)
      return httpError(403, "User name is not equal saved name");

    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          name: foundUser.name,
          roles: roles,
        },
      },
      accessTokenKey,
      { expiresIn: "5s" }
    );

    const newRefreshToken = jwt.sign(
      { name: foundUser.name },
      refreshTokenKey,
      { expiresIn: "1d" }
    );
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    foundUser.refreshToken = undefined;
    foundUser.password = undefined;

    res.json({ accessToken, foundUser });
  });
};

const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  let { body } = req;

  if (body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    body.password = hashedPassword;
  }

  try {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = Object.values(updatedUser.roles).filter(Boolean);
    const accessToken = jwt.sign(
      { UserInfo: { name: updatedUser.name, roles: roles } },
      accessTokenKey,
      { expiresIn: "30m" }
    );
    const newRefreshToken = jwt.sign(
      { name: updatedUser.name },
      refreshTokenKey,
      { expiresIn: "1d" }
    );

    let newRefreshTokenArray = updatedUser.refreshToken;
    if (req.cookies?.jwt) {
      const refreshToken = req.cookies.jwt;
      newRefreshTokenArray = newRefreshTokenArray.filter(
        (rt) => rt !== refreshToken
      );
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    updatedUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await updatedUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      name: updatedUser.name,
      roles: updatedUser.roles,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the user." });
  }
};

module.exports = {
  createUser: ctrlWrapper(createUser),
  loginUser: ctrlWrapper(loginUser),
  refreshUserToken: ctrlWrapper(refreshUserToken),
  logoutUser: ctrlWrapper(logoutUser),
  updateUser: ctrlWrapper(updateUser),
};
