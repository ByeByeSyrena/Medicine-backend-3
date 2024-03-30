const jwt = require("jsonwebtoken");
const { accessTokenKey, refreshTokenKey } = require("../../configs/configs");

const generateAccessToken = (user) => {
  const roles = Object.values(user.roles).filter(Boolean);
  return jwt.sign(
    {
      UserInfo: {
        name: user.name,
        roles: roles,
      },
    },
    accessTokenKey,
    { expiresIn: "30m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ name: user.name }, refreshTokenKey, { expiresIn: "1d" });
};
const decodeRefreshToken = async (refreshToken) => {
  return jwt.verify(refreshToken, refreshTokenKey);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  decodeRefreshToken,
};
