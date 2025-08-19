class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status || 500;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

function mapPgError(err) {
  switch (err.code) {
    case '23505': // unique_violation
      return new ApiError(409, 'DUPLICATE_KEY', 'Recurso duplicado', {
        constraint: err.constraint,
      });
    case '22P02': // invalid_text_representation
      return new ApiError(400, 'INVALID_TEXT', 'Parámetro inválido');
    case '23503': // foreign_key_violation
      return new ApiError(409, 'FK_VIOLATION', 'Violación de clave foránea');
    case '23502': // not_null_violation
      return new ApiError(400, 'NOT_NULL', 'Campo requerido ausente');
    case '23514': // check_violation
      return new ApiError(
        400,
        'CHECK_VIOLATION',
        'Restricción de datos incumplida'
      );
    default:
      return new ApiError(500, 'DB_ERROR', 'Error en la base de datos');
  }
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
  }

  if (err && err.code) {
    const apiErr = mapPgError(err);
    return res.status(apiErr.status).json({
      error: {
        message: apiErr.message,
        code: apiErr.code,
        details: apiErr.details,
      },
    });
  }

  const status = 500;
  const payload = {
    error: { message: 'Error interno en el servidor.', code: 'INTERNAL_ERROR' },
  };

  res.status(status).json(payload);
}

function notFoundHandler(_res, _res, next) {
  next(new ApiError(404, 'NOT_FOUND', 'Ruta no encontrada'));
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { ApiError, errorHandler, notFoundHandler, asyncHandler };
