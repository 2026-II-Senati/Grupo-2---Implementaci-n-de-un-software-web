'use strict';

const service = require('../services/admin.service');

async function obtenerDatos(req, res) {
  res.set('Cache-Control', 'no-store');
  res.json(await service.obtenerDatos());
}

async function verificarPago(req, res) {
  res.json(await service.verificarPago(req.body));
}

async function exportarExcel(req, res) {
  const wb = await service.generarExcel();

  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="inscritos-xi-concurso-matematica-lima-este-2026.xlsx"',
    'Cache-Control': 'no-store',
  });

  await wb.xlsx.write(res);
  res.end();
}

module.exports = { obtenerDatos, verificarPago, exportarExcel };
