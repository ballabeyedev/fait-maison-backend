const { Abonnement, Utilisateur } = require('../models');
const { Op } = require('sequelize');

async function expireAbonnements() {
  const maintenant = new Date();

  // 1. Expirer abonnements
  await Abonnement.update(
    { statut: 'expire' },
    {
      where: {
        dateFin: { [Op.lt]: maintenant },
        statut: 'actif'
      }
    }
  );

  // 2. Désactiver vendeurs sans abonnement actif
  const vendeurs = await Utilisateur.findAll({
    include: [
      {
        model: Abonnement,
        as: 'abonnements',
        required: false,
        where: {
          statut: 'actif',
          dateFin: { [Op.gte]: maintenant }
        }
      }
    ]
  });

  await Promise.all(
    vendeurs.map(async (v) => {
      if (!v.abonnements || v.abonnements.length === 0) {
        if (v.statut !== 'inactif') {
          await v.update({ statut: 'inactif' });
        }
      }
    })
  );

  console.log("✅ Job abonnement exécuté");
}

module.exports = expireAbonnements;