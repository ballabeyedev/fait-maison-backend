const Joi = require('joi');

const ajouterAvisSchema = Joi.object({
  note: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'La note doit être entre 1 et 5',
    'number.max': 'La note doit être entre 1 et 5',
    'any.required': 'La note est requise'
  }),
  commentaire: Joi.string().max(500).optional().allow('', null),
  boutiqueId: Joi.string().uuid().required().messages({ 'any.required': 'L\'identifiant de la boutique est requis' })
});

module.exports = { ajouterAvisSchema };
