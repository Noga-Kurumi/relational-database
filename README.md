# API de Clientes y Productos

API REST para gestionar usuarios, autenticación mediante JSON Web Tokens y catálogo de productos, construida con Node.js, Express y PostgreSQL.

## Requisitos

- Node.js >= 16
- PostgreSQL
- npm

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear un archivo `.env` con las variables:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=secret
   DB_NAME=mi_base
   JWT_SECRET=clave_supersecreta
   JWT_EXPIRES=12h        # opcional
   BCRYPT_SALT=10
   ```
4. Ejecutar el servidor:
   ```bash
   node app.js          # producción
   # o
   npx nodemon app.js   # desarrollo
   ```

## Endpoints

### Autenticación
- **POST** `/api/login/` — Inicia sesión y devuelve un token JWT.
- **POST** `/api/login/signup` — Registra un nuevo usuario (rol por defecto `user`).

### Clientes (`/api/customers`)
- **GET** `/` — Lista todos los usuarios (solo `admin`).
- **GET** `/:id` — Obtiene un usuario por ID (mismo usuario o `admin`).
- **PATCH** `/:id` — Actualiza nombre, email o contraseña (mismo usuario o `admin`).
- **DELETE** `/:id` — Elimina un usuario (mismo usuario o `admin`).

### Productos (`/api/products`)
- **GET** `/` — Lista todos los productos (público).
- **GET** `/:id` — Obtiene un producto por ID (público).
- **POST** `/` — Crea un nuevo producto (solo `admin`).
- **PATCH** `/:id` — Actualiza un producto (solo `admin`).
- **DELETE** `/:id` — Elimina un producto (solo `admin`).

## Manejo de errores

La API utiliza la clase `ApiError` y middlewares para capturar rutas no existentes y errores internos, devolviendo respuestas JSON consistentes.

## Licencia

ISC.
