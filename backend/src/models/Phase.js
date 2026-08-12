import { DataTypes, Model } from 'sequelize';
import { CONTENT_STATUSES, DIFFICULTIES } from './constants.js';

export default function definePhase(sequelize) {
  class Phase extends Model {}

  Phase.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      modalityId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'modality_id',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
      },
      sequence: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1 },
      },
      difficulty: {
        type: DataTypes.ENUM(...DIFFICULTIES),
        allowNull: false,
      },
      questionCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 10,
        field: 'question_count',
        validate: { min: 1, max: 100 },
      },
      timeLimitSeconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'time_limit_seconds',
        validate: { min: 5, max: 600 },
      },
      scoreMultiplier: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1,
        field: 'score_multiplier',
        validate: { min: 0.01, max: 99.99 },
      },
      status: {
        type: DataTypes.ENUM(...CONTENT_STATUSES),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
    },
    {
      sequelize,
      modelName: 'Phase',
      tableName: 'phases',
      underscored: true,
      paranoid: true,
      indexes: [
        { unique: true, fields: ['modality_id', 'sequence'] },
        { fields: ['modality_id', 'difficulty', 'status'] },
      ],
    },
  );

  return Phase;
}
