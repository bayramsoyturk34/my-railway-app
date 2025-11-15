// routes/user.js - Example with proper validation
import express from 'express';
import { 
  validateDataTypes, 
  checkValidationResult, 
  enforceCharacterLimits 
} from '../middleware/validation.js';

const router = express.Router();

// User registration with comprehensive validation
router.post('/register',
  // Data type validation
  validateDataTypes.required('firstName'),
  validateDataTypes.string('firstName', { min: 2, max: 50 }),
  validateDataTypes.required('lastName'),
  validateDataTypes.string('lastName', { min: 2, max: 50 }),
  validateDataTypes.required('email'),
  validateDataTypes.email('email'),
  validateDataTypes.required('password'),
  validateDataTypes.string('password', { min: 6, max: 100 }),
  
  // Character limits enforcement
  enforceCharacterLimits({
    firstName: 50,
    lastName: 50,
    email: 255,
    password: 100
  }),
  
  // Check validation results
  checkValidationResult,
  
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }
      
      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await db.insert(users).values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        createdAt: new Date()
      }).returning();
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          email: newUser[0].email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// User login with validation
router.post('/login',
  validateDataTypes.required('email'),
  validateDataTypes.email('email'),
  validateDataTypes.required('password'),
  validateDataTypes.string('password', { min: 1, max: 100 }),
  checkValidationResult,
  
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Profile update with validation
router.put('/profile',
  // Auth middleware would go here
  validateDataTypes.string('firstName', { min: 2, max: 50 }).optional(),
  validateDataTypes.string('lastName', { min: 2, max: 50 }).optional(),
  validateDataTypes.email('email').optional(),
  enforceCharacterLimits({
    firstName: 50,
    lastName: 50,
    email: 255
  }),
  checkValidationResult,
  
  async (req, res, next) => {
    try {
      const userId = req.user.id; // from auth middleware
      const updates = req.body;
      
      // Remove empty fields
      Object.keys(updates).forEach(key => {
        if (updates[key] === '' || updates[key] == null) {
          delete updates[key];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid fields provided for update'
        });
      }
      
      const updatedUser = await db.update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser[0].id,
          firstName: updatedUser[0].firstName,
          lastName: updatedUser[0].lastName,
          email: updatedUser[0].email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;