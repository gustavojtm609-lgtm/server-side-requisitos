import { RefreshToken, User, sequelize } from '../models/index.js';
import {
  hashToken,
  refreshExpirationDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './token.service.js';
import { ApiError } from '../utils/ApiError.js';

function publicUser(user) {
  return user.toJSON();
}

async function createTokenPair(user, metadata = {}, transaction) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshToken.create(
    {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpirationDate(),
      userAgent: metadata.userAgent?.slice(0, 255) || null,
      ipAddress: metadata.ipAddress?.slice(0, 45) || null,
    },
    { transaction },
  );

  return { accessToken, refreshToken };
}

export async function registerUser({ name, email, password }, metadata) {
  return sequelize.transaction(async (transaction) => {
    const existingUser = await User.findOne({
      where: { email: email.trim().toLowerCase() },
      paranoid: false,
      transaction,
    });

    if (existingUser) {
      throw ApiError.conflict('Este e-mail já está cadastrado.', 'EMAIL_ALREADY_EXISTS');
    }

    const user = await User.create(
      { name, email, password, role: 'PLAYER', status: 'ACTIVE' },
      { transaction },
    );
    const tokens = await createTokenPair(user, metadata, transaction);

    return { user: publicUser(user), ...tokens };
  });
}

export async function loginUser({ email, password }, metadata) {
  return sequelize.transaction(async (transaction) => {
    const user = await User.scope('withPassword').findOne({
      where: { email: email.trim().toLowerCase() },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user || !(await user.checkPassword(password))) {
      throw ApiError.unauthorized('E-mail ou senha inválidos.', 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw ApiError.forbidden('A conta está inativa.', 'INACTIVE_ACCOUNT');
    }

    await user.update({ lastLoginAt: new Date() }, { transaction });
    const tokens = await createTokenPair(user, metadata, transaction);

    return { user: publicUser(user), ...tokens };
  });
}

export async function rotateRefreshToken(currentRefreshToken, metadata) {
  const payload = verifyRefreshToken(currentRefreshToken);
  const tokenHash = hashToken(currentRefreshToken);

  return sequelize.transaction(async (transaction) => {
    const storedToken = await RefreshToken.findOne({
      where: { tokenHash },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      String(storedToken.userId) !== String(payload.sub)
    ) {
      throw ApiError.unauthorized('Sessão de renovação inválida.', 'INVALID_REFRESH_SESSION');
    }

    const user = await User.findByPk(payload.sub, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user || user.status !== 'ACTIVE') {
      throw ApiError.unauthorized('Usuário inexistente ou inativo.', 'INACTIVE_USER');
    }

    await storedToken.update({ revokedAt: new Date() }, { transaction });
    const tokens = await createTokenPair(user, metadata, transaction);

    return { user: publicUser(user), ...tokens };
  });
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await RefreshToken.update(
    { revokedAt: new Date() },
    {
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
    },
  );
}

export async function revokeAllUserSessions(userId) {
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null } },
  );
}
