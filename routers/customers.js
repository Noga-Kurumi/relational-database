const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth.js');
const { pool } = require('../database/pool.js');
const { ApiError, asyncHandler } = require('../middleware/errors.js');
const { customerScheme, idScheme } = require('../middleware/validators.js');

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
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

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
    const { errorID, valueID } = idScheme.validate(req.params);

    if (errorID) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = valueID.id;

    const { errorBody, valueBody } = customerScheme.validate(req.body);

    if (errorBody) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    let newName = undefined;
    let newEmail = undefined;
    let newPassword = undefined;

    if (valueBody.name !== undefined) {
      const trimName = valueBody.name.trim();
      newName = trimName;
    }

    if (valueBody.email !== undefined) {
      const trimEmail = valueBody.name.trim().toLowerCase();
      newEmail = trimEmail;
    }

    if (valueBody.password !== undefined) {
      const trimPassword = valueBody.password.trim();
      newPassword = await bcrypt.hash(
        trimPassword,
        Number(process.env.BCRYPT_SALT)
      );
    }

    if (
      valueBody.name == undefined &&
      valueBody.price == undefined &&
      valueBody.stock == undefined
    ) {
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
    const { error, value } = idScheme.validate(req.params);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const id = value.id;

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
