'use strict';

const ExcelJS = require('exceljs');
const repo = require('../repositories/admin.repository');
const { bad } = require('../utils/http-error');

async function obtenerDatos() {
  return repo.loadAll();
}

async function verificarPago(body) {
  const { t, id, v } = body || {};

  if (!['fichas', 'libres'].includes(t) || !Number.isInteger(id)) {
    throw bad('Datos no válidos.');
  }

  await repo.verificarPago(t, id, !!v);
  return { ok: true };
}

async function generarExcel() {
  const { fichas, libres } = await repo.loadAll();
  const wb = new ExcelJS.Workbook();

  wb.creator = 'Tarpuy · XI Concurso Nacional de Matemática Lima Este 2026';

  const estado = v => v ? 'Verificado' : 'Pendiente';

  const sheet = (name, cols, rows) => {
    const ws = wb.addWorksheet(name, {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    ws.columns = cols.map(([header, key, width]) => ({
      header, key, width
    }));

    rows.forEach(r => ws.addRow(r));

    const h = ws.getRow(1);
    h.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    h.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0A1A5C' }
    };

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: cols.length }
    };

    return ws;
  };

  const alumnos = [];
  const asesores = [];

  fichas.forEach(f => {
    f.alumnos.forEach(a => alumnos.push({
      ie: f.ie, tipo: f.tipo, nivel: a.nivel,
      grado: a.grado, n: a.n, dni: a.dni, nombre: a.nombre
    }));

    f.asesores.forEach(a => asesores.push({
      ie: f.ie, nivel: a.nivel, nombre: a.nombre, tel: a.tel
    }));
  });

  sheet('Alumnos', [
    ['I.E.', 'ie', 38], ['Tipo', 'tipo', 10],
    ['Nivel', 'nivel', 12], ['Grado', 'grado', 18],
    ['N°', 'n', 6], ['DNI / Código', 'dni', 16],
    ['Apellidos y nombres', 'nombre', 40]
  ], alumnos);

  sheet('Instituciones', [
    ['N°', 'n', 6], ['Nombre de la I.E.', 'ie', 38],
    ['Tipo', 'tipo', 10], ['Director', 'director', 30],
    ['Dirección', 'dir', 36], ['Teléfono', 'tel', 12],
    ['Correo', 'mail', 30], ['N° alumnos', 'na', 11],
    ['Monto (S/)', 'monto', 11], ['Medio de pago', 'medio', 15],
    ['N° operación', 'operacion', 22], ['Pagó (nombre)', 'pagador', 26],
    ['Estado de pago', 'estado', 14], ['Fecha de registro', 'fecha', 20]
  ], fichas.map((f, i) => ({
    n: i + 1, ie: f.ie, tipo: f.tipo, director: f.director,
    dir: f.dir, tel: f.tel, mail: f.mail, na: f.alumnos.length,
    monto: f.monto, medio: f.medio, operacion: f.operacion,
    pagador: f.pagador, estado: estado(f.verificado), fecha: f.fecha
  })));

  sheet('Asesores', [
    ['I.E.', 'ie', 38], ['Nivel', 'nivel', 12],
    ['Apellidos y nombres del asesor', 'nombre', 38],
    ['Teléfono', 'tel', 12]
  ], asesores);

  sheet('Alumnos libres', [
    ['N°', 'n', 6], ['DNI', 'dni', 12],
    ['Grado', 'grado', 18], ['Nivel', 'nivel', 12],
    ['Apellidos y nombres', 'nombre', 40],
    ['Celular / WhatsApp', 'tel', 16], ['Monto (S/)', 'monto', 11],
    ['Medio de pago', 'medio', 15], ['N° operación', 'operacion', 22],
    ['Pagó (nombre)', 'pagador', 26], ['Estado de pago', 'estado', 14],
    ['Fecha de registro', 'fecha', 20]
  ], libres.map((r, i) => ({
    n: i + 1, ...r, estado: estado(r.verificado)
  })));

  return wb;
}

module.exports = { obtenerDatos, verificarPago, generarExcel };
