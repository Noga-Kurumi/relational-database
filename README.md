# API de Clientes, Productos y Pedidos

API REST para gestionar usuarios, autenticación mediante JSON Web Tokens, catálogo de productos y pedidos. Construida con **Node.js**, **Express 5** y **PostgreSQL** usando **Prisma ORM**.

## Características
- Autenticación mediante JWT y autorización por roles (`user`, `admin`).
- Gestión de clientes, productos y pedidos.
- Hash de contraseñas con bcrypt.
- Validación de datos con Joi.
- Seguridad: Helmet, rate limiting, CORS y logging con Morgan.
- Prisma ORM y base de datos PostgreSQL.
- Middleware centralizado para manejo de errores.

## Tecnologías
- Node.js
- Express 5
- PostgreSQL + Prisma
- JWT, bcrypt, Joi
- Helmet, CORS, Express Rate Limit, Morgan
- Jest y Supertest para pruebas

## Requisitos
- Node.js ≥ 16
- PostgreSQL
- npm

## Instalación
1. Clonar el repositorio.
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

## Scripts
- `npm test` – Ejecuta la suite de pruebas con Jest y Supertest.

## Endpoints

### Autenticación (`/api/login`)
- **POST** `/` — Inicia sesión y devuelve un token JWT.
- **POST** `/signup` — Registra un nuevo usuario (rol por defecto `user`).

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

### Pedidos (`/api/orders`)
- **GET** `/` — Lista todos los pedidos (solo `admin`, filtro `paid` opcional).
- **GET** `/:id` — Obtiene un pedido por ID (solo `admin`).
- **POST** `/` — Crea un nuevo pedido y descuenta stock (solo `admin`).
- **PATCH** `/:id` — Marca un pedido como pagado (solo `admin`).
- **DELETE** `/:id` — Elimina un pedido (solo `admin`).

## Licencia
ISC.
