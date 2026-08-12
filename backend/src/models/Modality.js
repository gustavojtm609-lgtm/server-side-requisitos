import { DataTypes, Model } from 'sequelize';
import { CONTENT_STATUSES } from './constants.js';

export default function defineModality(sequelize) {
  class Modality extends Model {}

  Modality.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      defaultQuestionCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 10,
        field: 'default_question_count',
        validate: { min: 1, max: 100 },
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
      modelName: 'Modality',
      tableName: 'modalities',
      underscored: true,
      paranoid: true,
      indexes: [
        { unique: true, fields: ['name'] },
        { unique: true, fields: ['slug'] },
        { fields: ['status'] },
      ],
    },
  );

  return Modality;
}
