const express = require("express");
const {
  createUser,
  loginUser,
  refreshUser,
  getCurrentUser,
  logoutUser,
} = require("../controllers");
const {
  validateFields,
  // validateToken
} = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");

const router = express.Router();

router.post("/register", validateFields(createUserDataValidator), createUser);

router.post("/login", validateFields(loginUserDataValidator), loginUser);

router.post("/logout", logoutUser);

router.get("/refresh", refreshUser);

router.get("/current", getCurrentUser);

// router.get("/users", refreshUser);

module.exports = router;
