const serverConfig = require("../configs");

const globalErrorHandler = (err, req, res, next) => {
  let msg;
  let stack;
  let error;

  if (serverConfig.environment === "development") {
    msg = err.message;
    stack = err.stack;
    error = err;
  }

  msg = err.status === 500 ? "Internal server error" : err.message;

  res.status(err.status ?? 500).json({ msg, stack, error });
};

module.exports = { globalErrorHandler };
