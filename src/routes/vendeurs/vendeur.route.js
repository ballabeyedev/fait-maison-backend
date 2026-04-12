const express = require('express');
const router = express.Router();
const VendeurController = require('../../controllers/vendeurs/vendeur.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const isVendeur = require('../../middlewares/isVendeur.middleware'); 
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware);
router.use(checkActiveUser);
router.use(isVendeur);

/**
 * @swagger
 * tags:
 *   name: Vendeurs
 *   description: Gestion des produits côté vendeur
 */

/**
 * @swagger
 * /vendeurs/liste-produits:
 *   get:
 *     summary: Lister les produits du vendeur connecté
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/liste-produits', VendeurController.listerProduits);

/**
 * @swagger
 * /vendeurs/ajout-produit:
 *   post:
 *     summary: Ajouter un produit
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               categorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produit ajouté
 */
router.post(
  '/ajout-produit',
  upload.single('image'),
  VendeurController.ajouterProduit
);

/**
 * @swagger
 * /vendeurs/modifier-produit/{id}:
 *   put:
 *     summary: Modifier un produit
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               categorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produit modifié
 */
router.put(
  '/modifier-produit/:id',
  upload.single('image'),
  VendeurController.modifierProduit
);

/**
 * @swagger
 * /vendeurs/supprimer-produit/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé
 */
router.delete(
  '/supprimer-produit/:id',
  VendeurController.supprimerProduit
);

/**
 * @swagger
 * /vendeurs/nombre-produit:
 *   get:
 *     summary: Nombre total de produits du vendeur
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre total
 */
router.get('/nombre-produit', VendeurController.nombreProduits);

/**
 * @swagger
 * /vendeurs/nombre-produit-categorie:
 *   get:
 *     summary: Nombre de produits par catégorie
 *     tags: [Vendeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par catégorie
 */
router.get('/nombre-produit-categorie', VendeurController.produitsParCategorie);

module.exports = router;