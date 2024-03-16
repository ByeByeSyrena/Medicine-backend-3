const express = require("express");
const userController = require("../controllers");
const { validateFields, verifyJWT } = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");

const router = express.Router();

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.post("/logout", verifyJWT, userController.logoutUser);

router.get("/refresh", verifyJWT, userController.refreshUserToken);

module.exports = router;
