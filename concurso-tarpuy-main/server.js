'use strict';

require('./src/config/env');

const { PORT } = require('./src/config/env');
const { initSchema } = require('./src/repositories/schema.repository');
const app = require('./src/app');

(async () => {
  try {
    await initSchema();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Concurso Tarpuy escuchando en :${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar:', error.message);
    process.exit(1);
  }
})();
