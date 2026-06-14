const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Avis = sequelize.define('Avis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  acheteurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'utilisateur',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  boutiqueId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'boutique',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  reponseVendeur: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'avis',
  timestamps: true
});

module.exports = Avis;
