const express = require('express');
const router = express.Router();
const AcheteurController = require('../../controllers/acheteurs/acheteurs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Acheteurs
 *   description: Gestion des fonctionnalités côté acheteur
 */

/**
 * @swagger
 * /acheteurs/liste-produits:
 *   get:
 *     summary: Lister tous les produits
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/liste-produits', AcheteurController.listerProduits);

/**
 * @swagger
 * /acheteurs/rechercher-produit-categorie:
 *   get:
 *     summary: Rechercher produits par nom ou catégorie
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recherche
 *         schema:
 *           type: string
 *         description: Nom ou catégorie du produit
 *     responses:
 *       200:
 *         description: Résultat de recherche
 */
router.get('/rechercher-produit-categorie', AcheteurController.rechercherProduits);

/**
 * @swagger
 * /acheteurs/filtrer-produit-ville:
 *   get:
 *     summary: Filtrer produits par ville
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *         example: Dakar
 *     responses:
 *       200:
 *         description: Produits filtrés
 */
router.get('/filtrer-produit-ville', AcheteurController.filtrerParVille);

/**
 * @swagger
 * /acheteurs/liste-boutiques:
 *   get:
 *     summary: Lister toutes les boutiques actives
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des boutiques
 */
router.get('/liste-boutiques', AcheteurController.listerBoutiques);

/**
 * @swagger
 * /acheteurs/contacter-vendeur-par-whatsapp/{id}:
 *   get:
 *     summary: Contacter un vendeur via WhatsApp
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du vendeur
 *     responses:
 *       200:
 *         description: Lien WhatsApp généré
 */
router.get(
  '/contacter-vendeur-par-whatsapp/:id',
  AcheteurController.contacterVendeurWhatsapp
);

/**
 * @swagger
 * /acheteurs/liste-produit-par-boutique/{boutiqueId}:
 *   get:
 *     summary: Lister les produits d'une boutique
 *     tags: [Acheteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boutiqueId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la boutique
 *     responses:
 *       200:
 *         description: Produits de la boutique
 */
router.get(
  '/liste-produit-par-boutique/:boutiqueId',
  AcheteurController.getProduitsByBoutique
);

module.exports = router;