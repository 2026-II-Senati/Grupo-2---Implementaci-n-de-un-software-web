'use strict';

const { validarSesion } = require('../services/auth.service');

function obtenerCookies(req) {
  const resultado = {};

  for (const parte of (req.headers.cookie || '').split(';')) {
    const i = parte.indexOf('=');

    if (i > 0) {
      try {
        resultado[parte.slice(0, i).trim()] =
          decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        return {};
      }
    }
  }

  return resultado;
}

function needAdmin(req, res, next) {
  const token = obtenerCookies(req).adm;

  if (!validarSesion(token)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
}

module.exports = { needAdmin };
