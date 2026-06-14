const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { changerMotDePasse } = require('../controllers/authPassword.controller');
const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription utilisateur (Acheteur ou Vendeur)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               adresse:
 *                 type: string
 *               telephone:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: Vendeur
 *               nomBoutique:
 *                 type: string
 *               description:
 *                 type: string
 *               localisation:
 *                 type: string
 *               heure_ouverture:
 *                 type: string
 *               heure_fermeture:
 *                 type: string
 *               telephoneBoutique:
 *                 type: string
 *               photoProfil:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Erreur validation
 */
router.post(
  '/register',
  upload.fields([
    { name: 'photoProfil', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  upload.verifyMagicBytes,
  validate(registerSchema),
  authController.inscriptionUser
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur faut choisir entre email ou telephone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               telephone:
 *                 type: string
 *                 example: "+221770000000"
 *               mot_de_passe:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Identifiant incorrect
 */
router.post('/login', validate(loginSchema), authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.post('/refresh', authController.refresh);

// MED-03 : vérification email — GET /faitMaison/auth/verify-email?email=x&code=y
router.get('/verify-email', authController.verifierEmail);

// RBAC : changement de mot de passe (première connexion ou volontaire)
router.post('/changer-mot-de-passe', authMiddleware, changerMotDePasse);

module.exports = router;