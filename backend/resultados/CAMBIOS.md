# Registro de cambios: backend de resultados

Responsable: Francisco Torpoco

- Paso 1: punto de entrada (server.js), dependencias (package.json) y configuración (config: variables de entorno y conexión a PostgreSQL).
- Paso 2: acceso a datos (repositories: consultas SQL parametrizadas a PostgreSQL).
- Paso 3: lógica de negocio (services: caché, ranking, importación) y utilidades (utils: normalización de texto, horas y DNI).
- Paso 4: seguridad del panel (middlewares), controladores (controllers), rutas de la API (routes) y configuración de Express (app.js).
