const Joi = require('joi');

const modifierBoutiqueSchema = Joi.object({
  nom: Joi.string().optional(),
  description: Joi.string().optional(),
  localisation: Joi.string().optional(),
  heure_ouverture: Joi.string().optional(),
  heure_fermeture: Joi.string().optional(),
  telephone: Joi.string().optional().allow('', null),
  whatsapp: Joi.string().optional().allow('', null)
}).unknown(true);

module.exports = { modifierBoutiqueSchema };
