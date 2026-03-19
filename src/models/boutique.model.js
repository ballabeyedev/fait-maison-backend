const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Boutique = sequelize.define('Boutique', {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  localisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  heure_ouverture: {
    type: DataTypes.TIME,
    allowNull: false,
    },
    heure_fermeture: {
    type: DataTypes.TIME,
    allowNull: false,
    },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
   logo: {
    type: DataTypes.TEXT('long'),
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
}, {
  tableName: 'boutique',
  timestamps: true,
  paranoid: true, 
  underscored: true
});

module.exports = Boutique;
