const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth.js');
const { pool } = require('../database/pool.js');
const { ApiError, asyncHandler } = require('../middleware/errors.js');

const customerRouters = express.Router();

//Get all users (Only admin)
customerRouters.get(
  '/',
  auth(['admin']),
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      'SELECT id, name, email, role FROM customers ORDER BY id'
    );

    return res.json(result.rows);
  })
);

// Get user by ID (Only admin or specific user)
customerRouters.get(
  '/:id',
  auth(['admin', 'user']),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || !Number.isInteger(id)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'ID Invalido',
        'El ID no es un numero entero.'
      );
    }

    if (id < 1) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'ID Invalido',
        'El ID es un numero negativo.'
      );
    }

    const result = await pool.query(
      'SELECT name, email FROM customers WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Cliente no encontrado.');
    }

    return res.json(result.rows[0]);
  })
);

//Sign up new user
customerRouters.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      (role !== undefined && typeof role !== 'string')
    ) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Datos del body invalidos');
    }

    const trimName = name.trim();
    const trimEmail = email.trim().toLowerCase();
    const trimPassword = password.trim();
    const trimRole =
      typeof role === 'string' ? role.trim().toLowerCase() : 'user';

    if (
      trimName === '' ||
      trimEmail === '' ||
      trimPassword === '' ||
      trimRole === ''
    ) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Datos vacios.');
    }

    const password_hash = await bcrypt.hash(
      trimPassword,
      Number(process.env.BCRYPT_SALT)
    );

    const result = await pool.query(
      'INSERT INTO customers (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [trimName, trimEmail, password_hash, trimRole]
    );
    return res.status(201).json(result.rows[0]);
  })
);

//Delete user by ID (Only admin or specific user)
customerRouters.delete(
  '/:id',
  auth(['admin', 'user']),
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

    const result = await pool.query('DELETE FROM customers WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Cliente no encontrado.');
    }

    return res.status(204).end();
  })
);

module.exports.customerRouters = customerRouters;
