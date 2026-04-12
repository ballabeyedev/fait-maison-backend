const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/isAdmin.middleware'); 
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

router.use(auth);
router.use(checkActiveUser);
router.use(isAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion administrative (Admin uniquement)
 */

/**
 * @swagger
 * /admin/nombre-vendeurs-actif:
 *   get:
 *     summary: Nombre de vendeurs actifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de vendeurs actifs
 */
router.get('/nombre-vendeurs-actif', adminController.nombreVendeursActif);

/**
 * @swagger
 * /admin/nombre-vendeurs-inactif:
 *   get:
 *     summary: Nombre de vendeurs inactifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de vendeurs inactifs
 */
router.get('/nombre-vendeurs-inactif', adminController.nombreVendeursInactif);

/**
 * @swagger
 * /admin/liste-vendeurs:
 *   get:
 *     summary: Liste des vendeurs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des vendeurs
 */
router.get('/liste-vendeurs', adminController.listeVendeur);

/**
 * @swagger
 * /admin/nombre-clients-actifs:
 *   get:
 *     summary: Nombre de clients actifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de clients actifs
 */
router.get('/nombre-clients-actifs', adminController.nombreClientsActifs);

/**
 * @swagger
 * /admin/nombre-clients-inactifs:
 *   get:
 *     summary: Nombre de clients inactifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de clients inactifs
 */
router.get('/nombre-clients-inactifs', adminController.nombreClientsInactifs);

/**
 * @swagger
 * /admin/liste-clients:
 *   get:
 *     summary: Liste des clients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 */
router.get('/liste-clients', adminController.listeClients);

/**
 * @swagger
 * /admin/liste-produits-actifs:
 *   get:
 *     summary: Liste des produits actifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits actifs
 */
router.get('/liste-produits-actifs', adminController.listeProduitsActifs);

/**
 * @swagger
 * /admin/nombre-produits-actifs:
 *   get:
 *     summary: Nombre de produits actifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de produits actifs
 */
router.get('/nombre-produits-actifs', adminController.nombreProduitsActifs);

/**
 * @swagger
 * /admin/ajout-categorie:
 *   post:
 *     summary: Ajouter une catégorie
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Fruits
 *     responses:
 *       201:
 *         description: Catégorie ajoutée
 */
router.post('/ajout-categorie', adminController.ajoutCategorie);

module.exports = router;