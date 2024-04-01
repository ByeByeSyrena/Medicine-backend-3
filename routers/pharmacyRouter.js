const express = require("express");
const pharmacyController = require("../controllers/pharmacyController");
const { validateFields, verifyJWT, isValidId } = require("../middlewares");
const {
  createPharmacyValidator,
  loginPharmDataValidator,
} = require("../validation");

const router = express.Router();

router.post(
  "/register",
  validateFields(createPharmacyValidator),
  pharmacyController.createPharmacy
);

router.post(
  "/login",
  validateFields(loginPharmDataValidator),
  pharmacyController.loginPharmacy
);

router.get("/refresh", pharmacyController.refreshPharmTokens);

module.exports = router;
