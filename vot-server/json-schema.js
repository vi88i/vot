const Joi = require('@hapi/joi');

const signUpSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z ]{2,20}$/)
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
    .pattern(/^[a-zA-Z ]{2,20}$/)
    .required(),
  password: Joi.string()
    .alphanum()
    .pattern(/^[0-9a-zA-Z]{8,20}$/)
    .required(),
});

const pollSchema = Joi.object({
  question: Joi.string()
    .pattern(/^[0-9a-zA-Z? ]{3,250}$/)
    .required(),
  deadline: Joi.string()
    .pattern(/^[0-9-]{10}$/)
    .required(),
  options: Joi.array()
    .min(2)
    .items(
      Joi.object({
        text: Joi.string()
          .pattern(/^[0-9a-zA-Z? ]{1,250}$/)
          .required(),
        index: Joi.number()
          .required(),
      })
    )
    .required(),
});

module.exports = { signUpSchema, signInSchema, pollSchema };