const express = require('express');
const { pool } = require('../database/pool.js');
const { auth } = require('../middleware/auth.js');
const {
  idScheme,
  productScheme,
  updateProductScheme,
} = require('../middleware/validators.js');
const { asyncHandler, ApiError } = require('../middleware/errors');

const productsRouters = express.Router();

//Get all products
productsRouters.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await pool.query('SELECT * FROM products');
    return res.json(result.rows);
  })
);

//Get product by ID
productsRouters.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error, value } = idScheme.validate(req.params.id);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    return res.json(result.rows[0]);
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

    const result = await pool.query(
      'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING id, name, price, stock',
      [trimName, value.price, value.stock]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Nuevo producto añadido.');
    return res.status(201).json(result.rows[0]);
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

    let newName = undefined;
    let newPrice = undefined;
    let newStock = undefined;

    if (name !== undefined) {
      const trimName = name.trim();
      newName = trimName;
    }

    if (price !== undefined) {
      newPrice = price;
    }

    if (stock !== undefined) {
      newStock = stock;
    }

    if (name == undefined && price == undefined && stock == undefined) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Body vacio.');
    }

    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), stock = COALESCE($3, stock) WHERE id = $4 RETURNING id, name, price, stock',
      [newName, newPrice, newStock, id]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Producto actualizado.');
    return res.json(result.rows[0]);
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

    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Producto no encontrado.');
    }

    return res.status(204).end();
  })
);

module.exports.productsRouters = productsRouters;
