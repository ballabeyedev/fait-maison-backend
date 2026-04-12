const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middlewares/upload.middleware');

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
  authController.inscriptionUser
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
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
router.post('/login', authController.login);

module.exports = router;