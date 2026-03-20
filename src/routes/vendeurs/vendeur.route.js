const express = require('express');
const router = express.Router();
const VendeurController = require('../../controllers/vendeurs/vendeur.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares//checkActiveUser.middleware');

const isVendeur = require('../../middlewares/isVendeur.middleware'); 
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({ storage });

router.use(authMiddleware);
router.use(checkActiveUser);

router.use(isVendeur);

// -------------------- LISTER PRODUITS --------------------
router.get(
    '/liste-produits', 
    VendeurController.listerProduits
);

// -------------------- AJOUTER PRODUIT --------------------
router.post(
    '/ajout-produit', 
    upload.single('image'), 
    VendeurController.ajouterProduit
);

// -------------------- MODIFIER PRODUIT --------------------
router.put(
    '/modifier-produit/:id', 
    upload.single('image'), 
    VendeurController.modifierProduit
);

// -------------------- SUPPRIMER PRODUIT --------------------
router.delete(
    '/supprimer-produit/:id', 
    VendeurController.supprimerProduit
);

// -------------------- NOMBRE TOTAL DE PRODUITS --------------------
router.get(
    '/nombre-produit', 
    VendeurController.nombreProduits
);

// -------------------- NOMBRE DE PRODUITS PAR CATEGORIE --------------------
router.get(
    '/nombre-produit-categorie', 
    VendeurController.produitsParCategorie
);


module.exports = router;