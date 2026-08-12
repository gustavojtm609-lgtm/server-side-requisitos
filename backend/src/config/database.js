import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: 'mysql',
    timezone: '+00:00',
    logging: env.database.logging ? console.log : false,
    pool: env.database.pool,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    retry: {
      max: 3,
    },
  },
);

export async function connectDatabase() {
  await sequelize.authenticate();
  return sequelize;
}

export async function disconnectDatabase() {
  await sequelize.close();
}
