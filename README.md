# API Usage

## Requisitos de formato

- **Email**: debe cumplir con el formato `usuario@dominio.tld`.
- **Contraseña**: mínimo 8 caracteres.
- **Roles permitidos**: `admin`, `user` (por defecto `user`).

## Endpoints relevantes

### POST /api/customers/
Crea un nuevo usuario.

```json
{
  "name": "Nombre",
  "email": "correo@ejemplo.com",
  "password": "contraseñaSegura",
  "role": "user"
}
```

### POST /api/login/
Autentica a un usuario existente.

```json
{
  "email": "correo@ejemplo.com",
  "password": "contraseñaSegura"
}
```
