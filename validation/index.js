const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("./userValidation");
const {
  createPharmacyValidator,
  loginPharmDataValidator,
} = require("./pharmacyValidation");

module.exports = {
  createUserDataValidator,
  loginUserDataValidator,
  createPharmacyValidator,
  loginPharmDataValidator,
};
