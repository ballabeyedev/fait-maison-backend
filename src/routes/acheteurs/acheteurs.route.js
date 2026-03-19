const express = require('express');
const router = express.Router();
const AcheteurController = require('../../controllers/acheteurs/acheteurs.controller');

const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

// Routes publiques pour acheteurs
router.get(
    '/liste-produits', 
    AcheteurController.listerProduits
);

//Recherche produits (nom ou catégorie)
router.get(
    '/rechercher-produit-categorie', 
    AcheteurController.rechercherProduits
);

//Filtrer produits par ville
router.get(
    '/filtrer-produit-ville', 
    AcheteurController.filtrerParVille
);

// 4. Contacter vendeur via WhatsApp
router.get(
    '/contacter-vendeur-par-whatsapp/:id', 
    AcheteurController.contacterVendeurWhatsapp
);


module.exports = router;