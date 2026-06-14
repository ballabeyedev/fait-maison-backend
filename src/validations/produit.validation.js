const Joi = require('joi');

const ajouterProduitSchema = Joi.object({
  nom: Joi.string().required().messages({ 'any.required': 'Le nom du produit est requis' }),
  description: Joi.string().required().messages({ 'any.required': 'La description est requise' }),
  prix: Joi.number().positive().required().messages({ 'number.positive': 'Le prix doit être positif', 'any.required': 'Le prix est requis' }),
  quantite: Joi.number().integer().min(0).required().messages({ 'number.min': 'La quantité ne peut pas être négative', 'any.required': 'La quantité est requise' }),
  categorieId: Joi.string().required().messages({ 'any.required': 'La catégorie est requise' }),
  delai_preparation: Joi.string().optional().allow('', null),
  disponible: Joi.boolean().optional()
}).unknown(true);

const modifierProduitSchema = Joi.object({
  nom: Joi.string().optional(),
  description: Joi.string().optional(),
  prix: Joi.number().positive().optional(),
  quantite: Joi.number().integer().min(0).optional(),
  categorieId: Joi.string().optional(),
  delai_preparation: Joi.string().optional().allow('', null),
  disponible: Joi.boolean().optional()
}).unknown(true);

module.exports = { ajouterProduitSchema, modifierProduitSchema };
