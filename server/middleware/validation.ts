// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
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
  
  // Handle generic errors with proper status codes
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Check validation results
export const checkValidationResult = (req: Request, res: Response, next: NextFunction) => {
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
export const validateDataTypes = (requiredFields: string[]) => {
  const validations = [
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
    checkValidationResult
  ];

  // Add email specific validation if email field is present
  if (requiredFields.includes('email')) {
    validations.splice(-1, 0, 
      body('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail()
    );
  }

  return validations;
};

// Enforce character limits
export const enforceCharacterLimits = (limits: Record<string, number>) => {
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
export const validateRequiredFields = (fields: string[]) => {
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
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
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
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(clientIP)) {
      requests.set(clientIP, []);
    }
    
    const clientRequests = requests.get(clientIP)!;
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

// Enhanced JSON body parser with error handling
export const jsonBodyParser = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('application/json')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON format in request body'
        });
      }
    });
  } else {
    next();
  }
};