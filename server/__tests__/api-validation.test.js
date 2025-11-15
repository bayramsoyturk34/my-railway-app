// __tests__/api-validation.test.js
import request from 'supertest';
import app from '../index.js';

describe('API Validation Tests - TestSprite Fixes', () => {
  
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
      expect(response.body.error).toContain('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(0);
    });
    
    test('should accept valid data types', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe', 
          email: 'john.doe@example.com',
          password: 'securePassword123'
        });
      
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('JSON Format Validation', () => {
    test('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":}'); // Malformed JSON
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid JSON format');
    });
    
    test('should handle empty JSON body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{}');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('Character Limit Validation', () => {
    test('should reject fields exceeding character limits', async () => {
      const longString = 'a'.repeat(256); // Exceeds 255 char limit
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: longString,
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('exceeds maximum length');
    });
    
    test('should accept fields within character limits', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      
      expect([200, 201, 400]).toContain(response.status); // 400 if user exists
      if (response.status === 400) {
        expect(response.body.error).not.toContain('exceeds maximum length');
      }
    });
  });

  describe('404 Error Handling', () => {
    test('should return 404 for unrecognized GET endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent/route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Endpoint GET /api/nonexistent/route not found');
    });
    
    test('should return 404 for unrecognized POST endpoints', async () => {
      const response = await request(app)
        .post('/api/invalid/endpoint')
        .send({ test: 'data' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
    
    test('should return 404 for unrecognized PUT endpoints', async () => {
      const response = await request(app)
        .put('/api/missing/route')
        .send({ test: 'data' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Required Fields Validation', () => {
    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          // lastName missing
          email: 'john@example.com'
          // password missing
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toBeInstanceOf(Array);
      
      const missingFields = response.body.details.map(detail => detail.field);
      expect(missingFields).toContain('lastName');
      expect(missingFields).toContain('password');
    });
    
    test('should return 400 for empty required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('Error Response Consistency', () => {
    test('all error responses should have consistent JSON structure', async () => {
      const testCases = [
        { method: 'post', path: '/api/auth/register', data: {} },
        { method: 'post', path: '/api/auth/login', data: {} },
        { method: 'get', path: '/api/nonexistent' },
        { method: 'put', path: '/api/user/profile', data: { invalid: 'data' } }
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          [testCase.method](testCase.path)
          .send(testCase.data || {});
        
        // Should be an error response
        expect([400, 401, 404, 500]).toContain(response.status);
        
        // Should have consistent JSON structure
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
        expect(response.body.error).not.toBe('');
        
        // Should not have HTML in response
        expect(response.get('Content-Type')).toContain('application/json');
      }
    });
  });

  describe('Authentication Errors', () => {
    test('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email or password');
    });
    
    test('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .get('/api/user/profile');
      
      expect([401, 403]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long request bodies', async () => {
      const hugeName = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: hugeName,
          lastName: 'Test',
          email: 'test@example.com',
          password: 'password'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    test('should handle null and undefined values', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: null,
          lastName: undefined,
          email: 'test@example.com',
          password: 'password'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});