const Joi = require('@hapi/joi');

const signUpSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z ]{3,20}$/)
    .required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] }})
    .required(),
  password: Joi.string()
    .alphanum()
    .pattern(/^[0-9a-zA-Z]{8,20}$/)
    .required(),
  re_password: Joi.string()
  .alphanum()
  .pattern(/^[0-9a-zA-Z]{8,20}$/)
  .required()
  .valid(Joi.ref('password')),
});

const signInSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z ]{3,20}$/)
    .required(),
  password: Joi.string()
    .alphanum()
    .pattern(/^[0-9a-zA-Z]{8,20}$/)
    .required(),
});

module.exports = { signUpSchema, signInSchema };