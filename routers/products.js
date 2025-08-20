const express = require('express');
const { auth } = require('../middleware/auth.js');
const {
  idScheme,
  productScheme,
  updateProductScheme,
} = require('../middleware/validators.js');
const { asyncHandler, ApiError } = require('../middleware/errors');
const prisma = require('../prisma/prisma.js');

const productsRouters = express.Router();

//Get all products
productsRouters.get(
  '/',
  asyncHandler(async (_req, res) => {
    const result = await prisma.products.findMany({
      select: { id: true, name: true, price: true, stock: true },
      orderBy: { id: 'asc' },
    });

    return res.json(result);
  })
);

//Get product by ID
productsRouters.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

    const result = await prisma.products.findUnique({
      where: { id },
      select: { id: true, name: true, price: true, stock: true },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    return res.json(result);
  })
);

//Add new product (Only Admin)
productsRouters.post(
  '/',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error, value } = productScheme.validate(req.body);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const trimName = value.name.trim();

    const result = await prisma.products.create({
      data: {
        name: trimName,
        price: value.price,
        stock: value.stock,
      },
      select: { name: true, price: true, stock: true },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Nuevo producto añadido.');
    return res.status(201).json(result);
  })
);

//Update product by ID (Only Admin)
productsRouters.patch(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error: errId, value: valParams } = idScheme.validate(req.params);

    if (errId) {
      throw new ApiError(400, 'VALIDATION_ERROR', errId.details[0].message);
    }

    const id = valParams.id;

    const { error: errBody, value: valBody } = updateProductScheme.validate(
      req.body
    );

    if (errBody) {
      throw new ApiError(400, 'VALIDATION_ERROR', errBody.details[0].message);
    }

    const { name, price, stock } = valBody;

    let data = {};

    if (name !== undefined) {
      const trimName = name.trim();
      data.name = trimName;
    }

    if (price !== undefined) {
      data.price = price;
    }

    if (stock !== undefined) {
      data.stock = stock;
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Body vacio.');
    }

    const result = await prisma.products.update({
      where: { id },
      data,
      select: { id: true, name: true, price: true, stock: true },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Producto actualizado.');
    return res.json(result);
  })
);

productsRouters.delete(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const { error: errId, value: valParams } = idScheme.validate(req.params);

    if (errId) {
      throw new ApiError(400, 'VALIDATION_ERROR', errId.details[0].message);
    }

    const id = valParams.id;

    const result = await prisma.products.delete({
      where: { id },
    });

    if (!result) {
      throw new ApiError(404, 'NOT_FOUND', 'Producto no encontrado.');
    }

    return res.status(204).end();
  })
);

module.exports.productsRouters = productsRouters;
