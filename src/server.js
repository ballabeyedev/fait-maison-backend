require('dotenv').config();
const sequelize = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

// Charger toutes les associations de modèles
require('./models/index');

// Imports explicites pour s'assurer que Sequelize crée toutes les tables
require('./models/utilisateur.model');
require('./models/boutique.model');
require('./models/produit.model');
require('./models/categorie.model');
require('./models/abonnement.model');
require('./models/paiement.model');
require('./models/userOtp.model');
require('./models/avis.model');
require('./models/favori.model');
require('./models/message.model');
require('./models/promotion.model');
require('./models/notification.model');
require('./models/signalement.model');
require('./models/tokenBlacklist.model');
require('./models/configApp.model');

const PORT = process.env.PORT || 3000;
// MED-06 : adresse bind configurable via env (127.0.0.1 derrière un proxy, 0.0.0.0 en direct)
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    // CRIT-02 : sync({ alter: true }) uniquement en développement
    // En production : ne jamais altérer le schéma au démarrage — utiliser `npm run migrate`
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      await sequelize.sync({ force: false }); // vérifie la connexion sans modifier le schéma
      logger.info('DB connectée (mode production — schema non altéré)');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('DB synchronisée avec alter:true (mode développement)');
    }

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Serveur démarré sur ${HOST}:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // Résilience : graceful shutdown sur SIGTERM et SIGINT
    const shutdown = (signal) => {
      logger.info(`Signal ${signal} reçu — arrêt en cours…`);
      server.close(async () => {
        try {
          await sequelize.close();
          logger.info('Connexion DB fermée proprement');
        } catch (_) { /* ignore */ }
        process.exit(0);
      });
      // Forcer l'arrêt après 10s si le serveur ne se ferme pas
      setTimeout(() => {
        logger.error('Arrêt forcé après timeout de 10s');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Erreur lors du démarrage', { message: err.message, stack: err.stack });
    process.exit(1);
  }
})();
