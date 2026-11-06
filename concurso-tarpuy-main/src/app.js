'use strict';

const express = require('express');
const path = require('path');

const inscripcionRoutes = require('./routes/inscripcion.routes');
const adminRoutes = require('./routes/admin.routes');
const { securityHeaders } = require('./middlewares/security');
const { HttpError } = require('./utils/http-error');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '200kb' }));
app.use(securityHeaders);

app.get('/healthz', async (_req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use('/api', inscripcionRoutes);
app.use('/api/admin', adminRoutes);

/*
 * Frontend de Inscripciones
 * Sirve la aplicación React compilada desde frontend/inscripciones/dist
 */
const frontendPath = path.join(
  __dirname,
  '..',
  '..',
  'frontend',
  'inscripciones',
  'dist'
);

app.use(express.static(frontendPath, {
  maxAge: '1h'
}));

/*
 * Las rutas API inexistentes deben responder JSON
 * y no devolver el index.html de React.
 */
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

/*
 * Para cualquier ruta del frontend se devuelve React.
 */
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err instanceof HttpError || err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Solicitud no válida.' });
  }

  console.error(err);
  res.status(500).json({
    error: 'Error del servidor. Inténtalo de nuevo en un momento.'
  });
});

module.exports = app;