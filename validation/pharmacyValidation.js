const Joi = require("joi");
const { userRolesEnum, PSWRD_REGEX, EMAIL_REGEX } = require("../constants");

const createPharmacyValidator = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email(EMAIL_REGEX)
    .required()
    .messages({ "any.required": "missing required email field" }),
  password: Joi.string()
    .regex(PSWRD_REGEX)
    .required()
    .messages({ "any.required": "missing required password field" }),
  roles: Joi.string().valid(...Object.values(userRolesEnum)),
});

const loginPharmDataValidator = Joi.object({
  email: Joi.string()
    .email(EMAIL_REGEX)
    .required()
    .messages({ "any.required": "missing required email field" }),
  password: Joi.string()
    .regex(PSWRD_REGEX)
    .required()
    .messages({ "any.required": "missing required password field" }),
});

module.exports = {
  createPharmacyValidator,
  loginPharmDataValidator,
};
