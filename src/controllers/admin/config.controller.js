const ConfigService = require('../../services/config/config.service');

exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await ConfigService.getAllConfigs();
    return res.status(200).json({ message: 'Configurations de l\'application', configs });
  } catch (error) {
    console.error('Erreur getAllConfigs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.ajouterConfig = async (req, res) => {
  try {
    const { cle, valeur, description } = req.body;
    if (!cle || !valeur) return res.status(400).json({ message: 'cle et valeur sont requis' });

    // Validation prix_abonnement : doit être un nombre positif
    if (cle === 'prix_abonnement') {
      const num = parseInt(valeur, 10);
      if (isNaN(num) || num <= 0) return res.status(400).json({ message: 'Le prix doit être un entier positif' });
    }

    const result = await ConfigService.ajouterConfig({ cle, valeur: String(valeur), description, adminId: req.user.id });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur ajouterConfig:', error);
    const status = error.message.includes('existe déjà') ? 409 : 500;
    return res.status(status).json({ message: error.message || 'Erreur serveur' });
  }
};

exports.modifierConfig = async (req, res) => {
  try {
    const { cle } = req.params;
    const { valeur, description } = req.body;
    if (!valeur) return res.status(400).json({ message: 'La valeur est requise' });

    if (cle === 'prix_abonnement') {
      const num = parseInt(valeur, 10);
      if (isNaN(num) || num <= 0) return res.status(400).json({ message: 'Le prix doit être un entier positif' });
    }

    const result = await ConfigService.modifierConfig({ cle, valeur: String(valeur), description, adminId: req.user.id });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur modifierConfig:', error);
    const status = error.message.includes('introuvable') ? 404 : 500;
    return res.status(status).json({ message: error.message || 'Erreur serveur' });
  }
};

exports.getPrixAbonnement = async (req, res) => {
  try {
    const prix = await ConfigService.getPrixAbonnement();
    return res.status(200).json({ message: 'Prix abonnement actuel', prix, devise: 'FCFA' });
  } catch (error) {
    console.error('Erreur getPrixAbonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
