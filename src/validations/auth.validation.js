const Joi = require('joi');

const registerSchema = Joi.object({
  nom: Joi.string().required().messages({ 'any.required': 'Le nom est requis' }),
  prenom: Joi.string().required().messages({ 'any.required': 'Le prénom est requis' }),
  email: Joi.string().email().required().messages({ 'string.email': 'Email invalide', 'any.required': 'L\'email est requis' }),
  mot_de_passe: Joi.string().min(8).required().messages({ 'string.min': 'Le mot de passe doit contenir au moins 8 caractères', 'any.required': 'Le mot de passe est requis' }),
  telephone: Joi.string().optional().allow('', null),
  adresse: Joi.string().optional().allow('', null),
  role: Joi.string().valid('Acheteur', 'Vendeur').optional()
}).unknown(true);

const loginSchema = Joi.object({
  identifiant: Joi.string().required().messages({ 'any.required': 'L\'identifiant est requis' }),
  mot_de_passe: Joi.string().required().messages({ 'any.required': 'Le mot de passe est requis' })
});

module.exports = { registerSchema, loginSchema };
