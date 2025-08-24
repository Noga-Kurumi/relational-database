const express = require('express');
const prisma = require('../prisma/prisma.js');
const { asyncHandler } = require('../middleware/errors');

const ordersRouters = express.Router();

ordersRouters.get(
  '/',
  asyncHandler(async (_req, res) => {
    const orders = await prisma.orders.findMany({
      select: {
        id: true,
        amount: true,
        paid: true,
        created_at: true,
        customers: { select: { id: true, name: true, email: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });

    res.json(orders);
  })
);

//todo: Add other orders routes (POST, PUT, DELETE)

module.exports = { ordersRouters };
