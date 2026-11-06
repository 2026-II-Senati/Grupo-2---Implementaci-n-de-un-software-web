# Plataforma Web Tarpuy — Inscripciones y Resultados

Proyecto académico del Grupo 2 del curso **Fullstack Developer Software** de **SENATI**, carrera de Ingeniería de Software con Inteligencia Artificial. Plataforma para gestionar inscripciones y publicar resultados del **XI Concurso Nacional de Matemática Lima Este 2026 — Olimpiada Tarpuyana**.

## Estado del proyecto

La rama `main` contiene los módulos integrados de **inscripciones**, **resultados** y **base de datos PostgreSQL**. Se comprobó localmente el flujo de inscripción de un alumno libre, verificación de pago, consulta administrativa, registro de puntaje, publicación y visualización del orden de mérito. Las pruebas no equivalen a una validación completa de todos los formularios o del despliegue en producción.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, JavaScript |
| Backend | Node.js, Express, API REST |
| Base de datos | PostgreSQL y controlador `pg` |
| Colaboración | Git, GitHub y Pull Requests |

Los dos sistemas comparten datos de participantes en PostgreSQL. El backend de inscripciones registra las fichas, asesores y alumnos; el backend de resultados consulta esos participantes y gestiona los puntajes y la publicación.

## Estructura actual del repositorio

```text
Grupo-2---Implementaci-n-de-un-software-web/
├── backend/
│   └── resultados/                  # API de resultados (Node.js + PostgreSQL)
├── concurso-tarpuy-main/            # API ACTUAL de inscripciones
├── frontend/
│   ├── inscripciones/               # React + Tailwind (puerto 5173 en desarrollo)
│   └── resultados/                  # React + Tailwind (puerto 5174 en desarrollo)
├── database/
│   ├── scripts/
│   │   ├── 01_inscripciones.sql
│   │   ├── 02_resultados.sql
│   │   ├── 03_roles.sql
│   │   └── 04_datos_prueba.sql
│   └── docker/
├── legacy/
│   └── Resultados-ConcursoMat2026-main/
│                                     # Implementación anterior, conservada como referencia
├── .gitignore
└── README.md
```

> **Importante:** aunque se llame `concurso-tarpuy-main/`, esa carpeta contiene el **backend actual** de inscripciones y no debe considerarse obsoleta. La implementación anterior de resultados se encuentra en `legacy/`; **no debe usarse para arrancar la versión actual**. Sus archivos `Dockerfile` y `fly.toml` son históricos. Antes de modificar despliegues existentes, revisar su configuración en el proveedor correspondiente.

## Funcionalidades

### Inscripciones

- Inscripción de alumnos libres y por delegaciones de instituciones educativas.
- Datos de instituciones, asesores y participantes.
- Validaciones de datos y control de duplicados.
- Registro del medio y número de operación de pago.
- Panel organizador para consultar inscripciones y verificar pagos.
- Exportación administrativa de participantes, según las funciones del módulo.

### Resultados

- Búsqueda de participantes inscritos.
- Registro de puntajes y hora de entrega.
- Carga por grado e importación administrativa.
- Cálculo de orden de mérito y ranking de instituciones.
- Activación o desactivación de la publicación de resultados.
- Consulta pública de resultados.

## Requisitos locales

- Git.
- **Node.js 20.19 o posterior** (requerido por los frontends con Vite 8).
- npm.
- PostgreSQL.
- WebStorm, VS Code u otro editor.

Verificar herramientas:

```powershell
node -v
npm -v
git --version
```

## Preparación de PostgreSQL

Crear una base de datos, por ejemplo `tarpuy_local`. Desde la raíz del repositorio, ejecutar en este orden los scripts utilizando `psql` y un usuario autorizado:

```powershell
psql -U postgres -d tarpuy_local -f "database/scripts/01_inscripciones.sql"
psql -U postgres -d tarpuy_local -f "database/scripts/02_resultados.sql"
```

El archivo `03_roles.sql` configura roles con permisos específicos y requiere revisión de credenciales antes de utilizarse. `04_datos_prueba.sql` contiene datos ficticios para pruebas y **no debe ejecutarse en una base con datos reales**.

> Si `psql` no está agregado al `PATH` de Windows, utilizar la ruta completa de `psql.exe` instalada con PostgreSQL.

## Backend de inscripciones

Carpeta: `concurso-tarpuy-main/`.

```powershell
cd concurso-tarpuy-main
npm install
```

Crear un archivo local `.env` **sin subirlo a GitHub**:

