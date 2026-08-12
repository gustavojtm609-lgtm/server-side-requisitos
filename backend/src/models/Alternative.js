import { DataTypes, Model } from 'sequelize';
import {
  ALTERNATIVE_LABELS,
  ALTERNATIVE_TYPES,
  CONTENT_STATUSES,
} from './constants.js';

export default function defineAlternative(sequelize) {
  class Alternative extends Model {}

  Alternative.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      questionId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'question_id',
      },
      optionType: {
        type: DataTypes.ENUM(...ALTERNATIVE_TYPES),
        allowNull: false,
        field: 'option_type',
      },
      label: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_correct',
      },
      status: {
        type: DataTypes.ENUM(...CONTENT_STATUSES),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
    },
    {
      sequelize,
      modelName: 'Alternative',
      tableName: 'alternatives',
      underscored: true,
      paranoid: true,
      indexes: [
        { unique: true, fields: ['question_id', 'option_type'] },
        { fields: ['question_id', 'status'] },
      ],
      hooks: {
        beforeValidate(alternative) {
          const optionType = alternative.getDataValue('optionType');

          if (optionType && ALTERNATIVE_LABELS[optionType]) {
            alternative.setDataValue('label', ALTERNATIVE_LABELS[optionType]);
          }
        },
      },
    },
  );

  return Alternative;
}
