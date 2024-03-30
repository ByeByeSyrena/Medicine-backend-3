const setRefreshTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
};

module.exports = { setRefreshTokenCookie, clearRefreshTokenCookie };
