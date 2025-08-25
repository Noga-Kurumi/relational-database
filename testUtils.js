const request = require('supertest');
const app = require('./app');

async function createUser(role = 'user') {
  const timestamp = Date.now();
  const email = `${role}${timestamp}@test.com`;
  const password = 'password123';
  const name = role === 'admin' ? 'Admin' : 'User';

  const signupRes = await request(app)
    .post('/api/login/signup')
    .send({ name, email, password, role });

  const loginRes = await request(app)
    .post('/api/login/')
    .send({ email, password });

  return {
    id: signupRes.body.id,
    token: loginRes.body.token,
    email,
    password,
  };
}

module.exports = { createUser };
