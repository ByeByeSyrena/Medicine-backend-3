const express = require("express");
const { createUser, loginUser } = require("../controllers");
const { validateFields } = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");

const router = express.Router();

router.post("/register", validateFields(createUserDataValidator), createUser);

router.post("/login", validateFields(loginUserDataValidator), loginUser);

module.exports = router;
