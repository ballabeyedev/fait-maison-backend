// models/commande.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Référence lisible pour le suivi (ex: CMD-2026-XXXX)
  referenceCommande: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  // Acheteur qui passe la commande
  acheteurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'utilisateur', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },

  // Vendeur concerné (une commande = une boutique/un vendeur)
  vendeurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'utilisateur', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },

  // Montant des produits (hors livraison)
  montantProduits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  fraisLivraison: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // montantProduits + fraisLivraison
  montantTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // Cycle de vie de la commande
  statut: {
    type: DataTypes.ENUM(
      'en_attente',     // créée, en attente de paiement / confirmation
      'confirmee',      // payée ou acceptée (à la livraison)
      'en_preparation', // le vendeur prépare
      'prete',          // prête (retrait) / prête à expédier
      'en_livraison',   // en cours de livraison
      'livree',         // terminée
      'annulee',        // annulée
    ),
    allowNull: false,
    defaultValue: 'en_attente',
  },

  statutPaiement: {
    type: DataTypes.ENUM('non_paye', 'paye', 'rembourse'),
    allowNull: false,
    defaultValue: 'non_paye',
  },

  modeLivraison: {
    type: DataTypes.ENUM('livraison', 'retrait'),
    allowNull: false,
    defaultValue: 'livraison',
  },

  modePaiement: {
    type: DataTypes.ENUM('en_ligne', 'a_la_livraison'),
    allowNull: false,
    defaultValue: 'en_ligne',
  },

  adresseLivraison: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  numeroTelephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Indique si le stock a déjà été décrémenté (évite un double décrément)
  stockDecremente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

}, {
  tableName: 'commande',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['acheteur_id'] },
    { fields: ['vendeur_id'] },
    { fields: ['statut'] },
    { fields: ['statut_paiement'] },
    { unique: true, fields: ['reference_commande'] },
  ],
});

module.exports = Commande;
