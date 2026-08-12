import assert from 'node:assert/strict';
import test from 'node:test';
import {
  basePointsForDifficulty,
  calculatePoints,
} from '../../src/services/scoring.service.js';

test('retorna zero para resposta incorreta', () => {
  assert.equal(
    calculatePoints({
      difficulty: 'HARD',
      isCorrect: false,
      timeLimitMs: 10000,
      remainingTimeMs: 9000,
      phaseMultiplier: 2,
      modalityMultiplier: 1,
    }),
    0,
  );
});

test('aplica base, bônus de tempo e multiplicadores', () => {
  assert.equal(
    calculatePoints({
      difficulty: 'EASY',
      isCorrect: true,
      timeLimitMs: 30000,
      remainingTimeMs: 30000,
      phaseMultiplier: 1,
      modalityMultiplier: 1,
    }),
    200,
  );

  assert.equal(
    calculatePoints({
      difficulty: 'MEDIUM',
      isCorrect: true,
      timeLimitMs: 20000,
      remainingTimeMs: 10000,
      phaseMultiplier: 1.5,
      modalityMultiplier: 1,
    }),
    450,
  );
});

test('informa a pontuação base de cada dificuldade', () => {
  assert.equal(basePointsForDifficulty('EASY'), 100);
  assert.equal(basePointsForDifficulty('MEDIUM'), 200);
  assert.equal(basePointsForDifficulty('HARD'), 300);
  assert.equal(basePointsForDifficulty('UNKNOWN'), null);
});
