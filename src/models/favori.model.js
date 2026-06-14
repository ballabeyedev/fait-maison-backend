const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favori = sequelize.define('Favori', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  }
}, {
  tableName: 'favori',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['acheteur_id', 'boutique_id']
    }
  ]
});

module.exports = Favori;
