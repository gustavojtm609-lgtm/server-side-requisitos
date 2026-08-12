import { ApiError } from '../utils/ApiError.js';

export function requireRole(...allowedRoles) {
  return function roleMiddleware(request, _response, next) {
    if (!request.auth || !allowedRoles.includes(request.auth.role)) {
      return next(ApiError.forbidden());
    }

    return next();
  };
}
