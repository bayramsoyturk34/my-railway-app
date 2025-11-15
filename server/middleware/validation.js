// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      details: err.details || []
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format in request body'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

// Validation result checker
export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// JSON body parser with error handling
export const jsonParser = (req, res, next) => {
  if (req.is('application/json')) {
    let rawData = '';
    req.on('data', chunk => {
      rawData += chunk;
    });
    
    req.on('end', () => {
      try {
        if (rawData.trim() === '') {
          req.body = {};
        } else {
          req.body = JSON.parse(rawData);
        }
        next();
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid JSON format in request body'
        });
      }
    });
  } else {
    next();
  }
};

// Data type validation helpers
export const validateDataTypes = {
  string: (field, options = {}) => 
    body(field)
      .isString()
      .withMessage(`${field} must be a string`)
      .isLength({ min: options.min || 1, max: options.max || 255 })
      .withMessage(`${field} must be between ${options.min || 1} and ${options.max || 255} characters`),
      
  email: (field) =>
    body(field)
      .isEmail()
      .withMessage(`${field} must be a valid email address`)
      .normalizeEmail(),
      
  integer: (field, options = {}) =>
    body(field)
      .isInt(options)
      .withMessage(`${field} must be an integer${options.min ? ` >= ${options.min}` : ''}${options.max ? ` <= ${options.max}` : ''}`),
      
  required: (field) =>
    body(field)
      .exists()
      .withMessage(`${field} is required`)
      .notEmpty()
      .withMessage(`${field} cannot be empty`)
};

// Character limit enforcer
export const enforceCharacterLimits = (limits) => (req, res, next) => {
  for (const [field, maxLength] of Object.entries(limits)) {
    if (req.body[field] && typeof req.body[field] === 'string') {
      if (req.body[field].length > maxLength) {
        return res.status(400).json({
          error: `Field '${field}' exceeds maximum length of ${maxLength} characters`
        });
      }
    }
  }
  next();
};

// 404 handler for unrecognized routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Endpoint ${req.method} ${req.path} not found`
  });
};