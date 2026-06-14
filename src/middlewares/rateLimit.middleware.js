const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Trop de requêtes. Veuillez patienter.' }
});

module.exports = { authRateLimit, apiRateLimit };
