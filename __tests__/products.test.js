process.env.JWT_SECRET = 'testsecret';
process.env.BCRYPT_SALT = '1';

const request = require('supertest');
const app = require('../app');
const { createUser } = require('../testUtils');

describe('Product operations', () => {
  let admin;
  let user;
  let productId;

  beforeAll(async () => {
    admin = await createUser('admin');
    user = await createUser('user');
  });

  it('allows admin to create a product', async () => {
    const name = `Product-${Date.now()}`;
    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ name, price: 10, stock: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', name);

    // Fetch product list to get id
    const listRes = await request(app).get('/api/products/');
    const created = listRes.body.find((p) => p.name === name);
    productId = created.id;
  });

  it('rejects product creation with invalid data', async () => {
    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ price: 10, stock: 5 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('prevents non-admin from creating products', async () => {
    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Nope', price: 10, stock: 5 });
    expect(res.status).toBe(403);
  });

  it('allows admin to update a product', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ price: 20 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('price');
  });

  it('returns 404 for updating non-existent product', async () => {
    const res = await request(app)
      .patch('/api/products/999999')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ price: 10 });
    expect(res.status).toBe(404);
  });

  it('prevents non-admin from updating products', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ price: 30 });
    expect(res.status).toBe(403);
  });
});
