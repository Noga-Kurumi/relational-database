const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/pool.js');
const { ApiError, asyncHandler } = require('../middleware/errors.js');
const { loginScheme, signupScheme } = require('../middleware/validators.js');

const loginRouters = express.Router();

//Log In user and returns a JWT
loginRouters.post(
  '/',
  asyncHandler(async (req, res) => {
    const { error, value } = loginScheme.validate(req.body);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const trimEmail = value.email.trim().toLowerCase();
    const trimPassword = value.password.trim();

    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM customers WHERE email = $1',
      [trimEmail]
    );

    if (result.rowCount === 0) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Usuarios o contraseña incorrectos.'
      );
    }

    const password_hash = result.rows[0].password_hash;

    const matchPassword = await bcrypt.compare(trimPassword, password_hash);

    if (!matchPassword) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Usuarios o contraseña incorrectos.'
      );
    }

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '12h' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  })
);

//Sign up new user
loginRouters.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { error, value } = signupScheme.validate(req.body);

    if (error) {
      throw new ApiError(400, 'VALIDATION_ERROR', error.details[0].message);
    }

    const trimName = value.name.trim();
    const trimEmail = value.email.trim().toLowerCase();
    const trimPassword = value.password.trim();

    const password_hash = await bcrypt.hash(
      trimPassword,
      Number(process.env.BCRYPT_SALT)
    );

    const result = await pool.query(
      'INSERT INTO customers (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [trimName, trimEmail, password_hash, value.role]
    );
    return res.status(201).json(result.rows[0]);
  })
);

module.exports = { loginRouters };
