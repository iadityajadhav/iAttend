const Joi = require('joi');

const loginSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().min(8).max(16).required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

module.exports = validateLogin;
