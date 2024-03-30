const {
  createUserInDB,
  loginUserOperation,
  refreshUserTokensOperation,
  logoutUserOperation,
  updateUserOperation,
} = require("./userServices/userOperations");
const {
  generateAccessToken,
  generateRefreshToken,
  decodeRefreshToken,
} = require("./tokenAndCookieServices/tokenService");

const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("./tokenAndCookieServices/cookieUtils");

module.exports = {
  createUserInDB,
  loginUserOperation,
  generateAccessToken,
  generateRefreshToken,
  decodeRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  refreshUserTokensOperation,
  logoutUserOperation,
  updateUserOperation,
};
