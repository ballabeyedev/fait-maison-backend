const NotificationService = require('../../services/notifications/notification.service');

exports.mesNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.mesNotifications(req.user.id);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Erreur mesNotifications:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.marquerLue = async (req, res) => {
  try {
    const result = await NotificationService.marquerLue(req.params.id, req.user.id);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur marquerLue:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.marquerToutesLues = async (req, res) => {
  try {
    const result = await NotificationService.marquerToutesLues(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur marquerToutesLues:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getNbNonLues = async (req, res) => {
  try {
    const result = await NotificationService.getNbNonLues(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur getNbNonLues:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
