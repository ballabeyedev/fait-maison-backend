const { Op } = require('sequelize');
const { Utilisateur, Abonnement } = require('../models'); // adapter le chemin

function includeVendeurActif(limitDate = new Date()) {
  return {
    model: Utilisateur,
    as: 'vendeur',
    attributes: ['id', 'nom', 'prenom', 'telephone', 'statut'],
    required: true,
    where: { statut: 'actif' },
    include: [
      {
        model: Abonnement,
        as: 'abonnements',
        required: true,
        where: {
          statut: 'actif',
          dateFin: { [Op.gte]: limitDate }
        }
      }
    ]
  };
}

module.exports = includeVendeurActif;