const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');
const formatUser = require('../utils/formatUser');

exports.inscriptionUser = async (req, res) => {
  try {
    const {
      nom, prenom, email, mot_de_passe, adresse, telephone, role,
      nomBoutique, description, localisation,
      heure_ouverture, heure_fermeture, telephoneBoutique
    } = req.body;

    const photoProfil = req.files?.['photoProfil']?.[0] || null;
    const logo        = req.files?.['logo']?.[0]        || null;

    let boutique = null;
    if (role === 'Vendeur' && nomBoutique) {
      boutique = { nom: nomBoutique, description, localisation, heure_ouverture, heure_fermeture, telephone: telephoneBoutique, logo };
    }

    const result = await AuthService.register({ nom, prenom, email, mot_de_passe, adresse, telephone, photoProfil, role, boutique });

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json({
      message: result.message,
      utilisateur: formatUser(result.utilisateur),
      abonnement: result.abonnement,
      boutique: result.boutique
    });

  } catch (err) {
    logger.error('auth.inscriptionUser', { message: err.message });
    return res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

exports.login = async (req, res) => {
  const { email, telephone, mot_de_passe } = req.body;
  const identifiant = email || telephone;

  if (!identifiant || !mot_de_passe) {
    return res.status(400).json({ message: 'Email/Téléphone et mot de passe sont obligatoires' });
  }

  try {
    const result = await AuthService.login({ identifiant, mot_de_passe });

    if (!result.success) {
      return res.status(400).json({ message: result.error || result.message });
    }

    return res.status(200).json({
      token: result.token,
      refreshToken: result.refreshToken,
      utilisateur: formatUser(result.utilisateur),
      abonnement: result.abonnement,
      menus: result.menus || [],
    });

  } catch (err) {
    logger.error('auth.login', { message: err.message });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000);
    const result = await AuthService.logout(token, expiresAt);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('auth.logout', { message: err.message });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Le refresh token est requis' });
    }
    const result = await AuthService.refreshToken(refreshToken);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    return res.status(200).json({ token: result.token });
  } catch (err) {
    logger.error('auth.refresh', { message: err.message });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// MED-03 : vérification email
exports.verifierEmail = async (req, res) => {
  try {
    const { email, code } = req.query;
    if (!email || !code) {
      return res.status(400).json({ message: 'email et code sont requis' });
    }
    const result = await AuthService.verifierEmail(email, code);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json({ message: result.message });
  } catch (err) {
    logger.error('auth.verifierEmail', { message: err.message });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
