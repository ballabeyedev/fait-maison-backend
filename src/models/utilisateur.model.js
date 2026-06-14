const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true, // LOW-06 : cohérence avec le validator (champ optionnel)
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  photoProfil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  role: {
    type: DataTypes.ENUM('Admin', 'Acheteur', 'Vendeur'),
    defaultValue: 'Acheteur',
    allowNull: false
    },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif'),
    defaultValue: 'actif'
  },
  verifie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },

}, {
  tableName: 'utilisateur',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = User;
