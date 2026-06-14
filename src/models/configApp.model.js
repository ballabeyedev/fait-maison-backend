const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ConfigApp = sequelize.define('ConfigApp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cle: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Clé de configuration (ex: prix_abonnement)',
  },
  valeur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modifiePar: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID admin qui a modifié',
  },
}, {
  tableName: 'config_app',
  timestamps: true,
  underscored: true,
});

module.exports = ConfigApp;
