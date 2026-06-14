const cron = require('node-cron');
const expireAbonnements = require('./abonnement.job');
const cleanExpiredTokens = require('./cleanBlacklist.job');
const logger = require('../utils/logger');

function startJobs() {
  // MED-01 : logger structuré, plus de console.log

  // Vérification abonnements — tous les jours à 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('job.abonnement démarré');
      await expireAbonnements();
    } catch (err) {
      logger.error('job.abonnement erreur', { message: err.message });
    }
  });

  // HIGH-06 : nettoyage blacklist toutes les 15 minutes (au lieu d'1h)
  // Réduit la taille de la table entre deux passes et améliore les perfs du check auth
  cron.schedule('*/15 * * * *', async () => {
    try {
      await cleanExpiredTokens();
    } catch (err) {
      logger.error('job.cleanBlacklist erreur', { message: err.message });
    }
  });

  logger.info('Cron jobs démarrés (abonnements: 00h00 quotidien | blacklist: toutes les 15 min)');
}

module.exports = startJobs;
