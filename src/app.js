const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression'); // PERF-01 : compression gzip
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');
const { corsConfig, rateLimitConfig, authRateLimitConfig } = require('./config/security');
const logger = require('./utils/logger');

const app = express();

// F-02 : Helmet avec CSP personnalisée + HSTS explicite
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // requis pour Swagger UI en dev
      styleSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:    ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc:["'self'"],
      fontSrc:   ["'self'"],
      objectSrc: ["'none'"],
      frameSrc:  ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,        // 1 an
    includeSubDomains: true,
    preload: true,
  },
}));
app.use(cors(corsConfig));

// LOW-03 : X-Request-ID pour le tracing distribué
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// MED-05 : rawBody uniquement sur la route webhook Orange (évite double bufferisation)
app.use('/faitMaison/paiement/webhook/orange', (req, res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => { req.rawBody = data; });
  next();
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// PERF-01 : compression gzip/brotli
app.use(compression());

app.use(rateLimit(rateLimitConfig));

// Logger HTTP structuré avec Request ID
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('http', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
});

// R-02 : Swagger UI désactivé en production
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/fait-maison-api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


// Routes
const authRoutes = require('./routes/auth.route');
const vendeurRoutes = require('./routes/vendeurs/vendeur.route');
const acheteursRoutes = require('./routes/acheteurs/acheteurs.route');
const adminRoutes = require('./routes/admin/admin.route');
const paiementRoutes = require('./routes/paiement/paiement.route');
const accountRoutes = require('./routes/account.route');
const favoriRoutes = require('./routes/favoris/favori.route');
const avisRoutes = require('./routes/avis/avis.route');
const messageRoutes = require('./routes/messagerie/message.route');
const promotionRoutes = require('./routes/promotions/promotion.route');
const notificationRoutes = require('./routes/notifications/notification.route');
const categorieRoutes = require('./routes/categories/categorie.route');
const signalementRoutes = require('./routes/signalements/signalement.route');
const deviceTokenRoutes = require('./routes/deviceToken.route');
const adminManagementRoutes = require('./routes/adminManagement.route');


// Définition des routes
// Rate limit renforcé sur les routes d'authentification/OTP — L-05
app.use('/faitMaison/auth', rateLimit(authRateLimitConfig));
app.use('/faitMaison/auth', authRoutes);
app.use('/faitMaison/vendeur', vendeurRoutes);
app.use('/faitMaison/acheteurs', acheteursRoutes);
app.use('/faitMaison/admin', adminRoutes);
app.use('/faitMaison/paiement', paiementRoutes);
app.use('/faitMaison/account', accountRoutes);
app.use('/faitMaison/favoris', favoriRoutes);
app.use('/faitMaison/avis', avisRoutes);
app.use('/faitMaison/messages', messageRoutes);
app.use('/faitMaison/promotions', promotionRoutes);
app.use('/faitMaison/notifications', notificationRoutes);
app.use('/faitMaison/categories', categorieRoutes);
app.use('/faitMaison/signalements', signalementRoutes);
app.use('/faitMaison/device-token', deviceTokenRoutes);
app.use('/faitMaison/admin/rbac', adminManagementRoutes);

// Route publique pour le prix de l'abonnement (vendeurs et front)
app.get('/faitMaison/prix-abonnement', async (req, res) => {
  try {
    const ConfigService = require('./services/config/config.service');
    const prix = await ConfigService.getPrixAbonnement();
    return res.status(200).json({ prix, devise: 'FCFA' });
  } catch {
    return res.status(200).json({ prix: 2000, devise: 'FCFA' });
  }
});

// LOW-08 : health check
app.get('/health', async (req, res) => {
  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    return res.status(200).json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV });
  } catch {
    return res.status(503).json({ status: 'error', message: 'DB inaccessible' });
  }
});

const startJobs = require('./jobs');
startJobs();

// R-04 : Gestionnaire d'erreurs global — DERNIER middleware
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error('unhandled_error', {
    requestId: req.requestId,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    method: req.method,
    url: req.originalUrl,
  });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status < 500 ? err.message : 'Erreur serveur interne.',
  });
});

module.exports = app;
