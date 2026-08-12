import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const issuer = 'quiz-requisitos-api';
const audience = 'quiz-requisitos-web';

function verifyToken(token, secret, expectedType) {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer,
      audience,
    });

    if (typeof payload !== 'object' || payload.type !== expectedType || !payload.sub) {
      throw new Error('Tipo de token inválido.');
    }

    return payload;
  } catch {
    throw ApiError.unauthorized('Token inválido ou expirado.', 'INVALID_TOKEN');
  }
}

export function signAccessToken(user) {
  return jwt.sign(
    { role: user.role, type: 'access' },
    env.auth.accessSecret,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn: env.auth.accessExpiresIn,
      issuer,
      audience,
      jwtid: randomUUID(),
    },
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { type: 'refresh' },
    env.auth.refreshSecret,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn: `${env.auth.refreshDays}d`,
      issuer,
      audience,
      jwtid: randomUUID(),
    },
  );
}

export function verifyAccessToken(token) {
  return verifyToken(token, env.auth.accessSecret, 'access');
}

export function verifyRefreshToken(token) {
  return verifyToken(token, env.auth.refreshSecret, 'refresh');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshExpirationDate() {
  return new Date(Date.now() + env.auth.refreshDays * 24 * 60 * 60 * 1000);
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.auth.cookieSameSite,
    path: '/api/v1/auth',
    maxAge: env.auth.refreshDays * 24 * 60 * 60 * 1000,
  };
}
