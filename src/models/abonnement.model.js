// abonnement.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./utilisateur.model');

const Abonnement = sequelize.define('Abonnement', {
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
    onDelete: 'CASCADE'
  },

  type: {
    type: DataTypes.ENUM('essai', 'mensuel'),
    allowNull: false
  },

  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: false
  },

  statut: {
    type: DataTypes.ENUM('actif', 'expire'),
    defaultValue: 'actif'
  },

  montant: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  tableName: 'abonnement',
  timestamps: true,
  underscored: true
});

module.exports = Abonnement;