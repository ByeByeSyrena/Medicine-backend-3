const express = require("express");
const pharmacyController = require("../controllers/pharmacyController");
const { validateFields, verifyJWT, isValidId } = require("../middlewares");
const { createPharmacyValidator } = require("../validation");

const router = express.Router();

router.post(
  "/register",
  validateFields(createPharmacyValidator),
  pharmacyController.createPharmacy
);

module.exports = router;
