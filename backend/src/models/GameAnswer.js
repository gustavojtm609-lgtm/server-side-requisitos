import { DataTypes, Model } from 'sequelize';
import {
  ALTERNATIVE_TYPES,
  ANSWER_STATUSES,
} from './constants.js';

export default function defineGameAnswer(sequelize) {
  class GameAnswer extends Model {}

  GameAnswer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      gameSessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'game_session_id',
      },
      questionId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'question_id',
      },
      selectedAlternativeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'selected_alternative_id',
      },
      position: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1 },
      },
      questionStatementSnapshot: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'question_statement_snapshot',
      },
      explanationSnapshot: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'explanation_snapshot',
      },
      correctTypeSnapshot: {
        type: DataTypes.ENUM(...ALTERNATIVE_TYPES),
        allowNull: false,
        field: 'correct_type_snapshot',
      },
      selectedTypeSnapshot: {
        type: DataTypes.ENUM(...ALTERNATIVE_TYPES),
        allowNull: true,
        field: 'selected_type_snapshot',
      },
      status: {
        type: DataTypes.ENUM(...ANSWER_STATUSES),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_correct',
      },
      pointsAwarded: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'points_awarded',
      },
      timeLimitMs: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'time_limit_ms',
      },
      responseTimeMs: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'response_time_ms',
      },
      remainingTimeMs: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'remaining_time_ms',
      },
      presentedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'presented_at',
      },
      deadlineAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deadline_at',
      },
      answeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'answered_at',
      },
    },
    {
      sequelize,
      modelName: 'GameAnswer',
      tableName: 'game_answers',
      underscored: true,
      indexes: [
        { unique: true, fields: ['game_session_id', 'position'] },
        { unique: true, fields: ['game_session_id', 'question_id'] },
        { fields: ['game_session_id', 'status'] },
      ],
      validate: {
        answeredStateIsComplete() {
          if (
            this.status === 'ANSWERED' &&
            (!this.selectedTypeSnapshot || !this.answeredAt || this.isCorrect === null)
          ) {
            throw new Error('Uma resposta concluída deve possuir alternativa, resultado e horário.');
          }
        },
      },
    },
  );

  return GameAnswer;
}
