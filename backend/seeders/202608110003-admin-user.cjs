'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.log('Seeder de administrador ignorado: configure ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD.');
      return;
    }

    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD deve possuir pelo menos 8 caracteres.');
    }

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } },
    );

    if (existing.length) {
      return;
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 12);

    await queryInterface.bulkInsert('users', [
      {
        name: name.trim(),
        email,
        password_hash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (email) {
      await queryInterface.bulkDelete('users', { email });
    }
  },
};
