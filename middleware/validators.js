const Joi = require('joi');

const ALLOWED_ROLES = ['admin', 'user'];

const signupScheme = Joi.object({
  name: Joi.string().min(2).max(15).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  role: Joi.string().required(),
});

const loginScheme = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
});

const customerScheme = Joi.object({
  name: Joi.string().min(2).max(15),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(30),
});

const idScheme = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  ALLOWED_ROLES,
  signupScheme,
  loginScheme,
  customerScheme,
  idScheme,
};
