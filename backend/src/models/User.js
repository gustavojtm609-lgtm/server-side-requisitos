import bcrypt from 'bcryptjs';
import { DataTypes, Model } from 'sequelize';
import { USER_ROLES, USER_STATUSES } from './constants.js';

export default function defineUser(sequelize) {
  class User extends Model {
    async checkPassword(candidatePassword) {
      if (!this.passwordHash) {
        return false;
      }

      return bcrypt.compare(candidatePassword, this.passwordHash);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.passwordHash;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
        set(value) {
          this.setDataValue('name', value?.trim());
        },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 150],
        },
        set(value) {
          this.setDataValue('email', value?.trim().toLowerCase());
        },
      },
      password: {
        type: DataTypes.VIRTUAL,
        validate: {
          len: [8, 72],
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.ENUM(...USER_ROLES),
        allowNull: false,
        defaultValue: 'PLAYER',
      },
      status: {
        type: DataTypes.ENUM(...USER_STATUSES),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['passwordHash'] },
        },
      },
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['role', 'status'] },
      ],
      hooks: {
        async beforeValidate(user) {
          const plainPassword = user.getDataValue('password');

          if (user.isNewRecord && !user.password && !user.passwordHash) {
            throw new Error('A senha é obrigatória para criar um usuário.');
          }

          if (plainPassword) {
            user.passwordHash = await bcrypt.hash(plainPassword, 12);
          }
        },
        afterValidate(user) {
          user.setDataValue('password', undefined);
        },
      },
    },
  );

  return User;
}
