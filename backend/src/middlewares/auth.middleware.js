import { User } from '../models/index.js';
import { verifyAccessToken } from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw ApiError.unauthorized('Informe o token de acesso.', 'MISSING_ACCESS_TOKEN');
  }

  const payload = verifyAccessToken(match[1]);
  const user = await User.findByPk(payload.sub);

  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('Usuário inexistente ou inativo.', 'INACTIVE_USER');
  }

  request.auth = {
    userId: user.id,
    role: user.role,
    tokenId: payload.jti,
  };
  request.user = user;
  next();
});
