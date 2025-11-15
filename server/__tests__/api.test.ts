import { describe, it, expect } from 'vitest';

describe('API Tests', () => {
    it('should return a 200 status for the root endpoint', async () => {
        const response = await fetch('http://localhost:3000/');
        expect(response.status).toBe(200);
    });

    it('should return JSON data for the /api endpoint', async () => {
        const response = await fetch('http://localhost:3000/api');
        const data = await response.json();
        expect(response.headers.get('content-type')).toContain('application/json');
        expect(data).toHaveProperty('message');
    });
});