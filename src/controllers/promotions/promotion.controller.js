const PromotionService = require('../../services/promotions/promotion.service');

exports.creerPromotion = async (req, res) => {
  try {
    const result = await PromotionService.creerPromotion(req.user.id, req.body);
    if (!result.success) return res.status(400).json({ message: result.message });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur creerPromotion:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.modifierPromotion = async (req, res) => {
  try {
    const result = await PromotionService.modifierPromotion(req.params.id, req.user.id, req.body);
    if (!result.success) return res.status(result.message.includes('introuvable') ? 404 : 400).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur modifierPromotion:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.supprimerPromotion = async (req, res) => {
  try {
    const result = await PromotionService.supprimerPromotion(req.params.id, req.user.id);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerPromotion:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.mesPromotions = async (req, res) => {
  try {
    const promotions = await PromotionService.mesPromotions(req.user.id);
    return res.status(200).json({ promotions });
  } catch (error) {
    console.error('Erreur mesPromotions:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getPromotionsActives = async (req, res) => {
  try {
    const promotions = await PromotionService.getPromotionsActives();
    return res.status(200).json({ promotions });
  } catch (error) {
    console.error('Erreur getPromotionsActives:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
