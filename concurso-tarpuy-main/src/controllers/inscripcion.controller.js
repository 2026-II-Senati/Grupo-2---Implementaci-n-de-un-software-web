'use strict';

const service = require('../services/inscripcion.service');

async function crearFicha(req, res) {
  const resultado = await service.registrarFicha(req.body);
  res.status(201).json(resultado);
}

async function crearLibre(req, res) {
  const resultado = await service.registrarLibre(req.body);
  res.status(201).json(resultado);
}

module.exports = { crearFicha, crearLibre };