```dotenv
DATABASE_URL=postgresql://postgres:TU_CLAVE@localhost:5432/tarpuy_local
ADMIN_PASSWORD=CAMBIAR_POR_UNA_CLAVE_SEGURA
SESSION_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO_Y_ALEATORIO
PORT=8080
```

Iniciar:

```powershell
node --env-file=.env server.js
```

Comprobación de salud: `http://localhost:8080/healthz`.

## Frontend de inscripciones

Desde la raíz del repositorio:

```powershell
cd frontend/inscripciones
npm install
npm run dev
```

Interfaz local: `http://localhost:5173/`. Vite redirige las solicitudes `/api` al backend de inscripciones en el puerto **8080**.

## Backend de resultados

Desde la raíz del repositorio:

```powershell
cd backend/resultados
npm install
```

Crear un archivo local `.env` **sin subirlo a GitHub**:

```dotenv
DATABASE_URL=postgresql://postgres:TU_CLAVE@localhost:5432/tarpuy_local
ADMIN_PASSWORD=CAMBIAR_POR_UNA_CLAVE_SEGURA
PORT=3000
```

En desarrollo puede usarse una conexión `DATABASE_URL` común. Para producción se recomienda separar accesos mediante `DATABASE_URL_LECTOR` y `DATABASE_URL_ADMIN`, con roles de privilegios mínimos.

Iniciar:

```powershell
npm run dev
```

El backend utiliza el puerto **3000** por defecto. Durante pruebas locales se utilizó temporalmente el **3001** por un conflicto del equipo; ese cambio no forma parte de la configuración guardada en Git.

## Frontend de resultados

Desde la raíz del repositorio:

```powershell
cd frontend/resultados
npm install
npm run dev
```

- Portada: `http://localhost:5174/`
- Resultados públicos: `http://localhost:5174/resultados`
- Administración: `http://localhost:5174/admin`

El proxy configurado en `frontend/resultados/vite.config.js` apunta al backend de resultados en el puerto **3000**. Si el backend usa otro puerto local, ambos valores deben coincidir durante el desarrollo.

## Compilación de las interfaces

```powershell
cd frontend/inscripciones
npm run build

cd ../resultados
npm run build
```

Las compilaciones se guardan en `frontend/inscripciones/dist/` y `frontend/resultados/dist/`. Ambas rutas están excluidas de Git mediante `.gitignore`. Los servidores actuales están preparados para servir esas compilaciones desde la estructura del repositorio; el despliegue requiere ajustar su contexto de construcción y variables de entorno.

## Organización y colaboración con Git

- `main`: rama principal de integración estable.
- `develop`: rama de integración para nuevos trabajos.
- `feature/*`, `fix/*`, `chore/*` y `docs/*`: ramas temporales por tarea.
- Los cambios se integran mediante Pull Request, preferentemente hacia `develop`. Cuando el equipo aprueba una versión, `develop` se integra a `main`.

Convenciones de commits:

```text
feat: agrega funcionalidad
fix: corrige comportamiento
refactor: reorganiza componentes
chore: organiza archivos y configuraciones
docs: actualiza documentacion
```

## Seguridad y datos de prueba

- No subir `.env`, contraseñas, tokens ni datos personales reales.
- Utilizar datos ficticios o autorizados para pruebas.
- Usar credenciales de producción distintas de las locales.
- Restringir permisos de lectura y escritura en PostgreSQL cuando se despliegue.
- Verificar los procesos de despliegue existentes antes de cambiar rutas o configuraciones.

## Integración y pruebas locales realizadas

En el entorno de desarrollo se comprobó:

1. Inscripción de un alumno libre y persistencia en PostgreSQL.
2. Verificación del pago desde el panel organizador.
3. Consulta del participante desde la administración de resultados.
4. Registro de puntaje y hora de entrega, comprobados en la base de datos.
5. Publicación de resultados y consulta pública del orden de mérito.
6. Visualización vacía del ranking de colegios cuando solo había un alumno libre de prueba.

Quedan pendientes pruebas adicionales de inscripciones por delegación, importación por lotes, despliegue y operación en producción; no se consideran validadas solo por las comprobaciones anteriores.

## Equipo

- Dávila Arenas, Hugo Javier.
- Incio Ccahuana, Anthony.
- Peralta Barboza, Evelyn Angely.
- Rimachi Taipe, Martín Alejandro.
- Román Espinoza, Diógenes.
- Torpoco Torres, Francisco.

**Institución:** SENATI. **Curso:** Fullstack Developer Software. **Año:** 2026.

Proyecto académico. Revisar derechos, licencias de terceros y condiciones de uso antes de cualquier distribución o despliegue público.
