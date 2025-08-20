const express = require('express');
const { pool } = require('../database/pool.js');
const { asyncHandler, ApiError } = require('../middleware/errors');
const { auth } = require('../middleware/auth.js');

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
    const id = Number(req.params.id);

    if (Number.isNaN(id) || !Number.isInteger(id)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID no es un numero entero.'
      );
    }

    if (id < 1) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID es un numero negativo.'
      );
    }

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
    const { name, price, stock } = req.body;

    if (
      typeof name !== 'string' ||
      typeof price !== 'number' ||
      typeof stock !== 'number'
    ) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Formato de body invalido');
    }

    const trimName = name.trim();

    if (
      trimName === '' ||
      Number.isNaN(price) ||
      !Number.isInteger(price) ||
      Number.isNaN(stock) ||
      !Number.isInteger(stock)
    ) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'Datos del body invalidos o vacios.'
      );
    }

    if (price < 1 || stock < 1) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'Precio o stock inferior a 1'
      );
    }

    const findName = await pool.query(
      'SELECT * FROM products WHERE name = $1',
      [trimName]
    );

    const result = await pool.query(
      'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING id, name, price, stock',
      [trimName, price, stock]
    );

    console.log('Nuevo producto añadido.');
    return res.status(201).json(result.rows[0]);
  })
);

//Update product by ID (Only Admin)
productsRouters.patch(
  '/:id',
  auth(['admin']),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { name, price, stock } = req.body;

    if (Number.isNaN(id) || !Number.isInteger(id)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID no es un numero entero.'
      );
    }

    if (id < 1) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID es un numero negativo.'
      );
    }

    let newName = undefined;
    let newPrice = undefined;
    let newStock = undefined;

    if (name !== undefined) {
      const trimName = name.trim();
      if (trimName !== '') {
        newName = trimName;
      } else {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Nombre invalido o indefinido.'
        );
      }
    }

    if (price !== undefined) {
      if (Number.isInteger(price) && !Number.isNaN(price) && price > 0) {
        newPrice = price;
      } else {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Precio invalido o indefinido'
        );
      }
    }

    if (stock !== undefined) {
      if (Number.isInteger(stock) && !Number.isNaN(stock) && stock > 0) {
        newStock = stock;
      } else {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Precio invalido o indefinido'
        );
      }
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
    const id = Number(req.params.id);

    if (Number.isNaN(id) || !Number.isInteger(id)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID no es un numero entero.'
      );
    }

    if (id < 1) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'El ID es un numero negativo.'
      );
    }

    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Producto no encontrado.');
    }

    return res.status(204).end();
  })
);

module.exports.productsRouters = productsRouters;
