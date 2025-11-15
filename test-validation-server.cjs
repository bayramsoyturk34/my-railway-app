// test-validation-server.js
const express = require('express');
const { validateDataTypes, enforceCharacterLimits, errorHandler, sanitizeInput } = require('./server/middleware/validation-commonjs.js');

const app = express();
app.use(express.json());
app.use(sanitizeInput);

// Test endpoint with full validation
app.post('/api/auth/register', 
  ...validateDataTypes(['firstName', 'lastName', 'email', 'password']),
  ...enforceCharacterLimits({ 
    firstName: 50, 
    lastName: 50, 
    email: 255, 
    password: 100 
  }),
  (req, res) => {
    res.json({ 
      success: true, 
      message: 'Registration successful',
      data: req.body 
    });
  }
);

app.post('/api/auth/login', 
  ...validateDataTypes(['email', 'password']),
  (req, res) => {
    res.json({ 
      success: true, 
      message: 'Login successful',
      data: req.body 
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test validation server running on http://localhost:${PORT}`);
  console.log('✅ Validation middleware loaded successfully');
  console.log('📡 Ready for TestSprite API testing!');
});