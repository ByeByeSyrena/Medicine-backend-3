const { ctrlWrapper } = require("../helpers");
const { createPharmacyInDB } = require("../services");

const createPharmacy = async (req, res) => {
  await createPharmacyInDB(req.body);
  res.status(201).json({ message: "Pharmacy created" });
};

module.exports = {
  createPharmacy: ctrlWrapper(createPharmacy),
};
