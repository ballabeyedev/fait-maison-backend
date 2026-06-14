const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const configController = require('../../controllers/admin/config.controller');
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

router.put('/vendeur/:id/suspendre', adminController.suspendreVendeur);
router.put('/vendeur/:id/activer', adminController.activerVendeur);
router.put('/acheteur/:id/suspendre', adminController.suspendreAcheteur);
router.get('/abonnements', adminController.getAbonnements);
router.get('/stats-globales', adminController.getStatsGlobales);

// -------------------- MODÉRATION --------------------
router.put('/produit/:id/approuver', adminController.approuverProduit);
router.put('/produit/:id/rejeter', adminController.rejeterProduit);
router.delete('/produit/:id', adminController.supprimerProduit);
router.delete('/boutique/:id', adminController.supprimerBoutique);
router.put('/vendeur/:id/verifier', adminController.verifierVendeur);
router.get('/signalements', adminController.getSignalements);
router.put('/signalement/:id/traiter', adminController.traiterSignalement);
router.put('/signalement/:id/rejeter', adminController.rejeterSignalement);

// -------------------- CONFIGURATION APP --------------------
router.get('/configs', configController.getAllConfigs);
router.get('/configs/prix-abonnement', configController.getPrixAbonnement);
router.post('/configs', configController.ajouterConfig);
router.put('/configs/:cle', configController.modifierConfig);

// -------------------- KPIs --------------------
router.get('/revenus-mensuels', adminController.revenusParMois);
router.get('/inscriptions-mensuelles', adminController.inscriptionsMensuelles);
router.get('/abonnements-expiration', adminController.abonnementsExpirationProche);

// -------------------- PAIEMENTS --------------------
router.get('/paiements', adminController.tousLesPaiements);
router.get('/paiements/echecs', adminController.paiementsEchoues);

// -------------------- ABONNEMENT MANUEL --------------------
router.post('/abonnement-manuel/:vendeurId', adminController.abonnementManuel);
router.put('/abonnement/:id/revoquer', adminController.revoquerAbonnement);

// -------------------- CATÉGORIES --------------------
router.put('/categorie/:id', adminController.modifierCategorie);
router.delete('/categorie/:id', adminController.supprimerCategorie);

// -------------------- NOTIFICATION BROADCAST --------------------
router.post('/notification-globale', adminController.notificationGlobale);

// -------------------- MODÉRATION AVANCÉE --------------------
router.get('/produits-en-attente', adminController.produitsEnAttente);

module.exports = router;