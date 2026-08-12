import { DataTypes, Model } from 'sequelize';

export default function defineRefreshToken(sequelize) {
  class RefreshToken extends Model {}

  RefreshToken.init(
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
      tokenHash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
        unique: true,
        field: 'token_hash',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_agent',
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address',
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      underscored: true,
      indexes: [
        { unique: true, fields: ['token_hash'] },
        { fields: ['user_id', 'expires_at'] },
        { fields: ['revoked_at'] },
      ],
    },
  );

  return RefreshToken;
}
