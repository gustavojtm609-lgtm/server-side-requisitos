import { DataTypes, Model } from 'sequelize';
import { DIFFICULTIES } from './constants.js';

export default function defineRanking(sequelize) {
  class Ranking extends Model {}

  Ranking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      gameSessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'game_session_id',
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
      score: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      totalTimeMs: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'total_time_ms',
      },
      isBest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_best',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'completed_at',
      },
    },
    {
      sequelize,
      modelName: 'Ranking',
      tableName: 'rankings',
      underscored: true,
      updatedAt: false,
      indexes: [
        { unique: true, fields: ['game_session_id'] },
        {
          fields: [
            'modality_id',
            'theme_id',
            'difficulty',
            'is_best',
            'score',
            'total_time_ms',
          ],
        },
        { fields: ['user_id', 'is_best'] },
      ],
    },
  );

  return Ranking;
}
