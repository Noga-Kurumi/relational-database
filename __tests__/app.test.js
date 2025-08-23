const request = require('supertest');
const app = require('../app');

describe('Express app', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
