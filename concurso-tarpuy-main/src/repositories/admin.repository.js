'use strict';

const pool = require('../config/db');

async function loadAll() {
  const [f, as, al, li] = await Promise.all([
    pool.query('SELECT * FROM fichas ORDER BY id'),
    pool.query('SELECT * FROM asesores ORDER BY id'),
    pool.query('SELECT * FROM alumnos ORDER BY ficha_id, id'),
    pool.query('SELECT * FROM libres ORDER BY id'),
  ]);

  const fichas = f.rows.map(r => ({
    _id: r.id, ie: r.ie, director: r.director, tipo: r.tipo,
    dir: r.direccion, tel: r.telefono, mail: r.correo,
    monto: r.monto, operacion: r.operacion, medio: r.medio,
    pagador: r.pagador || '', verificado: r.verificado,
    fecha: r.created_at, asesores: [], alumnos: [],
  }));

  const byId = new Map(fichas.map(x => [x._id, x]));

  for (const a of as.rows) {
    byId.get(a.ficha_id)?.asesores.push({
      nivel: a.nivel, nombre: a.nombre, tel: a.telefono
    });
  }

  for (const a of al.rows) {
    byId.get(a.ficha_id)?.alumnos.push({
      nivel: a.nivel, grado: a.grado, n: a.nro,
      dni: a.dni, nombre: a.nombre
    });
  }

  const libres = li.rows.map(r => ({
    _id: r.id, dni: r.dni, grado: r.grado, nivel: r.nivel,
    nombre: r.nombre, tel: r.telefono || '', monto: r.monto,
    operacion: r.operacion, medio: r.medio,
    pagador: r.pagador || '', verificado: r.verificado,
    fecha: r.created_at,
  }));

  return { fichas, libres };
}

async function verificarPago(tipo, id, verificado) {
  await pool.query(
    `UPDATE ${tipo} SET verificado = $1 WHERE id = $2`,
    [verificado, id]
  );
}

module.exports = { loadAll, verificarPago };
