const express = require("express");
const userController = require("../controllers");
const { validateFields, verifyJWT } = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");

const router = express.Router();

router.post(
  "/register",
  validateFields(createUserDataValidator),
  userController.createUser
);

router.post(
  "/login",
  validateFields(loginUserDataValidator),
  userController.loginUser
);

router.get("/logout", verifyJWT, userController.logoutUser);

router.get("/refresh", verifyJWT, userController.refreshUserToken);

module.exports = router;
