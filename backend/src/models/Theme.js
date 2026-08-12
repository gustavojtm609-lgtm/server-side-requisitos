import { DataTypes, Model } from 'sequelize';
import { CONTENT_STATUSES } from './constants.js';

export default function defineTheme(sequelize) {
  class Theme extends Model {}

  Theme.init(
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
        set(value) {
          this.setDataValue('name', value?.trim());
        },
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
      minimumQuestions: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 20,
        field: 'minimum_questions',
        validate: { min: 20 },
      },
      status: {
        type: DataTypes.ENUM(...CONTENT_STATUSES),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
    },
    {
      sequelize,
      modelName: 'Theme',
      tableName: 'themes',
      underscored: true,
      paranoid: true,
      indexes: [
        { unique: true, fields: ['name'] },
        { unique: true, fields: ['slug'] },
        { fields: ['status'] },
      ],
    },
  );

  return Theme;
}
