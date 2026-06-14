const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur.model');
const ConfigApp = require('../models/configApp.model');
const logger = require('../utils/logger');

async function seedAdmin() {
  // CRIT-01 : bloquer si variables manquantes — aucun fallback hardcodé
  const email = process.env.ADMIN_EMAIL;
  const mdp   = process.env.ADMIN_PASSWORD;

  if (!email || !mdp) {
    throw new Error('[SEED] ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires. Définissez-les dans .env avant de lancer le seed.');
  }
  if (mdp.length < 12) {
    throw new Error('[SEED] ADMIN_PASSWORD doit contenir au moins 12 caractères.');
  }

  try {
    const existing = await Utilisateur.findOne({ where: { email } });

    if (!existing) {
      const hash = await bcrypt.hash(mdp, 12);
      await Utilisateur.create({
        nom: 'Super',
        prenom: 'Admin',
        email,
        mot_de_passe: hash,
        role: 'Admin',
        statut: 'actif',
        verifie: true,
      });
      logger.info(`[SEED] Admin créé : ${email}`);
    } else {
      logger.info(`[SEED] Admin déjà existant : ${email}`);
    }

    // Initialiser le prix d'abonnement par défaut si absent
    const prixExistant = await ConfigApp.findOne({ where: { cle: 'prix_abonnement' } });
    if (!prixExistant) {
      await ConfigApp.create({
        cle: 'prix_abonnement',
        valeur: '2000',
        description: 'Prix mensuel de l\'abonnement vendeur en FCFA',
      });
      logger.info('[SEED] Prix abonnement initialisé à 2000 FCFA');
    }

  } catch (err) {
    logger.error('[SEED] Erreur seed', { message: err.message });
    throw err;
  }
}

module.exports = seedAdmin;
