import { Op } from 'sequelize';
import {
  Alternative,
  Modality,
  Phase,
  Question,
  Theme,
  User,
  sequelize,
} from '../models/index.js';
import { ALTERNATIVE_LABELS } from '../models/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { paginationMeta } from '../utils/pagination.js';
import { revokeAllUserSessions } from './auth.service.js';

function listResponse(rows, count, page, limit) {
  return {
    items: rows,
    pagination: paginationMeta({ page, limit, total: count }),
  };
}

function activeRecordOrThrow(record, resourceName) {
  if (!record || record.deletedAt) {
    throw ApiError.notFound(`${resourceName} não encontrado.`, 'ADMIN_RESOURCE_NOT_FOUND');
  }

  return record;
}

async function assertThemeReady(themeId, transaction) {
  const theme = await Theme.findByPk(themeId, { transaction });
  const questions = await Question.findAll({
    where: { themeId, status: 'ACTIVE' },
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
  const validQuestions = questions.filter((question) => {
    const types = new Set(question.Alternatives.map(({ optionType }) => optionType));
    return (
      question.Alternatives.length === 2 &&
      types.has('FUNCTIONAL') &&
      types.has('NON_FUNCTIONAL') &&
      question.Alternatives.filter(({ isCorrect }) => isCorrect).length === 1
    );
  });
  const difficulties = new Set(validQuestions.map(({ difficulty }) => difficulty));

  if (
    validQuestions.length < Number(theme.minimumQuestions) ||
    !['EASY', 'MEDIUM', 'HARD'].every((item) => difficulties.has(item))
  ) {
    throw ApiError.conflict(
      `O tema precisa de pelo menos ${theme.minimumQuestions} perguntas válidas, distribuídas nas três dificuldades.`,
      'THEME_NOT_READY',
    );
  }
}

async function assertModalityReady(modalityId, transaction) {
  const activePhases = await Phase.count({
    where: { modalityId, status: 'ACTIVE' },
    transaction,
  });

  if (activePhases === 0) {
    throw ApiError.conflict(
      'A modalidade precisa possuir pelo menos uma fase ativa.',
      'MODALITY_NOT_READY',
    );
  }
}

async function assertThemeReadyIfActive(themeId, transaction) {
  const theme = await Theme.findByPk(themeId, { transaction });

  if (theme?.status === 'ACTIVE') {
    await assertThemeReady(theme.id, transaction);
  }
}

async function assertModalityReadyIfActive(modalityId, transaction) {
  const modality = await Modality.findByPk(modalityId, { transaction });

  if (modality?.status === 'ACTIVE') {
    await assertModalityReady(modality.id, transaction);
  }
}

async function setCorrectAlternative(questionId, correctType, transaction) {
  for (const optionType of ['FUNCTIONAL', 'NON_FUNCTIONAL']) {
    let alternative = await Alternative.findOne({
      where: { questionId, optionType },
      paranoid: false,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!alternative) {
      alternative = await Alternative.create(
        {
          questionId,
          optionType,
          label: ALTERNATIVE_LABELS[optionType],
          isCorrect: optionType === correctType,
          status: 'ACTIVE',
        },
        { transaction },
      );
    } else {
      if (alternative.deletedAt) {
        await alternative.restore({ transaction });
      }

      await alternative.update(
        {
          label: ALTERNATIVE_LABELS[optionType],
          isCorrect: optionType === correctType,
          status: 'ACTIVE',
        },
        { transaction },
      );
    }
  }
}

export async function listThemes({ page, limit, status, search }) {
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { name: { [Op.like]: `%${search}%` } } : {}),
  };
  const { rows, count } = await Theme.findAndCountAll({
    where,
    paranoid: false,
    order: [['name', 'ASC']],
    offset: (page - 1) * limit,
    limit,
  });
  return listResponse(rows, count, page, limit);
}

export async function getTheme(id) {
  const theme = await Theme.findByPk(id, {
    paranoid: false,
    include: [
      {
        model: Question,
        as: 'Questions',
        attributes: ['id', 'difficulty', 'status'],
        required: false,
      },
    ],
  });

  if (!theme) {
    throw ApiError.notFound('Tema não encontrado.', 'THEME_NOT_FOUND');
  }

  return theme;
}

export async function createTheme(data) {
  return sequelize.transaction(async (transaction) => {
    if (data.status === 'ACTIVE') {
      throw ApiError.conflict(
        'Crie as perguntas antes de ativar o tema.',
        'THEME_NOT_READY',
      );
    }

    return Theme.create(data, { transaction });
  });
}

export async function updateTheme(id, data) {
  return sequelize.transaction(async (transaction) => {
    const theme = activeRecordOrThrow(
      await Theme.findByPk(id, { paranoid: false, transaction }),
      'Tema',
    );

    await theme.update(data, { transaction });

    if (theme.status === 'ACTIVE') {
      await assertThemeReady(theme.id, transaction);
    }

    return theme;
  });
}

export async function archiveTheme(id) {
  return sequelize.transaction(async (transaction) => {
    const theme = activeRecordOrThrow(
      await Theme.findByPk(id, { paranoid: false, transaction }),
      'Tema',
    );
    await theme.update({ status: 'ARCHIVED' }, { transaction });
    await theme.destroy({ transaction });
  });
}

export async function listModalities({ page, limit, status, search }) {
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { name: { [Op.like]: `%${search}%` } } : {}),
  };
  const { rows, count } = await Modality.findAndCountAll({
    where,
    paranoid: false,
    include: [
      {
        model: Phase,
        as: 'Phases',
        required: false,
        paranoid: false,
      },
    ],
    distinct: true,
    order: [
      ['name', 'ASC'],
      [{ model: Phase, as: 'Phases' }, 'sequence', 'ASC'],
    ],
    offset: (page - 1) * limit,
    limit,
  });
  return listResponse(rows, count, page, limit);
}

