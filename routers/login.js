const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/pool.js');

const loginRouters = express.Router();

//Log In user and returns a JWT
loginRouters.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Formato de datos invalido.' });
  }

  const trimEmail = email.trim().toLowerCase();
  const trimPassword = password.trim();

  if (email === '' || password === '') {
    return res.status(400).json({ error: 'Datos vacios.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM customers WHERE email = $1',
      [trimEmail]
    );

    if (result.rowCount === 0) {
      console.error('Email no encontrado.');
      return res
        .status(403)
        .json({ error: 'Usuarios o contraseña incorrectos.' });
    }

    const password_hash = result.rows[0].password_hash;

    const matchPassword = await bcrypt.compare(trimPassword, password_hash);

    if (!matchPassword) {
      console.error('Contraseña incorrecta.');
      return res
        .status(403)
        .json({ error: 'Usuarios o contraseña incorrectos.' });
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'error en la base de datos.', codigo: err.code });
  }
});

module.exports = { loginRouters };
