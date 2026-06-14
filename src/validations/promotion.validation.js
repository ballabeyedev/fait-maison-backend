const Joi = require('joi');

const creerPromotionSchema = Joi.object({
  titre: Joi.string().required().messages({ 'any.required': 'Le titre est requis' }),
  description: Joi.string().optional().allow('', null),
  prixPromo: Joi.number().positive().required().messages({ 'number.positive': 'Le prix promotionnel doit être positif', 'any.required': 'Le prix promotionnel est requis' }),
  produitId: Joi.string().uuid().required().messages({ 'any.required': 'L\'identifiant du produit est requis' }),
  dateDebut: Joi.date().required().messages({ 'any.required': 'La date de début est requise' }),
  dateFin: Joi.date().required().messages({ 'any.required': 'La date de fin est requise' })
});

const modifierPromotionSchema = Joi.object({
  titre: Joi.string().optional(),
  description: Joi.string().optional().allow('', null),
  prixPromo: Joi.number().positive().optional(),
  produitId: Joi.string().uuid().optional(),
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional()
});

module.exports = { creerPromotionSchema, modifierPromotionSchema };
