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

// Le contrôleur identifie l'utilisateur via email OU téléphone (identifiant = email || telephone).
// On accepte donc l'un ou l'autre, + mot_de_passe. (Aligné sur auth.controller.login.)
const loginSchema = Joi.object({
  email: Joi.string().email().optional().messages({ 'string.email': 'Email invalide' }),
  telephone: Joi.string().optional().allow('', null),
  mot_de_passe: Joi.string().required().messages({ 'any.required': 'Le mot de passe est requis' })
})
  .or('email', 'telephone')
  .messages({ 'object.missing': 'Email ou téléphone requis' });

module.exports = { registerSchema, loginSchema };
