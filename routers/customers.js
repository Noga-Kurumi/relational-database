const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth.js');
const { pool } = require('../database/pool.js');
const { ApiError, asyncHandler } = require('../middleware/errors.js');
const {
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
} = require('../middleware/validators.js');

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

//Update user by ID (Only admin or specific user)
customerRouters.patch(
  '/:id',
  auth(['admin', 'user']),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;

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
    let newEmail = undefined;
    let newPassword = undefined;

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

    if (email !== undefined) {
      const trimEmail = name.trim().toLowerCase();
      if (EMAIL_REGEX.test(trimEmail)) {
        newEmail = trimEmail;
      } else {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Email invalido o indefinido.'
        );
      }
    }

    if (password !== undefined) {
      const trimPassword = password.trim();
      if (trimPassword.length > MIN_PASSWORD_LENGTH) {
        newPassword = await bcrypt.hash(
          trimPassword,
          Number(process.env.BCRYPT_SALT)
        );
      } else {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Contraseña invalida o indefinida.'
        );
      }
    }

    if (name == undefined && price == undefined && stock == undefined) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Body vacio.');
    }

    const result = await pool.query(
      'UPDATE customers SET name = COALESCE($1, name), email = COALESCE($2, email), password_hash = COALESCE($3, password_hash) WHERE id = $4 RETURNING id, name, email',
      [newName, newEmail, newPassword, id]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.');
    }

    console.log('Usuario actualizado.');
    return res.json(result.rows[0]);
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
