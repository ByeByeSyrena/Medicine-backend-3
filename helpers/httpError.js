const httpError = (status, message, data = {}) => {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  throw error;
};

module.exports = httpError;
