import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase, sequelize } from '../config/database.js';
import '../models/index.js';

if (env.nodeEnv === 'production') {
  throw new Error('O comando db:sync:dev não pode ser executado em produção. Use migrations.');
}

try {
  await connectDatabase();
  await sequelize.sync({ alter: false });
  console.log('Tabelas sincronizadas para desenvolvimento.');
} catch (error) {
  console.error('Falha ao sincronizar as tabelas:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
