import {
  GameSession,
  Modality,
  Phase,
  Ranking,
  Theme,
  User,
} from '../models/index.js';
import { paginationMeta } from '../utils/pagination.js';

function isResultBetter(candidate, currentBest) {
  if (!currentBest) {
    return true;
  }

  if (candidate.score !== currentBest.score) {
    return candidate.score > currentBest.score;
  }

  if (Number(candidate.totalTimeMs) !== Number(currentBest.totalTimeMs)) {
    return Number(candidate.totalTimeMs) < Number(currentBest.totalTimeMs);
  }

  return candidate.finishedAt < currentBest.completedAt;
}

export async function registerRankingResult(gameSession, transaction) {
  const currentBest = await Ranking.findOne({
    where: {
      userId: gameSession.userId,
      modalityId: gameSession.modalityId,
      themeId: gameSession.themeId,
      difficulty: gameSession.difficulty,
      isBest: true,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const isBest = isResultBetter(gameSession, currentBest);

  if (currentBest && isBest) {
    await currentBest.update({ isBest: false }, { transaction });
  }

  return Ranking.create(
    {
      gameSessionId: gameSession.id,
      userId: gameSession.userId,
      modalityId: gameSession.modalityId,
      phaseId: gameSession.phaseId,
      themeId: gameSession.themeId,
      difficulty: gameSession.difficulty,
      score: gameSession.score,
      totalTimeMs: gameSession.totalTimeMs,
      isBest,
      completedAt: gameSession.finishedAt,
    },
    { transaction },
  );
}

export async function listLeaderboard({
  modalityId,
  themeId,
  phaseId,
  difficulty,
  page,
  limit,
}) {
  const where = {
    isBest: true,
    ...(modalityId ? { modalityId } : {}),
    ...(themeId ? { themeId } : {}),
    ...(phaseId ? { phaseId } : {}),
    ...(difficulty ? { difficulty } : {}),
  };
  const { rows, count } = await Ranking.findAndCountAll({
    where,
    attributes: [
      'id',
      'score',
      'totalTimeMs',
      'difficulty',
      'completedAt',
    ],
    include: [
      { model: User, as: 'User', attributes: ['id', 'name'] },
      { model: Modality, as: 'Modality', attributes: ['id', 'name', 'slug'] },
      { model: Theme, as: 'Theme', attributes: ['id', 'name', 'slug'] },
      { model: Phase, as: 'Phase', attributes: ['id', 'name'] },
    ],
    order: [
      ['score', 'DESC'],
      ['totalTimeMs', 'ASC'],
      ['completedAt', 'ASC'],
    ],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    items: rows.map((row, index) => ({
      position: (page - 1) * limit + index + 1,
      ...row.toJSON(),
    })),
    pagination: paginationMeta({ page, limit, total: count }),
  };
}

export async function listUserHistory(userId, { status, page, limit }) {
  const { rows, count } = await GameSession.findAndCountAll({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    attributes: [
      'id',
      'difficulty',
      'status',
      'questionCount',
      'score',
      'correctAnswers',
      'incorrectAnswers',
      'totalTimeMs',
      'startedAt',
      'finishedAt',
    ],
    include: [
      { model: Modality, as: 'Modality', attributes: ['id', 'name'] },
      { model: Theme, as: 'Theme', attributes: ['id', 'name'] },
      { model: Phase, as: 'Phase', attributes: ['id', 'name'] },
    ],
    order: [['startedAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    items: rows,
    pagination: paginationMeta({ page, limit, total: count }),
  };
}

export async function getUserSummary(userId) {
  const completedGames = await GameSession.count({
    where: { userId, status: 'COMPLETED' },
  });
  const rankedBestResults = await Ranking.count({
    where: { userId, isBest: true },
  });
  const bestScore = await Ranking.max('score', { where: { userId } });
  const totals = await GameSession.findOne({
    where: { userId, status: 'COMPLETED' },
    attributes: [
      [GameSession.sequelize.fn('SUM', GameSession.sequelize.col('correct_answers')), 'correctAnswers'],
      [GameSession.sequelize.fn('SUM', GameSession.sequelize.col('incorrect_answers')), 'incorrectAnswers'],
    ],
    raw: true,
  });

  return {
    completedGames,
    rankedBestResults,
    bestScore: Number(bestScore || 0),
    correctAnswers: Number(totals?.correctAnswers || 0),
    incorrectAnswers: Number(totals?.incorrectAnswers || 0),
  };
}
