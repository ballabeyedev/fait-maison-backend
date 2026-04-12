const cron = require('node-cron');
const expireAbonnements = require('./abonnement.job');

function startJobs() {
  // tous les jours à 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
        console.log("⏳ Vérification abonnements...");
        await expireAbonnements();
    } catch (err) {
        console.error("❌ Job abonnement error:", err);
    }
  });

  console.log("✅ Cron job abonnement démarré");
}

module.exports = startJobs;