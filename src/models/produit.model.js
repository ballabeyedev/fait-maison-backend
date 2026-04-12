const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./utilisateur.model');
const Categorie = require('./categorie.model');

const Produit = sequelize.define('Produit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendeurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'utilisateur',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  categorieId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categorie',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'produit',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = Produit;