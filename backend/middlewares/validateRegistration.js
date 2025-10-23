const Joi = require('joi');

// Common fields
const commonFields = {
  name: Joi.string().max(100).required(),
  userId: Joi.string().required(),
  collegeId: Joi.string().required(),
  password: Joi.string().min(8).max(16).required(),
};

// Admin registration schema
const adminSchema = Joi.object({
  ...commonFields,
});

// Student registration schema
const studentSchema = Joi.object({
  ...commonFields,
  branch: Joi.string().required(),
  year: Joi.string().required(),
  sem: Joi.number().required(),
  roll: Joi.number().required(),
});

// Teacher registration schema
const teacherSchema = Joi.object({
  ...commonFields,
});

// Middleware factory
const validateRegistration = (type) => {
  return (req, res, next) => {
    let schema;

    switch (type) {
      case 'admin':
        schema = adminSchema;
        break;
      case 'student':
        schema = studentSchema;
        break;
      case 'teacher':
        schema = teacherSchema;
        break;
      default:
        return res.status(400).json({ message: 'Invalid registration type' });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Send all validation errors
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }

    next();
  };
};

module.exports = validateRegistration;
