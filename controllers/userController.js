const { ctrlWrapper } = require("../helpers");

const {
  createUserInDB,

  loginUserOperation,
  refreshUserTokensOperation,
  logoutUserOperation,
  updateUserOperation,
} = require("../services");
const {
  deleteUserOperation,
} = require("../services/userServices/userOperations");

const createUser = async (req, res) => {
  const result = await createUserInDB(req.body);
  res.status(201).json(result);
};

const loginUser = async (req, res) => {
  const result = await loginUserOperation(req, res);
  res.json(result);
};

const refreshUserTokens = async (req, res) => {
  const result = await refreshUserTokensOperation(req, res);
  res.json(result);
};

const logoutUser = async (req, res) => {
  await logoutUserOperation(req, res);
  res.sendStatus(204);
};

const updateUser = async (req, res) => {
  const { accessToken, updatedUser } = await updateUserOperation(req, res);

  res.json({
    accessToken,
    name: updatedUser.name,
    roles: updatedUser.roles,
  });
};

const deleteUser = async (req, res) => {
  await deleteUserOperation(req, res);
  res.sendStatus(204);
};

module.exports = {
  createUser: ctrlWrapper(createUser),
  loginUser: ctrlWrapper(loginUser),
  refreshUserToken: ctrlWrapper(refreshUserTokens),
  logoutUser: ctrlWrapper(logoutUser),
  updateUser: ctrlWrapper(updateUser),
  deleteUser: ctrlWrapper(deleteUser),
};
