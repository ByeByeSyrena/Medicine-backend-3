const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("./userValidation");
const { createPharmacyValidator } = require("./pharmacyValidation");

module.exports = {
  createUserDataValidator,
  loginUserDataValidator,
  createPharmacyValidator,
};
