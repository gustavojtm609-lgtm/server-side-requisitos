import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function required(name) {
  const value = process.env[name];

  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

function integer(name, fallback) {
  const rawValue = process.env[name] ?? String(fallback);
  const value = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value)) {
    throw new Error(`A variável ${name} deve ser um número inteiro.`);
  }

  return value;
}

function boolean(name, fallback = false) {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return fallback;
  }

  return rawValue === 'true';
}

function positiveInteger(name, fallback) {
  const value = integer(name, fallback);

  if (value <= 0) {
    throw new Error(`A variável ${name} deve ser maior que zero.`);
  }

  return value;
}

function sameSite() {
  const value = (process.env.COOKIE_SAME_SITE ?? 'lax').toLowerCase();

  if (!['lax', 'strict', 'none'].includes(value)) {
    throw new Error('COOKIE_SAME_SITE deve ser lax, strict ou none.');
  }

  return value;
}

function secret(name) {
  const value = required(name);

  if (value.length < 32) {
    throw new Error(`A variável ${name} deve possuir pelo menos 32 caracteres.`);
  }

  return value;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: positiveInteger('PORT', 3000),
  trustProxy: boolean('TRUST_PROXY'),
  corsOrigins: Object.freeze(
    (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  database: Object.freeze({
    host: required('DB_HOST'),
    port: integer('DB_PORT', 3306),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    logging: process.env.DB_LOGGING === 'true',
    pool: Object.freeze({
      max: integer('DB_POOL_MAX', 10),
      min: integer('DB_POOL_MIN', 0),
      acquire: integer('DB_POOL_ACQUIRE', 30000),
      idle: integer('DB_POOL_IDLE', 10000),
    }),
  }),
  auth: Object.freeze({
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshDays: positiveInteger('JWT_REFRESH_DAYS', 7),
    cookieName: process.env.COOKIE_NAME ?? 'refreshToken',
    cookieSameSite: sameSite(),
  }),
  rateLimit: Object.freeze({
    windowMs: positiveInteger('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: positiveInteger('RATE_LIMIT_MAX', 300),
    authMax: positiveInteger('AUTH_RATE_LIMIT_MAX', 10),
  }),
});
