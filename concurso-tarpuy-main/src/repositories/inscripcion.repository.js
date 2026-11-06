'use strict';

const pool = require('../config/db');

async function crearFicha(datos, asesores, alumnos) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const dnis = alumnos.map(a => a.dni);

    const duplicados = await client.query(
      `SELECT dni FROM alumnos WHERE dni = ANY($1)
       UNION
       SELECT dni FROM libres WHERE dni = ANY($1)`,
      [dnis]
    );

    if (duplicados.rowCount) {
      const error = new Error(
        `Ya existe una inscripción con estos DNI: ${duplicados.rows.map(r => r.dni).join(', ')}.`
      );
      error.status = 409;
      throw error;
    }

    const f = await client.query(
      `INSERT INTO fichas
       (ie,director,tipo,direccion,telefono,correo,monto,operacion,medio,pagador)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        datos.ie, datos.director, datos.tipo, datos.direccion,
        datos.tel, datos.correo, datos.monto, datos.operacion,
        datos.medio, datos.pagador || null
      ]
    );

    const id = f.rows[0].id;

    for (const a of asesores) {
      await client.query(
        `INSERT INTO asesores (ficha_id,nivel,nombre,telefono)
         VALUES ($1,$2,$3,$4)`,
        [id, a.nivel, a.nombre, a.tel]
      );
    }

    await client.query(
      `INSERT INTO alumnos (ficha_id,nivel,grado,nro,dni,nombre)
       SELECT $1, * FROM unnest(
         $2::text[], $3::text[], $4::int[], $5::text[], $6::text[]
       )`,
      [
        id,
        alumnos.map(a => a.nivel),
        alumnos.map(a => a.grado),
        alumnos.map(a => a.nro),
        dnis,
        alumnos.map(a => a.nombre)
      ]
    );

    await client.query('COMMIT');
    return { id };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function crearLibre(datos) {
  const duplicado = await pool.query(
    `SELECT 1 FROM alumnos WHERE dni = $1
     UNION
     SELECT 1 FROM libres WHERE dni = $1`,
    [datos.dni]
  );

  if (duplicado.rowCount) {
    const error = new Error(`El DNI ${datos.dni} ya está inscrito.`);
    error.status = 409;
    throw error;
  }

  const resultado = await pool.query(
    `INSERT INTO libres
     (dni,grado,nivel,nombre,telefono,monto,operacion,medio,pagador)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      datos.dni, datos.grado, datos.nivel, datos.nombre,
      datos.tel, datos.monto, datos.operacion, datos.medio,
      datos.pagador || null
    ]
  );

  return resultado.rows[0].id;
}

module.exports = { crearFicha, crearLibre };
