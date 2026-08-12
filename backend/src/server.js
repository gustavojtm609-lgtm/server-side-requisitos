import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server;

async function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando a aplicação...`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await disconnectDatabase();
  process.exit(0);
}

async function startServer() {
  await connectDatabase();
  server = app.listen(env.port, () => {
    console.log(`API disponível em http://localhost:${env.port}/api/v1`);
  });

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Falha ao iniciar a API:', error);
  process.exit(1);
});
