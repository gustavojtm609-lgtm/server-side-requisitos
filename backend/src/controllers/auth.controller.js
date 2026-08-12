import { env } from '../config/env.js';
import {
  loginUser,
  logoutUser,
  registerUser,
  rotateRefreshToken,
} from '../services/auth.service.js';
import { refreshCookieOptions } from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';

function requestMetadata(request) {
  return {
    userAgent: request.get('user-agent'),
    ipAddress: request.ip,
  };
}

function setRefreshCookie(response, refreshToken) {
  response.cookie(env.auth.cookieName, refreshToken, refreshCookieOptions());
}

function readRefreshToken(request) {
  return request.cookies?.[env.auth.cookieName] || request.validated?.body?.refreshToken;
}

export async function register(request, response) {
  const session = await registerUser(request.validated.body, requestMetadata(request));
  setRefreshCookie(response, session.refreshToken);

  response.status(201).json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
  });
}

export async function login(request, response) {
  const session = await loginUser(request.validated.body, requestMetadata(request));
  setRefreshCookie(response, session.refreshToken);

  response.json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
  });
}

export async function refresh(request, response) {
  const currentRefreshToken = readRefreshToken(request);

  if (!currentRefreshToken) {
    throw ApiError.unauthorized('Token de renovação não informado.', 'MISSING_REFRESH_TOKEN');
  }

  const session = await rotateRefreshToken(
    currentRefreshToken,
    requestMetadata(request),
  );
  setRefreshCookie(response, session.refreshToken);

  response.json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
  });
}

export async function logout(request, response) {
  await logoutUser(readRefreshToken(request));
  const clearOptions = refreshCookieOptions();
  delete clearOptions.maxAge;
  response.clearCookie(env.auth.cookieName, clearOptions);
  response.status(204).end();
}

export async function me(request, response) {
  response.json({ success: true, data: { user: request.user } });
}
