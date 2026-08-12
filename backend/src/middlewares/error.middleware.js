import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(request, _response, next) {
  next(ApiError.notFound(`Rota ${request.method} ${request.originalUrl} não encontrada.`, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, _request, response, _next) {
  let normalizedError = error;

  if (error instanceof UniqueConstraintError) {
    normalizedError = ApiError.conflict(
      'Já existe um registro com os mesmos dados únicos.',
      'UNIQUE_CONSTRAINT',
      error.errors.map((item) => ({ field: item.path, message: item.message })),
    );
  } else if (error instanceof ForeignKeyConstraintError) {
    normalizedError = ApiError.conflict(
      'O registro está relacionado a outros dados e não pode ser removido.',
      'FOREIGN_KEY_CONSTRAINT',
    );
  } else if (error instanceof ValidationError) {
    normalizedError = ApiError.badRequest(
      'Os dados não passaram pelas validações do banco.',
      'MODEL_VALIDATION_ERROR',
      error.errors.map((item) => ({ field: item.path, message: item.message })),
    );
  }

  const statusCode = normalizedError instanceof ApiError
    ? normalizedError.statusCode
    : 500;
  const code = normalizedError instanceof ApiError
    ? normalizedError.code
    : 'INTERNAL_SERVER_ERROR';
  const message = statusCode === 500
    ? 'Ocorreu um erro interno no servidor.'
    : normalizedError.message;

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(normalizedError.details ? { details: normalizedError.details } : {}),
    },
  });
}
