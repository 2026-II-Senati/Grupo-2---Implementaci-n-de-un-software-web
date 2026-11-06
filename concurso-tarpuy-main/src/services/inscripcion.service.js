'use strict';

const { P_DEL, P_LIB } = require('../config/env');
const { GRADOS, GRADO_NIVEL, NIVELES, MAX_POR_GRADO } = require('../config/catalogo');
const { HttpError, bad } = require('../utils/http-error');
const { clean, parseOps, parseMedio, dniOk } = require('./validacion.service');
const repo = require('../repositories/inscripcion.repository');

async function registrarFicha(body) {
  const b = body || {};

  const ie = clean(b.ie);
  const director = clean(b.director);
  const direccion = clean(b.dir, 200);
  const tel = clean(b.tel, 20);
  const correo = clean(b.mail, 120);
  const pagador = clean(b.pagador, 120);

  if (!ie || !director || !direccion) {
    throw bad('Completa los datos de la institución.');
  }

  if (b.tipo !== 'Estatal' && b.tipo !== 'Privado') {
    throw bad('Elige el tipo de I.E.');
  }

  if (!/^\d{6,9}$/.test(tel)) throw bad('El teléfono no es válido.');
  if (!/^\S+@\S+\.\S+$/.test(correo)) throw bad('El correo no es válido.');

  const operacion = parseOps(b.operacion);
  const medio = parseMedio(b.medio);

  if (!Array.isArray(b.alumnos) || !b.alumnos.length) {
    throw bad('Agrega al menos un alumno.');
  }

  if (b.alumnos.length > GRADOS.length * MAX_POR_GRADO) {
    throw bad('Demasiados alumnos.');
  }

  const alumnos = [];
  const seen = new Set();
  const porGrado = {};
  const nivelesUsados = new Set();

  for (const a of b.alumnos) {
    const grado = clean(a.grado, 40);
    const nivel = GRADO_NIVEL[grado];

    if (!nivel) throw bad('Grado no válido.');

    const dni = clean(a.dni, 14);
    const nombre = clean(a.nombre, 120);

    if (!nombre) throw bad('Falta el nombre de un alumno.');
    if (!dniOk(dni, grado)) throw bad(`DNI no válido: ${dni || '(vacío)'}.`);
    if (seen.has(dni)) throw bad(`El DNI ${dni} está repetido en la ficha.`);

    seen.add(dni);
    porGrado[grado] = (porGrado[grado] || 0) + 1;

    if (porGrado[grado] > MAX_POR_GRADO) {
      throw bad(`Máximo ${MAX_POR_GRADO} alumnos por grado (${grado}).`);
    }

    alumnos.push({ nivel, grado, nro: porGrado[grado], dni, nombre });
    nivelesUsados.add(nivel);
  }

  const asesores = [];

  for (const a of Array.isArray(b.asesores) ? b.asesores : []) {
    const nivel = clean(a.nivel, 20);
    const nombre = clean(a.nombre, 120);
    const t = clean(a.tel, 20);

    if (!NIVELES.includes(nivel)) throw bad('Nivel de asesor no válido.');
    if (!nombre || !/^\d{6,9}$/.test(t)) {
      throw bad(`Completa el asesor de ${nivel} (nombre y teléfono).`);
    }

    asesores.push({ nivel, nombre, tel: t });
  }

  for (const nivel of nivelesUsados) {
    if (!asesores.some(a => a.nivel === nivel)) {
      throw bad(`Falta el asesor del nivel ${nivel}.`);
    }
  }

  const monto = alumnos.length * P_DEL;

  try {
    const resultado = await repo.crearFicha(
      { ie, director, tipo: b.tipo, direccion, tel, correo, monto, operacion, medio, pagador },
      asesores,
      alumnos
    );

    return { ok: true, id: resultado.id, monto, alumnos: alumnos.length };
  } catch (error) {
    if (error.status === 409) throw new HttpError(409, error.message);
    if (error.code === '23505') {
      throw new HttpError(409, 'Uno de los DNI ya está inscrito.');
    }
    throw error;
  }
}

async function registrarLibre(body) {
  const b = body || {};

  const grado = clean(b.grado, 40);
  const nivel = GRADO_NIVEL[grado];

  if (!nivel) throw bad('Elige el grado.');

  const dni = clean(b.dni, 14);
  const nombre = clean(b.nombre, 120);
  const pagador = clean(b.pagador, 120);
  const tel = clean(b.tel, 20);

  if (!nombre) throw bad('Falta el nombre del alumno.');
  if (!/^9\d{8}$/.test(tel)) {
    throw bad('El celular debe tener 9 dígitos y empezar con 9.');
  }
  if (!dniOk(dni, grado)) throw bad('El DNI debe tener 8 dígitos.');

  const operacion = parseOps(b.operacion);
  const medio = parseMedio(b.medio);
  const monto = P_LIB;

  try {
    const id = await repo.crearLibre({
      dni, grado, nivel, nombre, tel, monto, operacion, medio, pagador
    });

    return { ok: true, id, monto };
  } catch (error) {
    if (error.status === 409 || error.code === '23505') {
      throw new HttpError(409, `El DNI ${dni} ya está inscrito.`);
    }
    throw error;
  }
}

module.exports = { registrarFicha, registrarLibre };
