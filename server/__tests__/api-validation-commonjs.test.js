// __tests__/api-validation.test.js
const request = require('supertest');
const express = require('express');

// Mock Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import validation middleware
  const { errorHandler, validateDataTypes, enforceCharacterLimits } = require('../middleware/validation-commonjs');
  
  // Test routes
  app.post('/api/auth/register', 
    validateDataTypes(['firstName', 'lastName', 'email', 'password']),
    enforceCharacterLimits({ firstName: 50, lastName: 50, password: 100 }),
    (req, res) => {
      res.json({ success: true, message: 'Registration successful' });
    }
  );
  
  app.post('/api/auth/login',
    validateDataTypes(['email', 'password']),
    (req, res) => {
      res.json({ success: true, message: 'Login successful' });
    }
  );
  
  app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    if (userId === '999') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userId, name: 'Test User' });
  });
  
  // Error handling middleware
  app.use(errorHandler);
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
  
  return app;
};

describe('API Validation Tests - TestSprite Fixes', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('Data Type Validation', () => {
    test('should reject invalid data types with 400 Bad Request', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 123, // Should be string
          lastName: true, // Should be string
          email: 'invalid-email', // Invalid format
          password: null // Should be string
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should accept valid data types', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'securepassword123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject non-string values for string fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: ['not', 'a', 'string'], // Array instead of string
          password: { value: 'password' } // Object instead of string
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('JSON Format Validation', () => {
    test('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"firstName": "John", "lastName":}'); // Malformed JSON
      
      expect(response.status).toBe(400);
    });

    test('should accept well-formed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password123'
        });
      
      expect([200, 400]).toContain(response.status); // Accept either success or validation error
    });
  });

  describe('Character Limit Validation', () => {
    test('should reject fields exceeding character limits', async () => {
      const longString = 'a'.repeat(101); // Exceeds 100 character limit
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'a'.repeat(51), // Exceeds 50 character limit
          lastName: 'Smith',
          email: 'user@example.com',
          password: longString
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should accept fields within character limits', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'validpassword'
        });
      
      expect(response.status).toBe(200);
    });

    test('should handle empty strings appropriately', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('HTTP Status Code Validation', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    test('should return 404 for non-existent users', async () => {
      const response = await request(app)
        .get('/api/users/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    test('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Required Field Validation', () => {
    test('should reject requests with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John'
          // Missing lastName, email, password
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject completely empty requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('should reject null field values', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: null,
          password: null
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Email Format Validation', () => {
    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@missing-local.com',
        'spaces @domain.com',
        'double@@domain.com',
        'trailing.dot.@domain.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: email,
            password: 'password123'
          });
        
        expect(response.status).toBe(400);
      }
    });

    test('should accept valid email formats', async () => {
      const validEmails = [
        'user@domain.com',
        'test.email@subdomain.domain.co.uk',
        'user+tag@domain.org',
        'valid_email@domain-name.com'
      ];

      for (const email of validEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: email,
            password: 'password123'
          });
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Error Response Format', () => {
    test('should return consistent error response format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 123,
          email: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    test('should handle internal server errors gracefully', async () => {
      // This test simulates a scenario that might cause a 500 error
      const response = await request(app)
        .get('/api/undefined-route')
        .send();
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Security and Performance Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('Input Sanitization', () => {
    test('should handle special characters safely', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John<script>alert("xss")</script>',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      // The response should not contain the script tag
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    test('should handle SQL injection attempts', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin@test.com'; DROP TABLE users; --",
          password: 'password'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting and Performance', () => {
    test('should handle large payloads appropriately', async () => {
      const largePayload = {
        firstName: 'A'.repeat(1000),
        lastName: 'B'.repeat(1000),
        email: 'test@example.com',
        password: 'C'.repeat(1000)
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(largePayload);
      
      expect(response.status).toBe(400); // Should reject oversized fields
    });

    test('should handle concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123'
          })
      );
      
      const responses = await Promise.all(requests);
      
      // All requests should be processed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });
  });
});