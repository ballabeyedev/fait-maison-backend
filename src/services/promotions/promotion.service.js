const { Promotion, Produit } = require('../../models');
const { Op } = require('sequelize');

class PromotionService {

  static async creerPromotion(vendeurId, data) {
    const { titre, description, prixPromo, produitId, dateDebut, dateFin } = data;

    if (new Date(dateDebut) >= new Date(dateFin)) {
      return { success: false, message: 'La date de début doit être antérieure à la date de fin' };
    }

    const produit = await Produit.findOne({ where: { id: produitId, vendeurId } });
    if (!produit) return { success: false, message: 'Produit introuvable ou accès interdit' };

    const promotion = await Promotion.create({ titre, description, prixPromo, produitId, vendeurId, dateDebut, dateFin });
    return { success: true, message: 'Promotion créée', promotion };
  }

  static async modifierPromotion(promotionId, vendeurId, data) {
    const promotion = await Promotion.findOne({ where: { id: promotionId, vendeurId } });
    if (!promotion) return { success: false, message: 'Promotion introuvable ou accès interdit' };

    if (data.dateDebut && data.dateFin && new Date(data.dateDebut) >= new Date(data.dateFin)) {
      return { success: false, message: 'La date de début doit être antérieure à la date de fin' };
    }

    await promotion.update(data);
    return { success: true, message: 'Promotion modifiée', promotion };
  }

  static async supprimerPromotion(promotionId, vendeurId) {
    const promotion = await Promotion.findOne({ where: { id: promotionId, vendeurId } });
    if (!promotion) return { success: false, message: 'Promotion introuvable ou accès interdit' };
    await promotion.destroy();
    return { success: true, message: 'Promotion supprimée' };
  }

  static async mesPromotions(vendeurId) {
    const promotions = await Promotion.findAll({
      where: { vendeurId },
      include: [{ model: Produit, as: undefined }],
      order: [['createdAt', 'DESC']]
    });
    return promotions;
  }

  static async getPromotionsActives() {
    const promotions = await Promotion.findAll({
      where: {
        active: true,
        dateFin: { [Op.gte]: new Date() }
      },
      include: [{ model: Produit, as: undefined }],
      order: [['dateDebut', 'DESC']]
    });
    return promotions;
  }
}

module.exports = PromotionService;
