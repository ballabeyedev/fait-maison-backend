const AccountService = require('../services/account.service');

exports.me = async (req, res) => {
  try {
    const utilisateur = await AccountService.getMe(req.user.id);
    return res.status(200).json({ utilisateur });
  } catch (error) {
    console.error('Erreur me:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const result = await AccountService.updateProfile({
      userId: req.user.id,
      data: req.body,
      photoFile: req.file
    });
    if (!result.success) return res.status(409).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const result = await AccountService.changePassword(req.user.id, ancienMotDePasse, nouveauMotDePasse);
    if (!result.success) return res.status(400).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur changePassword:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await AccountService.forgotPassword(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, nouveauMotDePasse } = req.body;
    const result = await AccountService.resetPassword(email, otp, nouveauMotDePasse);
    if (!result.success) return res.status(400).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur resetPassword:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