export async function getModality(id) {
  const modality = await Modality.findByPk(id, {
    paranoid: false,
    include: [{ model: Phase, as: 'Phases', paranoid: false }],
    order: [[{ model: Phase, as: 'Phases' }, 'sequence', 'ASC']],
  });

  if (!modality) {
    throw ApiError.notFound('Modalidade não encontrada.', 'MODALITY_NOT_FOUND');
  }

  return modality;
}

export async function createModality(data) {
  if (data.status === 'ACTIVE') {
    throw ApiError.conflict(
      'Crie pelo menos uma fase antes de ativar a modalidade.',
      'MODALITY_NOT_READY',
    );
  }

  return Modality.create(data);
}

export async function updateModality(id, data) {
  return sequelize.transaction(async (transaction) => {
    const modality = activeRecordOrThrow(
      await Modality.findByPk(id, { paranoid: false, transaction }),
      'Modalidade',
    );

    if (data.status === 'ACTIVE') {
      await assertModalityReady(modality.id, transaction);
    }

    await modality.update(data, { transaction });
    return modality;
  });
}

export async function archiveModality(id) {
  return sequelize.transaction(async (transaction) => {
    const modality = activeRecordOrThrow(
      await Modality.findByPk(id, { paranoid: false, transaction }),
      'Modalidade',
    );
    await modality.update({ status: 'ARCHIVED' }, { transaction });
    await modality.destroy({ transaction });
  });
}

export async function listPhases({ page, limit, status, search, modalityId }) {
  const where = {
    ...(status ? { status } : {}),
    ...(modalityId ? { modalityId } : {}),
    ...(search ? { name: { [Op.like]: `%${search}%` } } : {}),
  };
  const { rows, count } = await Phase.findAndCountAll({
    where,
    paranoid: false,
    include: [{ model: Modality, as: 'Modality', attributes: ['id', 'name'] }],
    order: [
      ['modalityId', 'ASC'],
      ['sequence', 'ASC'],
    ],
    offset: (page - 1) * limit,
    limit,
  });
  return listResponse(rows, count, page, limit);
}

export async function getPhase(id) {
  const phase = await Phase.findByPk(id, {
    paranoid: false,
    include: [{ model: Modality, as: 'Modality' }],
  });

  if (!phase) {
    throw ApiError.notFound('Fase não encontrada.', 'PHASE_NOT_FOUND');
  }

  return phase;
}

export async function createPhase(data) {
  const modality = await Modality.findByPk(data.modalityId);

  if (!modality) {
    throw ApiError.badRequest('Modalidade inexistente.', 'INVALID_MODALITY');
  }

  return Phase.create(data);
}

