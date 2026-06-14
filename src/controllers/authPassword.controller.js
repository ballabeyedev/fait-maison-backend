const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

exports.changerMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse, confirmation } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmation) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const result = await AuthService.changerMotDePasse(
      req.user.id,
      ancienMotDePasse,
      nouveauMotDePasse,
      confirmation
    );
    res.json(result);
  } catch (err) {
    logger.error('changerMotDePasse', { message: err.message });
    res.status(err.status || 500).json({ message: err.message });
  }
};
