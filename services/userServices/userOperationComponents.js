const { User } = require("../../models");

const {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} = require("../tokenAndCookieServices/cookieUtils");
const {
  generateRefreshToken,
  generateAccessToken,
  decodeRefreshToken,
} = require("../tokenAndCookieServices/tokenService");

async function findUserByEmail(email) {
  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    throw httpError(401, "Email or password is wrong");
  }

  return foundUser;
}

async function updateRefreshTokenArray(
  cookies,
  foundUser,
  newRefreshToken,
  res
) {
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

    clearRefreshTokenCookie(res);
  }

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

  await foundUser.save();
}

function prepareSendData(user, accessToken) {
  user.password = undefined;
  user.refreshToken = undefined;

  return {
    foundUser: user,
    accessToken: accessToken,
  };
}

const handleUserNotFoundAfterDecoding = async (refreshToken) => {
  const decoded = await decodeRefreshToken(refreshToken);

  const hackedUser = await User.findOne({ name: decoded.name }).exec();

  if (hackedUser) {
    hackedUser.refreshToken = [];
    await hackedUser.save();
  }
  throw httpError(403, "User was not found after decoding");
};

const handleUserTokens = async (foundUser, refreshToken, res) => {
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  const decoded = await decodeRefreshToken(refreshToken);

  if (foundUser.name !== decoded.name)
    throw httpError(403, "User name is not equal saved name");

  const accessToken = generateAccessToken(foundUser);
  const newRefreshToken = generateRefreshToken(foundUser);

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await foundUser.save();

  setRefreshTokenCookie(res, newRefreshToken);

  return { accessToken, newRefreshToken };
};

const rewriteUpdatedUserTokens = async (user, refreshTokenCookie, res) => {
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  let newRefreshTokenArray = user.refreshToken;

  if (refreshTokenCookie) {
    newRefreshTokenArray = newRefreshTokenArray.filter(
      (rt) => rt !== refreshTokenCookie
    );
    clearRefreshTokenCookie(res);
  }

  newRefreshTokenArray.push(newRefreshToken);

  return { accessToken, newRefreshTokenArray };
};

module.exports = {
  findUserByEmail,
  updateRefreshTokenArray,
  prepareSendData,
  handleUserNotFoundAfterDecoding,
  handleUserTokens,
  rewriteUpdatedUserTokens,
};
