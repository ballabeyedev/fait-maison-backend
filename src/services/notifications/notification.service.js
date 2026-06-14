const { Notification, Utilisateur } = require('../../models');

class NotificationService {

  static async creerNotification({ utilisateurId, titre, message, type }) {
    return await Notification.create({ utilisateurId, titre, message, type });
  }

  static async mesNotifications(userId) {
    return await Notification.findAll({
      where: { utilisateurId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
  }

  static async marquerLue(notifId, userId) {
    const notif = await Notification.findOne({ where: { id: notifId, utilisateurId: userId } });
    if (!notif) return { success: false, message: 'Notification introuvable' };
    await notif.update({ lue: true });
    return { success: true, message: 'Notification marquée comme lue' };
  }

  static async marquerToutesLues(userId) {
    await Notification.update({ lue: true }, { where: { utilisateurId: userId, lue: false } });
    return { success: true, message: 'Toutes les notifications marquées comme lues' };
  }

  static async getNbNonLues(userId) {
    const count = await Notification.count({ where: { utilisateurId: userId, lue: false } });
    return { nonLues: count };
  }

  static async notifierTousAcheteurs(titre, message, type) {
    const acheteurs = await Utilisateur.findAll({
      where: { role: 'Acheteur', statut: 'actif' },
      attributes: ['id']
    });

    const notifications = acheteurs.map(a => ({
      utilisateurId: a.id,
      titre,
      message,
      type
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  }
}

module.exports = NotificationService;
