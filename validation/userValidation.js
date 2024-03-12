const Joi = require("joi");
const { userRolesEnum, PSWRD_REGEX, EMAIL_REGEX } = require("../constants");

const createUserDataValidator = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email(EMAIL_REGEX)
    .required()
    .messages({ "any.required": "missing required email field" }),
  password: Joi.string()
    .regex(PSWRD_REGEX)
    .required()
    .messages({ "any.required": "missing required password field" }),
  role: Joi.string().valid(...Object.values(userRolesEnum)),
  favorites: Joi.array().items(Joi.string()),
  seller: Joi.string()
    .regex(/^[a-zA-Z0-9\s]*$/)
    .allow(null),
  isActivated: Joi.boolean(),
  activationLink: Joi.string(),
});

const loginUserDataValidator = Joi.object({
  email: Joi.string()
    .email(EMAIL_REGEX)
    .required()
    .messages({ "any.required": "missing required email field" }),
  password: Joi.string()
    .regex(PSWRD_REGEX)
    .required()
    .messages({ "any.required": "missing required password field" }),
});

const updateUserDataValidator = Joi.object({
  name: Joi.string().min(3).max(30),
  password: Joi.string().regex(PSWRD_REGEX).required(),
  role: Joi.string().valid(...Object.values(userRolesEnum)),
  favorites: Joi.array().items(Joi.string()),
});

module.exports = {
  updateUserDataValidator,
  createUserDataValidator,
  loginUserDataValidator,
};
