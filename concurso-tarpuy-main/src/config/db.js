'use strict';

const { Pool } = require('pg');

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('Falta la variable DATABASE_URL.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
