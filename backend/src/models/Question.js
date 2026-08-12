import { DataTypes, Model } from 'sequelize';
import { CONTENT_STATUSES, DIFFICULTIES } from './constants.js';

export default function defineQuestion(sequelize) {
  class Question extends Model {}

  Question.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      themeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'theme_id',
      },
      statement: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true, len: [10, 2000] },
        set(value) {
          this.setDataValue('statement', value?.trim());
        },
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true, len: [10, 3000] },
        set(value) {
          this.setDataValue('explanation', value?.trim());
        },
      },
      difficulty: {
        type: DataTypes.ENUM(...DIFFICULTIES),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...CONTENT_STATUSES),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      createdBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'created_by',
      },
      updatedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'updated_by',
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      underscored: true,
      paranoid: true,
      indexes: [
        { fields: ['theme_id', 'difficulty', 'status'] },
        { fields: ['created_by'] },
        { fields: ['updated_by'] },
      ],
    },
  );

  return Question;
}
