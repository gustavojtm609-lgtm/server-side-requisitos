import { DataTypes, Model } from 'sequelize';
import { DIFFICULTIES, GAME_STATUSES } from './constants.js';

export default function defineGameSession(sequelize) {
  class GameSession extends Model {}

  GameSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      modalityId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'modality_id',
      },
      phaseId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'phase_id',
      },
      themeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'theme_id',
      },
      difficulty: {
        type: DataTypes.ENUM(...DIFFICULTIES),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...GAME_STATUSES),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      questionCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'question_count',
        validate: { min: 1, max: 100 },
      },
      currentQuestionIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'current_question_index',
      },
      score: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      correctAnswers: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'correct_answers',
      },
      incorrectAnswers: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'incorrect_answers',
      },
      totalTimeMs: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'total_time_ms',
      },
      configurationSnapshot: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'configuration_snapshot',
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'started_at',
      },
      finishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'finished_at',
      },
    },
    {
      sequelize,
      modelName: 'GameSession',
      tableName: 'game_sessions',
      underscored: true,
      indexes: [
        { fields: ['user_id', 'status'] },
        { fields: ['modality_id', 'theme_id', 'difficulty'] },
        { fields: ['finished_at'] },
      ],
      validate: {
        completedSessionHasFinishedAt() {
          if (this.status === 'COMPLETED' && !this.finishedAt) {
            throw new Error('Uma partida concluída deve possuir finishedAt.');
          }
        },
        answerCountersAreValid() {
          if (this.correctAnswers + this.incorrectAnswers > this.questionCount) {
            throw new Error('O total de respostas não pode superar o total de perguntas.');
          }
        },
      },
    },
  );

  return GameSession;
}
