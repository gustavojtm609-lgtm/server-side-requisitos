import { randomInt } from 'node:crypto';
import {
  Alternative,
  GameAnswer,
  GameSession,
  Modality,
  Phase,
  Question,
  Theme,
  User,
  sequelize,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { registerRankingResult } from './ranking.service.js';
import { calculatePoints } from './scoring.service.js';

function shuffled(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function sessionSummary(session) {
  return {
    id: session.id,
    status: session.status,
    difficulty: session.difficulty,
    questionCount: session.questionCount,
    currentQuestionIndex: session.currentQuestionIndex,
    score: session.score,
    correctAnswers: session.correctAnswers,
    incorrectAnswers: session.incorrectAnswers,
    totalTimeMs: session.totalTimeMs,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    configuration: session.configurationSnapshot,
  };
}

async function loadQuestionForAnswer(answer, transaction) {
  const question = await Question.findByPk(answer.questionId, {
    paranoid: false,
    include: [
      {
        model: Alternative,
        as: 'Alternatives',
        paranoid: false,
        attributes: ['id', 'optionType', 'label'],
      },
    ],
    transaction,
  });

  if (!question || question.Alternatives.length !== 2) {
    throw ApiError.conflict(
      'A pergunta da partida não possui as duas alternativas esperadas.',
      'INVALID_SESSION_QUESTION',
    );
  }

  return question;
}

async function currentQuestionPayload(session, transaction) {
  const answer = await GameAnswer.findOne({
    where: {
      gameSessionId: session.id,
      position: Number(session.currentQuestionIndex) + 1,
    },
    transaction,
  });

  if (!answer) {
    throw ApiError.conflict('Pergunta atual não encontrada.', 'MISSING_CURRENT_QUESTION');
  }

  const question = await loadQuestionForAnswer(answer, transaction);

  return {
    answerId: answer.id,
    questionId: answer.questionId,
    position: answer.position,
    totalQuestions: session.questionCount,
    statement: answer.questionStatementSnapshot,
    alternatives: question.Alternatives
      .map((alternative) => ({
        id: alternative.id,
        type: alternative.optionType,
        label: alternative.label,
      }))
      .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR')),
    presentedAt: answer.presentedAt,
    deadlineAt: answer.deadlineAt,
    timeLimitMs: answer.timeLimitMs,
  };
}

async function resultPayload(session, transaction) {
  const answers = await GameAnswer.findAll({
    where: { gameSessionId: session.id },
    order: [['position', 'ASC']],
    transaction,
  });

  return {
    session: sessionSummary(session),
    accuracy:
      session.questionCount > 0
        ? Number(
            ((Number(session.correctAnswers) / Number(session.questionCount)) * 100).toFixed(2),
          )
        : 0,
    answers: answers.map((answer) => ({
      position: answer.position,
      questionId: answer.questionId,
      statement: answer.questionStatementSnapshot,
      status: answer.status,
      selectedType: answer.selectedTypeSnapshot,
      correctType: answer.correctTypeSnapshot,
      isCorrect: answer.isCorrect,
      explanation: answer.explanationSnapshot,
      points: answer.pointsAwarded,
      responseTimeMs: answer.responseTimeMs,
    })),
  };
}

async function gameState(session, transaction, feedback = undefined) {
  if (session.status !== 'ACTIVE') {
    return {
      session: sessionSummary(session),
      ...(session.status === 'COMPLETED'
        ? { result: await resultPayload(session, transaction) }
        : {}),
      ...(feedback ? { feedback } : {}),
    };
  }

  return {
    session: sessionSummary(session),
    currentQuestion: await currentQuestionPayload(session, transaction),
    ...(feedback ? { feedback } : {}),
  };
}

async function activateAnswer(session, position, transaction) {
  const answer = await GameAnswer.findOne({
    where: { gameSessionId: session.id, position },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!answer) {
    throw ApiError.conflict('Não foi possível ativar a próxima pergunta.', 'MISSING_NEXT_QUESTION');
  }

  const presentedAt = new Date();
  const deadlineAt = new Date(presentedAt.getTime() + Number(answer.timeLimitMs));
  await answer.update({ presentedAt, deadlineAt }, { transaction });
  return answer;
}

async function advanceSession(
  session,
  { points, isCorrect, elapsedTimeMs },
  transaction,
) {
  const nextQuestionIndex = Number(session.currentQuestionIndex) + 1;
  const updates = {
    currentQuestionIndex: nextQuestionIndex,
    score: Number(session.score) + Number(points),
    totalTimeMs: Number(session.totalTimeMs) + Number(elapsedTimeMs),
    correctAnswers: Number(session.correctAnswers) + (isCorrect ? 1 : 0),
    incorrectAnswers: Number(session.incorrectAnswers) + (isCorrect ? 0 : 1),
  };

  if (nextQuestionIndex >= Number(session.questionCount)) {
    updates.status = 'COMPLETED';
    updates.finishedAt = new Date();
    await session.update(updates, { transaction });
    await registerRankingResult(session, transaction);
    return;
  }

  await session.update(updates, { transaction });
  await activateAnswer(session, nextQuestionIndex + 1, transaction);
}

async function expireCurrentAnswer(session, answer, transaction) {
  const elapsedTimeMs = Number(answer.timeLimitMs);
  const answeredAt = answer.deadlineAt ?? new Date();

  await answer.update(
    {
      status: 'TIMED_OUT',
      selectedAlternativeId: null,
      selectedTypeSnapshot: null,
      isCorrect: false,
      pointsAwarded: 0,
      responseTimeMs: elapsedTimeMs,
      remainingTimeMs: 0,
      answeredAt,
    },
    { transaction },
  );
  await advanceSession(
    session,
    { points: 0, isCorrect: false, elapsedTimeMs },
    transaction,
  );

  return {
    timedOut: true,
    isCorrect: false,
    correctType: answer.correctTypeSnapshot,
    explanation: answer.explanationSnapshot,
    points: 0,
  };
}

async function processExpiredQuestion(session, transaction) {
  if (session.status !== 'ACTIVE') {
    return undefined;
  }

  const answer = await GameAnswer.findOne({
    where: {
      gameSessionId: session.id,
      position: Number(session.currentQuestionIndex) + 1,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!answer) {
    throw ApiError.conflict('Pergunta atual não encontrada.', 'MISSING_CURRENT_QUESTION');
  }

  if (!answer.presentedAt || !answer.deadlineAt) {
    await activateAnswer(session, answer.position, transaction);
    return undefined;
  }

  if (answer.status === 'PENDING' && answer.deadlineAt.getTime() <= Date.now()) {
    return expireCurrentAnswer(session, answer, transaction);
  }

  return undefined;
}

export async function listGameOptions() {
  const [themes, modalities] = await Promise.all([
    Theme.findAll({
      where: { status: 'ACTIVE' },
      attributes: ['id', 'name', 'slug', 'description'],
      order: [['name', 'ASC']],
    }),
    Modality.findAll({
      where: { status: 'ACTIVE' },
      attributes: [
        'id',
        'name',
        'slug',
        'description',
        'defaultQuestionCount',
        'scoreMultiplier',
      ],
      include: [
        {
          model: Phase,
          as: 'Phases',
          where: { status: 'ACTIVE' },
          attributes: [
            'id',
            'name',
            'sequence',
            'difficulty',
            'questionCount',
            'timeLimitSeconds',
            'scoreMultiplier',
          ],
          required: true,
        },
      ],
      order: [
        ['name', 'ASC'],
        [{ model: Phase, as: 'Phases' }, 'sequence', 'ASC'],
      ],
    }),
  ]);

  return { themes, modalities };
}

export async function startGame(userId, { modalityId, themeId, phaseId, difficulty }) {
  return sequelize.transaction(async (transaction) => {
    await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const [modality, theme, phase] = await Promise.all([
      Modality.findOne({
        where: { id: modalityId, status: 'ACTIVE' },
        transaction,
      }),
      Theme.findOne({
        where: { id: themeId, status: 'ACTIVE' },
        transaction,
      }),
      Phase.findOne({
        where: {
          modalityId,
          difficulty,
          status: 'ACTIVE',
          ...(phaseId ? { id: phaseId } : {}),
        },
        order: [['sequence', 'ASC']],
        transaction,
      }),
    ]);

    if (!modality || !theme || !phase) {
      throw ApiError.badRequest(
        'Modalidade, tema ou dificuldade indisponível.',
        'INVALID_GAME_CONFIGURATION',
      );
    }

    const availableQuestions = await Question.findAll({
      where: {
        themeId,
        difficulty,
        status: 'ACTIVE',
      },
      include: [
        {
          model: Alternative,
          as: 'Alternatives',
          where: { status: 'ACTIVE' },
          required: true,
        },
      ],
      transaction,
    });
    const validQuestions = availableQuestions.filter((question) => {
      const alternatives = question.Alternatives;
      const types = new Set(alternatives.map(({ optionType }) => optionType));
      return (
        alternatives.length === 2 &&
        types.has('FUNCTIONAL') &&
        types.has('NON_FUNCTIONAL') &&
        alternatives.filter(({ isCorrect }) => isCorrect).length === 1
      );
    });
    const questionCount = Number(phase.questionCount);

    if (validQuestions.length < questionCount) {
      throw ApiError.conflict(
        `São necessárias ${questionCount} perguntas válidas, mas existem ${validQuestions.length}.`,
        'INSUFFICIENT_QUESTIONS',
      );
    }

    await GameSession.update(
      { status: 'ABANDONED', finishedAt: new Date() },
      { where: { userId, status: 'ACTIVE' }, transaction },
    );

    const selectedQuestions = shuffled(validQuestions).slice(0, questionCount);
    const timeLimitMs = Number(phase.timeLimitSeconds) * 1000;
    const session = await GameSession.create(
      {
        userId,
        modalityId: modality.id,
        phaseId: phase.id,
        themeId: theme.id,
        difficulty,
        status: 'ACTIVE',
        questionCount,
        currentQuestionIndex: 0,
        configurationSnapshot: {
          modality: {
            id: modality.id,
            name: modality.name,
            scoreMultiplier: Number(modality.scoreMultiplier),
          },
          theme: { id: theme.id, name: theme.name },
          phase: {
            id: phase.id,
            name: phase.name,
            difficulty: phase.difficulty,
            timeLimitSeconds: phase.timeLimitSeconds,
            scoreMultiplier: Number(phase.scoreMultiplier),
          },
        },
      },
      { transaction },
    );

    await GameAnswer.bulkCreate(
      selectedQuestions.map((question, index) => {
        const correctAlternative = question.Alternatives.find(
          ({ isCorrect }) => isCorrect,
        );

        return {
          gameSessionId: session.id,
          questionId: question.id,
          position: index + 1,
          questionStatementSnapshot: question.statement,
          explanationSnapshot: question.explanation,
          correctTypeSnapshot: correctAlternative.optionType,
          status: 'PENDING',
          timeLimitMs,
        };
      }),
      { transaction },
    );

    await activateAnswer(session, 1, transaction);
    return gameState(session, transaction);
  });
}

export async function getActiveGame(userId) {
  return sequelize.transaction(async (transaction) => {
    const session = await GameSession.findOne({
      where: { userId, status: 'ACTIVE' },
      order: [['startedAt', 'DESC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!session) {
      throw ApiError.notFound('Nenhuma partida ativa foi encontrada.', 'ACTIVE_GAME_NOT_FOUND');
    }

    const feedback = await processExpiredQuestion(session, transaction);
    return gameState(session, transaction, feedback);
  });
}

export async function submitAnswer(userId, sessionId, alternativeId) {
  return sequelize.transaction(async (transaction) => {
    const session = await GameSession.findOne({
      where: { id: sessionId, userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!session) {
      throw ApiError.notFound('Partida não encontrada.', 'GAME_NOT_FOUND');
    }

    if (session.status !== 'ACTIVE') {
      throw ApiError.conflict('A partida não está ativa.', 'GAME_NOT_ACTIVE');
    }

    const answer = await GameAnswer.findOne({
      where: {
        gameSessionId: session.id,
        position: Number(session.currentQuestionIndex) + 1,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!answer || answer.status !== 'PENDING') {
      throw ApiError.conflict('A pergunta atual já foi encerrada.', 'QUESTION_ALREADY_CLOSED');
    }

    if (!answer.deadlineAt || answer.deadlineAt.getTime() <= Date.now()) {
      const feedback = await expireCurrentAnswer(session, answer, transaction);
      return gameState(session, transaction, feedback);
    }

    const selectedAlternative = await Alternative.findOne({
      where: { id: alternativeId, questionId: answer.questionId },
      paranoid: false,
      transaction,
    });

    if (!selectedAlternative) {
      throw ApiError.badRequest(
        'A alternativa não pertence à pergunta atual.',
        'INVALID_ALTERNATIVE',
      );
    }

    const now = new Date();
    const responseTimeMs = Math.min(
      Math.max(now.getTime() - answer.presentedAt.getTime(), 0),
      Number(answer.timeLimitMs),
    );
    const remainingTimeMs = Math.max(
      Number(answer.timeLimitMs) - responseTimeMs,
      0,
    );
    const isCorrect =
      selectedAlternative.optionType === answer.correctTypeSnapshot;
    const snapshot = session.configurationSnapshot;
    const points = calculatePoints({
      difficulty: session.difficulty,
      isCorrect,
      timeLimitMs: Number(answer.timeLimitMs),
      remainingTimeMs,
      phaseMultiplier: snapshot.phase.scoreMultiplier,
      modalityMultiplier: snapshot.modality.scoreMultiplier,
    });

    await answer.update(
      {
        selectedAlternativeId: selectedAlternative.id,
        selectedTypeSnapshot: selectedAlternative.optionType,
        status: 'ANSWERED',
        isCorrect,
        pointsAwarded: points,
        responseTimeMs,
        remainingTimeMs,
        answeredAt: now,
      },
      { transaction },
    );
    await advanceSession(
      session,
      { points, isCorrect, elapsedTimeMs: responseTimeMs },
      transaction,
    );

    return gameState(session, transaction, {
      timedOut: false,
      selectedType: selectedAlternative.optionType,
      correctType: answer.correctTypeSnapshot,
      isCorrect,
      explanation: answer.explanationSnapshot,
      points,
    });
  });
}

export async function abandonGame(userId, sessionId) {
  return sequelize.transaction(async (transaction) => {
    const session = await GameSession.findOne({
      where: { id: sessionId, userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!session) {
      throw ApiError.notFound('Partida não encontrada.', 'GAME_NOT_FOUND');
    }

    if (session.status !== 'ACTIVE') {
      throw ApiError.conflict('A partida não está ativa.', 'GAME_NOT_ACTIVE');
    }

    await session.update(
      { status: 'ABANDONED', finishedAt: new Date() },
      { transaction },
    );

    return { session: sessionSummary(session) };
  });
}

export async function getGameResult(userId, sessionId) {
  const session = await GameSession.findOne({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw ApiError.notFound('Partida não encontrada.', 'GAME_NOT_FOUND');
  }

  if (session.status !== 'COMPLETED') {
    throw ApiError.conflict('A partida ainda não foi concluída.', 'GAME_NOT_COMPLETED');
  }

  return resultPayload(session);
}
