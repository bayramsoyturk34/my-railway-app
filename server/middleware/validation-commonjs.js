// middleware/validation.js - CommonJS version
const { body, validationResult } = require('express-validator');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format in request body'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details || err.message
    });
  }
  
  // Handle generic errors
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Check validation results
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validate data types
const validateDataTypes = (requiredFields) => {
  return [
    ...requiredFields.map(field => 
      body(field)
        .exists()
        .withMessage(`${field} is required`)
        .notEmpty()
        .withMessage(`${field} cannot be empty`)
        .isString()
        .withMessage(`${field} must be a string`)
        .trim()
    ),
    // Email specific validation
    requiredFields.includes('email') ? 
      body('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail() : 
      (req, res, next) => next(),
    checkValidationResult
  ];
};

// Enforce character limits
const enforceCharacterLimits = (limits) => {
  return [
    ...Object.entries(limits).map(([field, maxLength]) =>
      body(field)
        .isLength({ max: maxLength })
        .withMessage(`${field} must not exceed ${maxLength} characters`)
    ),
    checkValidationResult
  ];
};

// Validate required fields
const validateRequiredFields = (fields) => {
  return [
    ...fields.map(field =>
      body(field)
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage(`${field} is required and cannot be null or empty`)
    ),
    checkValidationResult
  ];
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS scripts
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

// Rate limiting helper
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(clientIP)) {
      requests.set(clientIP, []);
    }
    
    const clientRequests = requests.get(clientIP);
    const validRequests = clientRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(clientIP, validRequests);
    
    next();
  };
};

module.exports = {
  errorHandler,
  checkValidationResult,
  validateDataTypes,
  enforceCharacterLimits,
  validateRequiredFields,
  sanitizeInput,
  createRateLimiter
};