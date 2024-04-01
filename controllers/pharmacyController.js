const { ctrlWrapper } = require("../helpers");
const {
  createPharmacyInDB,
  loginPharmacyOperation,
  refreshPharmTokensOperation,
} = require("../services");

const createPharmacy = async (req, res) => {
  await createPharmacyInDB(req.body);
  res.status(201).json({ message: "Pharmacy created" });
};

const loginPharmacy = async (req, res) => {
  const result = await loginPharmacyOperation(req, res);
  res.json(result);
};

const refreshPharmTokens = async (req, res) => {
  const result = await refreshPharmTokensOperation(req, res);
  console.log(result);
  res.json(result);
};

const logoutPharmacy = async (req, res) => {
  await logoutPharmOperation(req, res);
  res.sendStatus(204);
};

const deletePharmacy = async (req, res) => {
  await deletePharmOperation(req, res);
  res.sendStatus(200);
};

module.exports = {
  createPharmacy: ctrlWrapper(createPharmacy),
  loginPharmacy: ctrlWrapper(loginPharmacy),
  refreshPharmTokens: ctrlWrapper(refreshPharmTokens),
  logoutPharmacy: ctrlWrapper(logoutPharmacy),
  deletePharmacy: ctrlWrapper(deletePharmacy),
};
