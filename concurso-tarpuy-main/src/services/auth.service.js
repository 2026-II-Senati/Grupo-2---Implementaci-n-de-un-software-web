'use strict';

const crypto = require('crypto');
const { SESSION_SECRET, ADMIN_PASSWORD } = require('../config/env');

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function sameStr(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

function verificarPassword(password) {
  return sameStr(password, ADMIN_PASSWORD);
}

function crearSesion() {
  const exp = String(Date.now() + 12 * 3600 * 1000);
  return `${exp}.${sign(exp)}`;
}

function validarSesion(token) {
  if (!token) return false;

  const [exp, signature] = token.split('.');
  if (!exp || !signature || Number(exp) < Date.now()) return false;

  return sameStr(signature, sign(exp));
}

module.exports = { verificarPassword, crearSesion, validarSesion };
