const { httpError, handleRTArrayAndAT } = require("../../helpers");
const { Pharmacy } = require("../../models");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../tokenAndCookieServices/cookieUtils");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../tokenAndCookieServices/tokenService");
const {
  findPharmacyByEmail,
  updateRefreshTokenArray,
  prepareSendData,
  handlePharmNotFoundAfterDecoding,
  handlePharmTokens,
} = require("./pharmOperationComponents");

async function createPharmacyInDB(data) {
  const { email, password, name } = data;

  if (await Pharmacy.exists({ email })) throw httpError(409, "Email in use");
  if (!name || !password) throw httpError(401, "Fill all the fields");

  const result = await Pharmacy.create({
    name,
    email,
    password,
  });

  result.password = undefined;
  return result;
}

const loginPharmacyOperation = async (req, res) => {
  const cookies = req.cookies;

  const { email, password } = req.body;

  const foundPharmacy = await findPharmacyByEmail(email);

  const isEqual = await foundPharmacy.checkPassword(
    password,
    foundPharmacy.password
  );

  if (!isEqual) throw httpError(401, "Password does not match");

  if (isEqual) {
    const accessToken = generateAccessToken(foundPharmacy);
    const newRefreshToken = generateRefreshToken(foundPharmacy);

    await updateRefreshTokenArray(cookies, foundPharmacy, newRefreshToken, res);

    setRefreshTokenCookie(res, newRefreshToken);

    const sendData = prepareSendData(foundPharmacy, accessToken);

    return sendData;
  }
};

const refreshPharmTokensOperation = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  clearRefreshTokenCookie(res);

  const refreshToken = cookies.jwt;

  const foundPharmacy = await Pharmacy.findOne({ refreshToken }).exec();

  if (!foundPharmacy) {
    await handlePharmNotFoundAfterDecoding(refreshToken);
  }

  const tokens = await handlePharmTokens(foundPharmacy, refreshToken, res);

  const sendData = prepareSendData(foundPharmacy, tokens.accessToken);

  return sendData;
};

module.exports = {
  createPharmacyInDB,
  loginPharmacyOperation,
  refreshPharmTokensOperation,
};
