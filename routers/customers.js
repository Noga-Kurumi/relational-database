const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth.js');
const { ApiError, asyncHandler } = require('../middleware/errors.js');
const { customerScheme, idScheme } = require('../middleware/validators.js');
const prisma = require('../prisma/prisma.js');

const customerRouters = express.Router();

//Get all users (Only admin)
customerRouters.get(
  '/',
  auth(['admin']),
  asyncHandler(async (_req, res) => {
    const customers = await prisma.customers.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { id: 'asc' },
    });

    return res.json(customers);
  })
);

// Get user by ID (Only admin or specific user)
customerRouters.get(
  '/:id',
  auth(['admin', 'user']),
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = Number(value.id);

    const customer = await prisma.customers.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    if (!customer) {
      throw new ApiError(404, 'NOT_FOUND', 'Cliente no encontrado.');
    }

    return res.json(customer);
  })
);

//Update user by ID (Only admin or specific user)
customerRouters.patch(
  '/:id',
  auth(['admin', 'user']),
  asyncHandler(async (req, res) => {
    const { error: errId, value: valParams } = idScheme.validate(req.params);

    if (errId) {
      throw new ApiError(400, 'VALIDATION_ERROR', errId.details[0].message);
    }

    const id = Number(valParams.id);

    const { error: errBody, value: body } = customerScheme.validate(req.body);

    if (errBody) {
      throw new ApiError(400, 'VALIDATION_ERROR', errBody.details[0].message);
    }

    let data = {};

    if (body.name !== undefined) {
      data.name = body.name.trim();
    }

    if (body.email !== undefined) {
      data.email = body.email.trim().toLowerCase();
    }

    if (body.password !== undefined) {
      data.password_hash = await bcrypt.hash(
        body.password.trim(),
        Number(process.env.BCRYPT_SALT)
      );
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Body vacio.');
    }

    let updatedCustomer;
    try {
      updatedCustomer = await prisma.customers.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true },
      });
    } catch (e) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Usuario actualizado.');
    return res.json(updatedCustomer);
  })
);

//Delete user by ID (Only admin or specific user)
customerRouters.delete(
  '/:id',
  auth(['admin', 'user']),
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = Number(value.id);

    try {
      await prisma.customers.delete({
        where: { id },
      });
    } catch (e) {
      throw new ApiError(404, 'NOT_FOUND', 'Cliente no encontrado.');
    }

    return res.status(204).end();
  })
);

module.exports.customerRouters = customerRouters;
