'use strict';

const { DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET } = process.env;

if (!DATABASE_URL || !ADMIN_PASSWORD || !SESSION_SECRET) {
  throw new Error(
    'Faltan variables de entorno: DATABASE_URL, ADMIN_PASSWORD y SESSION_SECRET son obligatorias.'
  );
}

module.exports = {
  DATABASE_URL,
  ADMIN_PASSWORD,
  SESSION_SECRET,
  PORT: process.env.PORT || 8080,
  P_DEL: Number(process.env.PRECIO_DELEGACION) || 13,
  P_LIB: Number(process.env.PRECIO_LIBRE) || 15,
  IS_PROD: process.env.NODE_ENV === 'production',
};
