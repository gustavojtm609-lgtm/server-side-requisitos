import { connectDatabase, disconnectDatabase } from '../config/database.js';
import '../models/index.js';

try {
  await connectDatabase();
  console.log('Conexão com o MySQL realizada com sucesso.');
} catch (error) {
  console.error('Não foi possível conectar ao MySQL:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
