require('dotenv').config({ quiet: true });

function configuration() {
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: 'mysql',
    timezone: '+00:00',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
  };
}

module.exports = {
  development: configuration(),
  test: configuration(),
  production: configuration(),
};
