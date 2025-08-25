const express = require('express');
const prisma = require('../prisma/prisma.js');
const { asyncHandler, ApiError } = require('../middleware/errors');
const { idScheme, orderScheme } = require('../middleware/validators.js');
const { auth } = require('../middleware/auth.js');

const ordersRouters = express.Router();

ordersRouters.get(
  '/',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { paid } = req.query;

    const where = {};

    if (paid !== undefined) {
      where.paid = paid === 'true';
    }

    const orders = await prisma.orders.findMany({
      where,
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

ordersRouters.get(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = Number(value.id);

    const order = await prisma.orders.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        paid: true,
        created_at: true,
        customers: { select: { id: true, name: true, email: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });

    if (!order) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    res.json(order);
  })
);

ordersRouters.post(
  '/',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error, value } = orderScheme.validate(req.body);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const { product_id, amount, customer_id } = value;

    const { order, stock } = await prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: product_id },
        select: { stock: true },
      });

      if (!product) {
        throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
      }

      if (product.stock < amount) {
        throw new ApiError(
          409,
          'INSUFFICIENT_STOCK',
          'Stock insuficiente.',
          `Stock actual disponible: ${product.stock}`
        );
      }

      const newOrder = await tx.orders.create({
        data: {
          product_id: product_id,
          amount: amount,
          customer_id: customer_id,
        },
        select: {
          id: true,
          amount: true,
          customers: { select: { name: true, email: true } },
          products: { select: { name: true, price: true } },
          created_at: true,
        },
      });

      const updated = await tx.products.update({
        where: { id: product_id },
        data: { stock: product.stock - amount },
        select: { stock: true },
      });

      return { order: newOrder, stock: updated.stock };
    });

    console.log(`Nuevo stock: ${stock}`);
    console.log('Nueva orden añadido.');
    return res.status(201).json(order);
  })
);

ordersRouters.delete(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

    const result = await prisma.orders.delete({
      where: { id },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    return res.status(204).end();
  })
);

ordersRouters.patch(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

    const result = await prisma.orders.update({
      where: { id },
      data: { paid: true },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    return res.send('Recurso actualizado.').end();
  })
);

module.exports = { ordersRouters };
