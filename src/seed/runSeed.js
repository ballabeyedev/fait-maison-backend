// Script de seed à lancer UNE SEULE FOIS au premier déploiement
// Commande : npm run seed
// HIGH-03 : seed externalisé, ne tourne plus au démarrage du serveur
const sequelize = require('../config/db');
const logger = require('../utils/logger');

require('../models/index');

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('[runSeed] Connexion DB OK');

    const seedAdmin = require('./seedAdmin');
    await seedAdmin();

    logger.info('[runSeed] Seed terminé avec succès');
    process.exit(0);
  } catch (err) {
    logger.error('[runSeed] Erreur', { message: err.message });
    process.exit(1);
  }
})();
