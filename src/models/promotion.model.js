const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prixPromo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  produitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'produit',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
  }
}, {
  tableName: 'promotion',
  timestamps: true
});

module.exports = Promotion;
