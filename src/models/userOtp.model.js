const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserOtp = sequelize.define('UserOtp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'utilisateur',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'user_otp',
  timestamps: true
});

module.exports = UserOtp;
