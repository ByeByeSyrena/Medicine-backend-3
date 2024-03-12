const express = require("express");
const {
  createUser,
  loginUser,
  refreshUser,
  getCurrentUser,
} = require("../controllers");
const { validateFields, validateToken } = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");

const router = express.Router();

router.post("/register", validateFields(createUserDataValidator), createUser);

router.post("/login", validateFields(loginUserDataValidator), loginUser);

router.post("/refresh", refreshUser);

router.get("/current-user", validateToken, getCurrentUser);

module.exports = router;
