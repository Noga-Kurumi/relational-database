const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/prisma.js');
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

    const result = await prisma.customers.findUnique({
      where: { email: trimEmail },
      select: { id: true, email: true, password_hash: true, role: true },
    });

    if (!result) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Usuarios o contraseña incorrectos.'
      );
    }

    const password_hash = result.password_hash;

    const matchPassword = await bcrypt.compare(trimPassword, password_hash);

    if (!matchPassword) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Usuarios o contraseña incorrectos.'
      );
    }

    const user = result;

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

    const result = await prisma.customers.create({
      data: {
        name: trimName,
        email: trimEmail,
        password_hash,
        role: value.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json(result);
  })
);

module.exports = { loginRouters };
