import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DB_HOST ??= '127.0.0.1';
process.env.DB_PORT ??= '3306';
process.env.DB_NAME ??= 'quiz_requisitos_test';
process.env.DB_USER ??= 'root';
process.env.DB_PASSWORD ??= '';
process.env.JWT_ACCESS_SECRET ??= 'teste-access-secret-com-mais-de-32-caracteres';
process.env.JWT_REFRESH_SECRET ??= 'teste-refresh-secret-com-mais-de-32-caracteres';
process.env.JWT_ACCESS_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_DAYS ??= '7';

const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = await import('../../src/services/token.service.js');

test('assina e verifica tokens separados por finalidade', () => {
  const user = { id: 42, role: 'PLAYER' };
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const accessPayload = verifyAccessToken(accessToken);
  const refreshPayload = verifyRefreshToken(refreshToken);

  assert.equal(accessPayload.sub, '42');
  assert.equal(accessPayload.role, 'PLAYER');
  assert.equal(accessPayload.type, 'access');
  assert.equal(refreshPayload.sub, '42');
  assert.equal(refreshPayload.type, 'refresh');
  assert.notEqual(accessToken, refreshToken);
});

test('gera hash SHA-256 determinístico sem guardar o token original', () => {
  const token = 'token-de-teste';
  assert.equal(hashToken(token), hashToken(token));
  assert.equal(hashToken(token).length, 64);
  assert.notEqual(hashToken(token), token);
});

test('não aceita refresh token como access token', () => {
  const refreshToken = signRefreshToken({ id: 7, role: 'PLAYER' });
  assert.throws(() => verifyAccessToken(refreshToken), /Token inválido/);
});