export async function updatePhase(id, data) {
  return sequelize.transaction(async (transaction) => {
    const phase = activeRecordOrThrow(
      await Phase.findByPk(id, {
        paranoid: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
      'Fase',
    );
    const originalModalityId = phase.modalityId;

    if (data.modalityId) {
      const modality = await Modality.findByPk(data.modalityId, { transaction });
      if (!modality) {
        throw ApiError.badRequest('Modalidade inexistente.', 'INVALID_MODALITY');
      }
    }

    await phase.update(data, { transaction });

    for (const modalityId of new Set([originalModalityId, phase.modalityId])) {
      await assertModalityReadyIfActive(modalityId, transaction);
    }

    return phase;
  });
}

export async function archivePhase(id) {
  return sequelize.transaction(async (transaction) => {
    const phase = activeRecordOrThrow(
      await Phase.findByPk(id, { paranoid: false, transaction }),
      'Fase',
    );
    const modalityId = phase.modalityId;
    await phase.update({ status: 'ARCHIVED' }, { transaction });
    await phase.destroy({ transaction });
    await assertModalityReadyIfActive(modalityId, transaction);
  });
}

export async function listQuestions({
  page,
  limit,
  status,
  search,
  themeId,
  difficulty,
}) {
  const where = {
    ...(status ? { status } : {}),
    ...(themeId ? { themeId } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(search ? { statement: { [Op.like]: `%${search}%` } } : {}),
  };
  const { rows, count } = await Question.findAndCountAll({
    where,
    paranoid: false,
    include: [
      { model: Theme, as: 'Theme', attributes: ['id', 'name'], paranoid: false },
      { model: Alternative, as: 'Alternatives', paranoid: false },
    ],
    distinct: true,
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });
  return listResponse(rows, count, page, limit);
}

export async function getQuestion(id, { transaction } = {}) {
  const question = await Question.findByPk(id, {
    paranoid: false,
    include: [
      { model: Theme, as: 'Theme', paranoid: false },
      { model: Alternative, as: 'Alternatives', paranoid: false },
    ],
    transaction,
  });

  if (!question) {
    throw ApiError.notFound('Pergunta não encontrada.', 'QUESTION_NOT_FOUND');
  }

  return question;
}

export async function createQuestion(data, administratorId) {
  const { correctType, ...questionData } = data;

  return sequelize.transaction(async (transaction) => {
    const theme = await Theme.findByPk(questionData.themeId, { transaction });
    if (!theme) {
      throw ApiError.badRequest('Tema inexistente.', 'INVALID_THEME');
    }

    const question = await Question.create(
      {
        ...questionData,
        createdBy: administratorId,
        updatedBy: administratorId,
      },
      { transaction },
    );
    await setCorrectAlternative(question.id, correctType, transaction);
    return getQuestion(question.id, { transaction });
  });
}

export async function updateQuestion(id, data, administratorId) {
  const { correctType, ...questionData } = data;

  return sequelize.transaction(async (transaction) => {
    const question = activeRecordOrThrow(
      await Question.findByPk(id, {
        paranoid: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
      'Pergunta',
    );
    const originalThemeId = question.themeId;

    if (questionData.themeId) {
      const theme = await Theme.findByPk(questionData.themeId, { transaction });
      if (!theme) {
        throw ApiError.badRequest('Tema inexistente.', 'INVALID_THEME');
      }
    }

    await question.update(
      { ...questionData, updatedBy: administratorId },
      { transaction },
    );

    if (correctType) {
      await setCorrectAlternative(question.id, correctType, transaction);
    }

    for (const themeId of new Set([originalThemeId, question.themeId])) {
      await assertThemeReadyIfActive(themeId, transaction);
    }

    return getQuestion(question.id, { transaction });
  });
}

export async function updateQuestionAlternatives(questionId, correctType) {
  return sequelize.transaction(async (transaction) => {
    const question = activeRecordOrThrow(
      await Question.findByPk(questionId, { paranoid: false, transaction }),
      'Pergunta',
    );
    await setCorrectAlternative(question.id, correctType, transaction);
    return getQuestion(question.id, { transaction });
  });
}

export async function archiveQuestion(id) {
  return sequelize.transaction(async (transaction) => {
    const question = activeRecordOrThrow(
      await Question.findByPk(id, { paranoid: false, transaction }),
      'Pergunta',
    );
    const themeId = question.themeId;
    await Alternative.update(
      { status: 'ARCHIVED' },
      { where: { questionId: question.id }, transaction },
    );
    await Alternative.destroy({
      where: { questionId: question.id },
      transaction,
    });
    await question.update({ status: 'ARCHIVED' }, { transaction });
    await question.destroy({ transaction });
    await assertThemeReadyIfActive(themeId, transaction);
  });
}

export async function listUsers({ page, limit, status, role, search }) {
  const where = {
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
    ...(search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}),
  };
  const { rows, count } = await User.findAndCountAll({
    where,
    paranoid: false,
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });
  return listResponse(rows, count, page, limit);
}

export async function updateUser(administratorId, userId, data) {
  const user = activeRecordOrThrow(
    await User.findByPk(userId, { paranoid: false }),
    'Usuário',
  );

  if (
    String(administratorId) === String(user.id) &&
    (data.status === 'INACTIVE' || data.role === 'PLAYER')
  ) {
    throw ApiError.conflict(
      'O administrador não pode remover o próprio acesso administrativo.',
      'CANNOT_REVOKE_SELF',
    );
  }

  await user.update(data);

  if (data.status === 'INACTIVE') {
    await revokeAllUserSessions(user.id);
  }

  return user;
}
