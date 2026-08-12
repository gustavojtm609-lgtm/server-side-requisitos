import { ApiError } from '../utils/ApiError.js';

const BASE_POINTS = Object.freeze({
  EASY: 100,
  MEDIUM: 200,
  HARD: 300,
});

export function calculatePoints({
  difficulty,
  isCorrect,
  timeLimitMs,
  remainingTimeMs,
  phaseMultiplier = 1,
  modalityMultiplier = 1,
}) {
  if (!isCorrect) {
    return 0;
  }

  const base = BASE_POINTS[difficulty];

  if (!base || timeLimitMs <= 0) {
    throw ApiError.badRequest('Configuração de pontuação inválida.', 'INVALID_SCORING_CONFIG');
  }

  const safeRemainingTime = Math.min(
    Math.max(Number(remainingTimeMs) || 0, 0),
    timeLimitMs,
  );
  const timeBonus = Math.floor(base * (safeRemainingTime / timeLimitMs));
  const multiplier = Number(phaseMultiplier) * Number(modalityMultiplier);

  return Math.floor((base + timeBonus) * multiplier);
}

export function basePointsForDifficulty(difficulty) {
  return BASE_POINTS[difficulty] ?? null;
}
