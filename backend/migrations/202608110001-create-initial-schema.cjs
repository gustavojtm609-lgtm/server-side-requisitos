'use strict';

const contentStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];
const difficulties = ['EASY', 'MEDIUM', 'HARD'];
const alternativeTypes = ['FUNCTIONAL', 'NON_FUNCTIONAL'];

const createdAt = (Sequelize) => ({
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
});

const updatedAt = (Sequelize) => ({
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
});

const deletedAt = (Sequelize) => ({
  type: Sequelize.DATE,
  allowNull: true,
});

const tableOptions = {
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: { type: Sequelize.STRING(100), allowNull: false },
        email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
        password_hash: { type: Sequelize.STRING(255), allowNull: false },
        role: {
          type: Sequelize.ENUM('PLAYER', 'ADMIN'),
          allowNull: false,
          defaultValue: 'PLAYER',
        },
        status: {
          type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        last_login_at: { type: Sequelize.DATE, allowNull: true },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('users', ['role', 'status'], {
      name: 'users_role_status_idx',
    });

    await queryInterface.createTable(
      'refresh_tokens',
      {
        id: { type: Sequelize.UUID, primaryKey: true },
        user_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        token_hash: { type: Sequelize.CHAR(64), allowNull: false, unique: true },
        expires_at: { type: Sequelize.DATE, allowNull: false },
        revoked_at: { type: Sequelize.DATE, allowNull: true },
        user_agent: { type: Sequelize.STRING(255), allowNull: true },
        ip_address: { type: Sequelize.STRING(45), allowNull: true },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('refresh_tokens', ['user_id', 'expires_at'], {
      name: 'refresh_tokens_user_expiration_idx',
    });
    await queryInterface.addIndex('refresh_tokens', ['revoked_at'], {
      name: 'refresh_tokens_revoked_idx',
    });

    await queryInterface.createTable(
      'themes',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        minimum_questions: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 20,
        },
        status: {
          type: Sequelize.ENUM(...contentStatuses),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('themes', ['status'], {
      name: 'themes_status_idx',
    });

    await queryInterface.createTable(
      'modalities',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        default_question_count: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 10,
        },
        score_multiplier: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 1,
        },
        status: {
          type: Sequelize.ENUM(...contentStatuses),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('modalities', ['status'], {
      name: 'modalities_status_idx',
    });

    await queryInterface.createTable(
      'phases',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        modality_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'modalities', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        name: { type: Sequelize.STRING(100), allowNull: false },
        sequence: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        difficulty: {
          type: Sequelize.ENUM(...difficulties),
          allowNull: false,
        },
        question_count: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 10,
        },
        time_limit_seconds: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        score_multiplier: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 1,
        },
        status: {
          type: Sequelize.ENUM(...contentStatuses),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('phases', ['modality_id', 'sequence'], {
      unique: true,
      name: 'phases_modality_sequence_uq',
    });
    await queryInterface.addIndex(
      'phases',
      ['modality_id', 'difficulty', 'status'],
      { name: 'phases_modality_difficulty_status_idx' },
    );

    await queryInterface.createTable(
      'questions',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        theme_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'themes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        statement: { type: Sequelize.TEXT, allowNull: false },
        explanation: { type: Sequelize.TEXT, allowNull: false },
        difficulty: {
          type: Sequelize.ENUM(...difficulties),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(...contentStatuses),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        created_by: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        updated_by: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex(
      'questions',
      ['theme_id', 'difficulty', 'status'],
      { name: 'questions_theme_difficulty_status_idx' },
    );

    await queryInterface.createTable(
      'alternatives',
      {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        question_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'questions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        option_type: {
          type: Sequelize.ENUM(...alternativeTypes),
          allowNull: false,
        },
        label: { type: Sequelize.STRING(30), allowNull: false },
        is_correct: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        status: {
          type: Sequelize.ENUM(...contentStatuses),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
        deleted_at: deletedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('alternatives', ['question_id', 'option_type'], {
      unique: true,
      name: 'alternatives_question_type_uq',
    });
    await queryInterface.addIndex('alternatives', ['question_id', 'status'], {
      name: 'alternatives_question_status_idx',
    });

    await queryInterface.createTable(
      'game_sessions',
      {
        id: { type: Sequelize.UUID, primaryKey: true },
        user_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        modality_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'modalities', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        phase_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'phases', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        theme_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'themes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        difficulty: {
          type: Sequelize.ENUM(...difficulties),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
            'ACTIVE',
            'COMPLETED',
            'ABANDONED',
            'CANCELLED',
            'INVALID',
          ),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        question_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        current_question_index: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        score: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        correct_answers: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        incorrect_answers: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        total_time_ms: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        configuration_snapshot: { type: Sequelize.JSON, allowNull: false },
        started_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        finished_at: { type: Sequelize.DATE, allowNull: true },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('game_sessions', ['user_id', 'status'], {
      name: 'game_sessions_user_status_idx',
    });
    await queryInterface.addIndex(
      'game_sessions',
      ['modality_id', 'theme_id', 'difficulty'],
      { name: 'game_sessions_scope_idx' },
    );
    await queryInterface.addIndex('game_sessions', ['finished_at'], {
      name: 'game_sessions_finished_idx',
    });

    await queryInterface.createTable(
      'game_answers',
      {
        id: { type: Sequelize.UUID, primaryKey: true },
        game_session_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'game_sessions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        question_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'questions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        selected_alternative_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'alternatives', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        position: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        question_statement_snapshot: { type: Sequelize.TEXT, allowNull: false },
        explanation_snapshot: { type: Sequelize.TEXT, allowNull: false },
        correct_type_snapshot: {
          type: Sequelize.ENUM(...alternativeTypes),
          allowNull: false,
        },
        selected_type_snapshot: {
          type: Sequelize.ENUM(...alternativeTypes),
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'ANSWERED', 'TIMED_OUT'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        is_correct: { type: Sequelize.BOOLEAN, allowNull: true },
        points_awarded: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        time_limit_ms: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        response_time_ms: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        remaining_time_ms: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        presented_at: { type: Sequelize.DATE, allowNull: true },
        deadline_at: { type: Sequelize.DATE, allowNull: true },
        answered_at: { type: Sequelize.DATE, allowNull: true },
        created_at: createdAt(Sequelize),
        updated_at: updatedAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex('game_answers', ['game_session_id', 'position'], {
      unique: true,
      name: 'game_answers_session_position_uq',
    });
    await queryInterface.addIndex(
      'game_answers',
      ['game_session_id', 'question_id'],
      { unique: true, name: 'game_answers_session_question_uq' },
    );
    await queryInterface.addIndex('game_answers', ['game_session_id', 'status'], {
      name: 'game_answers_session_status_idx',
    });

    await queryInterface.createTable(
      'rankings',
      {
        id: { type: Sequelize.UUID, primaryKey: true },
        game_session_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'game_sessions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        user_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        modality_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'modalities', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        phase_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'phases', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        theme_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'themes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        difficulty: {
          type: Sequelize.ENUM(...difficulties),
          allowNull: false,
        },
        score: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        total_time_ms: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        is_best: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        completed_at: { type: Sequelize.DATE, allowNull: false },
        created_at: createdAt(Sequelize),
      },
      tableOptions,
    );
    await queryInterface.addIndex(
      'rankings',
      [
        'modality_id',
        'theme_id',
        'difficulty',
        'is_best',
        'score',
        'total_time_ms',
      ],
      { name: 'rankings_scope_order_idx' },
    );
    await queryInterface.addIndex('rankings', ['user_id', 'is_best'], {
      name: 'rankings_user_best_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rankings');
    await queryInterface.dropTable('game_answers');
    await queryInterface.dropTable('game_sessions');
    await queryInterface.dropTable('alternatives');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('phases');
    await queryInterface.dropTable('modalities');
    await queryInterface.dropTable('themes');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('users');
  },
};
