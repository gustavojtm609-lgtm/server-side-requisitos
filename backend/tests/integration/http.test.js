import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DB_HOST ??= '127.0.0.1';
process.env.DB_PORT ??= '3306';
process.env.DB_NAME ??= 'quiz_requisitos_test';
process.env.DB_USER ??= 'root';
process.env.DB_PASSWORD ??= '';
process.env.JWT_ACCESS_SECRET ??= 'teste-access-secret-com-mais-de-32-caracteres';
process.env.JWT_REFRESH_SECRET ??= 'teste-refresh-secret-com-mais-de-32-caracteres';
process.env.RATE_LIMIT_MAX ??= '1000';
process.env.AUTH_RATE_LIMIT_MAX ??= '1000';

const { app } = await import('../../src/app.js');
const { sequelize } = await import('../../src/models/index.js');

after(async () => {
  await sequelize.close();
});

test('responde o endpoint de saúde', async () => {
  const response = await request(app).get('/api/v1/health').expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
});

test('protege as rotas do jogo sem JWT', async () => {
  const response = await request(app).get('/api/v1/game/options').expect(401);
  assert.equal(response.body.error.code, 'MISSING_ACCESS_TOKEN');
});

test('rejeita cadastro inválido antes de consultar o banco', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'A', email: 'email-invalido', password: '123' })
    .expect(400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('retorna erro padronizado para rota inexistente', async () => {
  const response = await request(app).get('/api/v1/inexistente').expect(404);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
});
