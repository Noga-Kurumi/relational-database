process.env.JWT_SECRET = 'testsecret';
process.env.BCRYPT_SALT = '1';

const request = require('supertest');
const app = require('../app');
const { createUser } = require('../testUtils');

describe('Authentication and protected routes', () => {
  it('registers a new user', async () => {
    const email = `new${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/login/signup')
      .send({ name: 'Test', email, password: 'password123', role: 'user' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', email.toLowerCase());
  });

  it('logs in an existing user', async () => {
    const email = `login${Date.now()}@test.com`;
    await request(app)
      .post('/api/login/signup')
      .send({ name: 'Login', email, password: 'password123', role: 'user' });

    const res = await request(app)
      .post('/api/login/')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  describe('protected customer routes', () => {
    let admin;
    let user;

    beforeAll(async () => {
      admin = await createUser('admin');
      user = await createUser('user');
    });

    it('denies access without token', async () => {
      const res = await request(app).get('/api/customers/');
      expect(res.status).toBe(401);
    });

    it('denies access to non-admin users', async () => {
      const res = await request(app)
        .get('/api/customers/')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });

    it('allows admin users', async () => {
      const res = await request(app)
        .get('/api/customers/')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
