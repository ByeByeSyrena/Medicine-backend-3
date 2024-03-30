const bcrypt = require("bcrypt");

const { httpError } = require("../../helpers");
const { User } = require("../../models");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../tokenAndCookieServices/tokenService");

const {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} = require("../tokenAndCookieServices/cookieUtils");

const {
  findUserByEmail,
  updateRefreshTokenArray,
  prepareSendData,
  handleUserTokens,
  rewriteUpdatedUserTokens,
} = require("./userOperationComponents");

const { hashPassword } = require("../hashPassword");

async function createUserInDB(data) {
  const { email, password, name } = data;

  if (await User.exists({ email })) throw httpError(409, "Email in use");
  if (!name || !password) throw httpError(401, "Fill all the fields");

  const result = await User.create({
    name,
    email,
    password,
  });

  result.password = undefined;
  return result;
}

const loginUserOperation = async (req, res) => {
  const cookies = req.cookies;

  const { email, password } = req.body;

  const foundUser = await findUserByEmail(email);

  const isEqual = await foundUser.checkPassword(password, foundUser.password);

  if (!isEqual) throw httpError(401, "Password does not match");

  if (isEqual) {
    const accessToken = generateAccessToken(foundUser);
    const newRefreshToken = generateRefreshToken(foundUser);

    await updateRefreshTokenArray(cookies, foundUser, newRefreshToken, res);

    setRefreshTokenCookie(res, newRefreshToken);

    const sendData = prepareSendData(foundUser, accessToken);

    return sendData;
  }
};

const refreshUserTokensOperation = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  clearRefreshTokenCookie(res);

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    await handleUserNotFoundAfterDecoding(refreshToken);
  }

  const tokens = await handleUserTokens(foundUser, refreshToken, res);

  const sendData = prepareSendData(foundUser, tokens.accessToken);

  return sendData;
};

const logoutUserOperation = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    clearRefreshTokenCookie(res);
    return res.sendStatus(204);
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  await foundUser.save();

  clearRefreshTokenCookie(res);

  return;
};

const updateUserOperation = async (req, res) => {
  const { id } = req.params;
  let { body } = req;

  if (body.password) {
    body.password = await hashPassword(body.password);
  }

  const updatedUser = await User.findOneAndUpdate({ _id: id }, body, {
    new: true,
  });

  if (!updatedUser) {
    return res.status(404).send({ message: "User not found" });
  }

  const { accessToken, newRefreshTokenArray } = await rewriteUpdatedUserTokens(
    updatedUser,
    req.cookies?.jwt,
    res
  );

  updatedUser.refreshToken = newRefreshTokenArray;
  await updatedUser.save();

  return { updatedUser, accessToken };
};

const deleteUserOperation = async (req, res) => {
  const { id } = req.params;

  const result = await User.findOneAndDelete({ _id: id });

  if (!result) throw httpError(404, "User not found");

  clearRefreshTokenCookie(res);

  return result;
};

module.exports = {
  createUserInDB,
  loginUserOperation,
  refreshUserTokensOperation,
  logoutUserOperation,
  updateUserOperation,
  deleteUserOperation,
};
