process.env.JWT_SECRET = 'testsecret';
process.env.BCRYPT_SALT = '1';

const request = require('supertest');
const app = require('../app');
const { createUser } = require('../testUtils');

describe('Order operations', () => {
  let admin;
  let user;
  let productId;
  let orderId;

  beforeAll(async () => {
    admin = await createUser('admin');
    user = await createUser('user');

    // create product to order
    const name = `OrderProduct-${Date.now()}`;
    await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ name, price: 15, stock: 5 });
    const listRes = await request(app).get('/api/products/');
    const created = listRes.body.find((p) => p.name === name);
    productId = created.id;
  });

  it('allows admin to create an order', async () => {
    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ product_id: productId, amount: 1, customer_id: user.id });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('amount', 1);
    orderId = res.body.id;
  });

  it('updates order to paid', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(200);
  });

  it('prevents non-admin from creating orders', async () => {
    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ product_id: productId, amount: 1, customer_id: user.id });
    expect(res.status).toBe(403);
  });

  it('fails when stock is insufficient', async () => {
    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ product_id: productId, amount: 999, customer_id: user.id });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error.code', 'INSUFFICIENT_STOCK');
  });
});
