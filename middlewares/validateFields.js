const { httpError } = require("../helpers");

const validateFields = (schema) => {
  console.log(schema);
  const fn = (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      httpError(400, "missing fields");
    }
    const { error } = schema.validate(req.body);
    if (error) {
      next(httpError(400, error.message));
    }
    next();
  };
  return fn;
};

module.exports = validateFields;
