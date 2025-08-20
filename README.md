# API de Clientes y Productos

API REST para gestionar usuarios, autenticación mediante JSON Web Tokens y catálogo de productos. Construida con **Node.js**, **Express 5** y **PostgreSQL** usando **Prisma ORM**.

## Tecnologías
- Node.js
- Express 5
- PostgreSQL + Prisma
- JWT, bcrypt, Joi
- Helmet, CORS, Express Rate Limit, Morgan

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
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mi_base?schema=public"
   JWT_SECRET=clave_supersecreta
   JWT_EXPIRES=12h        # opcional
   BCRYPT_SALT=10
   ```
4. Ejecutar migraciones de Prisma:
   ```bash
   npx prisma migrate deploy    # producción
   # o
   npx prisma migrate dev       # desarrollo
   ```
5. Ejecutar el servidor:
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
- **GET** `/` — Lista todos los productos.
- **GET** `/:id` — Obtiene un producto por ID.
- **POST** `/` — Crea un nuevo producto (solo `admin`).
- **PATCH** `/:id` — Actualiza un producto (solo `admin`).
- **DELETE** `/:id` — Elimina un producto (solo `admin`).

## Características
- Autenticación mediante JWT y autorización por roles.
- Hash de contraseñas con bcrypt.
- Validación de datos con Joi.
- Seguridad: Helmet, rate limiting y CORS.
- Prisma ORM y base de datos PostgreSQL.
- Middleware centralizado para manejo de errores.

## Licencia
ISC.
