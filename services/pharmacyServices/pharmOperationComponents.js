const { httpError } = require("../../helpers");
const { Pharmacy } = require("../../models");
const {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} = require("../tokenAndCookieServices/cookieUtils");
const {
  decodeRefreshToken,
  generateRefreshToken,
  generateAccessToken,
} = require("../tokenAndCookieServices/tokenService");

async function findPharmacyByEmail(email) {
  const foundPharmacy = await Pharmacy.findOne({ email });

  if (!foundPharmacy) {
    throw httpError(401, "Email or password is wrong");
  }

  return foundPharmacy;
}

async function updateRefreshTokenArray(
  cookies,
  foundPharmacy,
  newRefreshToken,
  res
) {
  let newRefreshTokenArray = !cookies?.jwt
    ? foundPharmacy.refreshToken
    : foundPharmacy.refreshToken.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await Pharmacy.findOne({ refreshToken }).exec();

    if (!foundToken) {
      console.log("attempted refresh token reuse at login!");
      newRefreshTokenArray = [];
      throw httpError(204, "Token was not found");
    }

    clearRefreshTokenCookie(res);
  }

  foundPharmacy.refreshToken = [...newRefreshTokenArray, newRefreshToken];

  await foundPharmacy.save();
}

function prepareSendData(foundPharmacy, accessToken) {
  foundPharmacy.password = undefined;
  foundPharmacy.refreshToken = undefined;

  return {
    foundPharmacy,
    accessToken: accessToken,
  };
}

const handlePharmNotFoundAfterDecoding = async (refreshToken) => {
  const decoded = await decodeRefreshToken(refreshToken);

  const hackedPharmacy = await Pharmacy.findOne({ name: decoded.name }).exec();

  if (hackedPharmacy) {
    hackedPharmacy.refreshToken = [];
    await hackedPharmacy.save();
  }
  throw httpError(403, "User was not found after decoding");
};

const handlePharmTokens = async (foundPharmacy, refreshToken, res) => {
  const newRefreshTokenArray = foundPharmacy.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  const decoded = await decodeRefreshToken(refreshToken);

  if (foundPharmacy.name !== decoded.name)
    throw httpError(403, "Pharmacy's name is not equal saved name");

  const accessToken = generateAccessToken(foundPharmacy);
  const newRefreshToken = generateRefreshToken(foundPharmacy);

  foundPharmacy.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await foundPharmacy.save();

  setRefreshTokenCookie(res, newRefreshToken);

  return { accessToken, newRefreshToken };
};

module.exports = {
  findPharmacyByEmail,
  updateRefreshTokenArray,
  prepareSendData,
  handlePharmNotFoundAfterDecoding,
  handlePharmTokens,
};
