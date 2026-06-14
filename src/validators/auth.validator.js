const Joi = require('joi');

// MED-02 : politique de mot de passe renforcée (8 chars + majuscule + chiffre + caractère spécial)
// Architecture : passwordSchema partagé importé ici et dans account.validation.js
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/, 'au moins une majuscule')
  .pattern(/[0-9]/, 'au moins un chiffre')
  .pattern(/[^A-Za-z0-9]/, 'au moins un caractère spécial')
  .required()
  .messages({
    'string.min':          'Le mot de passe doit contenir au moins 8 caractères.',
    'string.pattern.name': 'Le mot de passe doit contenir {#name}.',
    'any.required':        'Le mot de passe est requis.',
  });

exports.passwordSchema = passwordSchema;

exports.registerSchema = Joi.object({
  nom:      Joi.string().min(2).max(100).required(),
  prenom:   Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  mot_de_passe: passwordSchema,
  telephone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).required()
    .messages({ 'string.pattern.base': 'Téléphone invalide (7-15 chiffres, + autorisé).' }),
  adresse:  Joi.string().max(255).optional().allow(''),
  role:     Joi.string().valid('Vendeur', 'Acheteur').required(),
  // Champs boutique (Vendeur uniquement)
  nomBoutique:      Joi.string().max(150).optional().allow(''),
  description:      Joi.string().max(1000).optional().allow(''),
  localisation:     Joi.string().max(255).optional().allow(''),
  heure_ouverture:  Joi.string().optional().allow(''),
  heure_fermeture:  Joi.string().optional().allow(''),
  telephoneBoutique: Joi.string().optional().allow(''),
}).options({ allowUnknown: false });

exports.loginSchema = Joi.object({
  email:       Joi.string().email().optional(),
  telephone:   Joi.string().optional(),
  mot_de_passe: Joi.string().required(),
})
  .or('email', 'telephone')
  .messages({ 'object.missing': 'Email ou téléphone est requis.' })
  .options({ allowUnknown: false });
