const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { corsConfig, rateLimitConfig } = require('./config/security');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit(rateLimitConfig));
app.use(require('morgan')('combined'));


// Routes
const authRoutes = require('./routes/auth.route');
const vendeurRoutes = require('./routes/vendeurs/vendeur.route'); 
const acheteursRoutes = require('./routes/acheteurs/acheteurs.route'); 
const adminRoutes = require('./routes/admin/admin.route'); 


// Serveur fichiers statiques pour les uploads [DÉSACTIVÉ - Sécurité]
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Définition des routes
app.use('/faitMaison/auth', authRoutes);
app.use('/faitMaison/vendeur', vendeurRoutes);

app.use('/faitMaison/acheteurs', acheteursRoutes); 
app.use('/faitMaison/admin', adminRoutes);

module.exports = app;