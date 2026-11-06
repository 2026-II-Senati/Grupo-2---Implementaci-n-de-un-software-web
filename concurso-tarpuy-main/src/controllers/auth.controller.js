'use strict';

const { IS_PROD } = require('../config/env');
const { verificarPassword, crearSesion } = require('../services/auth.service');

function login(req, res) {
  const password = req.body && req.body.password;

  if (!verificarPassword(password)) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = crearSesion();

  res.set(
    'Set-Cookie',
    `adm=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${IS_PROD ? '; Secure' : ''}`
  );

  res.json({ ok: true });
}

function logout(_req, res) {
  res.set(
    'Set-Cookie',
    `adm=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${IS_PROD ? '; Secure' : ''}`
  );

  res.json({ ok: true });
}

module.exports = { login, logout };
