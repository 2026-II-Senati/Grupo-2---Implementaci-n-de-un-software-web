'use strict';

const { bad } = require('../utils/http-error');

const clean = (v, max = 160) =>
  String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

function parseOps(v) {
  const ops = clean(v, 120).split(/[,;\s]+/).filter(Boolean);

  if (!ops.length || ops.length > 6 || !ops.every(o => /^\d{6,12}$/.test(o))) {
    throw bad('El N° de operación no es válido (6 a 12 dígitos; separa varios con coma).');
  }

  return ops.join(', ');
}

function parseMedio(v) {
  if (v !== 'Yape' && v !== 'Transferencia') {
    throw bad('Elige el medio de pago.');
  }

  return v;
}

function dniOk(dni, grado) {
  if (grado === '5° de Primaria') {
    return /^(\d{8}|\d{14})$/.test(dni);
  }

  return /^\d{8}$/.test(dni);
}

module.exports = { clean, parseOps, parseMedio, dniOk };
