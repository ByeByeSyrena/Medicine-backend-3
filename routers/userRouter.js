const express = require("express");
const userController = require("../controllers");
const { validateFields, verifyJWT, isValidId } = require("../middlewares");
const {
  createUserDataValidator,
  loginUserDataValidator,
} = require("../validation");
const { updateUserDataValidator } = require("../validation/userValidation");

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

router.patch(
  "/:id",
  isValidId,
  validateFields(updateUserDataValidator),
  userController.updateUser
);

router.delete("/:id", isValidId, userController.deleteUser);

router.get("/logout", userController.logoutUser);

router.get("/refresh", userController.refreshUserToken);

module.exports = router;
