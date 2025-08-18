const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth.js');
const { pool } = require('../database/pool.js');

const customerRouters = express.Router();

//Get all users (Only admin)
customerRouters.get('/', auth(['admin']), async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM customers ORDER BY id'
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'error en la base de datos.', codigo: err.code });
  }
});

// Get user by ID (Only admin or specific user)
customerRouters.get('/:id', auth(['admin', 'user']), async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id) || !Number.isInteger(id)) {
    return res
      .status(400)
      .json({ error: 'El parametro ID ingresado no es un numero entero.' });
  }

  if (id < 1) {
    return res.status(400).json({ error: 'Parametro de ID invalido.' });
  }

  try {
    const result = await pool.query(
      'SELECT name, email FROM customers WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'error en la base de datos.', codigo: err.code });
  }
});

//Sign up new user
customerRouters.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof role !== 'string'
  ) {
    return res.status(400).json({ error: 'Formato de datos invalido!' });
  }

  const trimName = name.trim();
  const trimEmail = email.trim().toLowerCase();
  const trimPassword = password.trim();
  const trimRole = role.trim();

  if (trimName === '' || trimEmail === '' || trimPassword === '') {
    return res.status(400).json({ error: 'Datos invalidos' });
  }

  try {
    const password_hash = await bcrypt.hash(
      trimPassword,
      Number(process.env.BCRYPT_SALT)
    );

    const result = await pool.query(
      'INSERT INTO customers (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [trimName, trimEmail, password_hash, trimRole]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email ya registrado.' });
    }

    return res
      .status(500)
      .json({ error: 'error en la base de datos.', codigo: err.code });
  }
});

//Delete user by ID (Only admin or specific user)
customerRouters.delete('/:id', auth(['admin', 'user']), async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id) || !Number.isInteger(id)) {
    return res
      .status(400)
      .json({ error: 'El parametro ID ingresado no es un numer entero.' });
  }

  if (id < 1) {
    return res.status(400).json({ error: 'Parametro de ID invalido.' });
  }

  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado.' });
    }

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'error en la base de datos.', codigo: err.code });
  }
});

module.exports.customerRouters = customerRouters;
