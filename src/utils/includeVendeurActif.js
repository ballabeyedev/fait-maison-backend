const { Op } = require('sequelize');
const { Utilisateur, Abonnement, Boutique } = require('../models');

function includeVendeurActif(limitDate = new Date()) {
  return {
    model: Utilisateur,
    as: 'vendeur',
    attributes: ['id', 'nom', 'prenom', 'telephone'],
    required: true,
    where: {
      statut: 'actif'
    },
    include: [
      {
        model: Abonnement,
        as: 'abonnements',
        required: true,
        where: {
          statut: 'actif',
          dateFin: {
            [Op.gte]: limitDate
          }
        }
      },
      {
        model: Boutique,
        as: 'boutiques',
        attributes: ['id', 'localisation', 'telephone'],
        required: false
      }
    ]
  };
}

module.exports = includeVendeurActif;