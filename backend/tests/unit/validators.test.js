import assert from 'node:assert/strict';
import test from 'node:test';
import {
  updateThemeSchema,
  updateUserSchema,
} from '../../src/validators/admin.validator.js';
import { registerSchema } from '../../src/validators/auth.validator.js';
import { startGameSchema } from '../../src/validators/game.validator.js';
import { leaderboardSchema } from '../../src/validators/ranking.validator.js';

test('aceita cadastro válido e rejeita senha fraca', () => {
  const valid = registerSchema.safeParse({
    body: {
      name: 'Jogador',
      email: 'jogador@example.com',
      password: 'SenhaSegura123',
    },
  });
  const invalid = registerSchema.safeParse({
    body: {
      name: 'Jogador',
      email: 'jogador@example.com',
      password: '12345678',
    },
  });

  assert.equal(valid.success, true);
  assert.equal(invalid.success, false);
});

test('converte IDs da configuração do jogo para números', () => {
  const result = startGameSchema.safeParse({
    body: {
      modalityId: '1',
      themeId: '2',
      difficulty: 'HARD',
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.body.modalityId, 1);
  assert.equal(result.data.body.themeId, 2);
});

test('rejeita PATCH administrativo sem campos', () => {
  assert.equal(
    updateThemeSchema.safeParse({ params: { id: '1' }, body: {} }).success,
    false,
  );
  assert.equal(
    updateUserSchema.safeParse({ params: { id: '1' }, body: {} }).success,
    false,
  );
});

test('aplica paginação padrão ao ranking', () => {
  const result = leaderboardSchema.safeParse({ query: {} });
  assert.equal(result.success, true);
  assert.equal(result.data.query.page, 1);
  assert.equal(result.data.query.limit, 20);
});
