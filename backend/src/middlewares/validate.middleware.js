import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return function validationMiddleware(request, _response, next) {
    const result = schema.safeParse({
      body: request.body ?? {},
      params: request.params ?? {},
      query: request.query ?? {},
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(
        ApiError.badRequest('Dados enviados são inválidos.', 'VALIDATION_ERROR', details),
      );
    }

    request.validated = result.data;
    return next();
  };
}
