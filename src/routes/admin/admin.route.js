const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/isAdmin.middleware'); 
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

router.use(auth);
router.use(checkActiveUser);
router.use(isAdmin);
// -------------------- NOMBRE DE VENDEURS ACTIF--------------------
router.get(
  '/nombre-vendeurs-actif',
  adminController.nombreVendeursActif
);

// -------------------- NOMBRE DE VENDEURS INACTIF--------------------
router.get(
  '/nombre-vendeurs-inactif',
  adminController.nombreVendeursInactif
);

// -------------------- LISTE DES VENDEURS --------------------
router.get(
  '/liste-vendeurs',
  adminController.listeVendeur
);

// -------------------- NOMBRE DE CLIENTS ACTIFS --------------------
router.get(
  '/nombre-clients-actifs',
  adminController.nombreClientsActifs
);

// -------------------- NOMBRE DE CLIENTS INACTIFS --------------------
router.get(
  '/nombre-clients-inactifs',
  adminController.nombreClientsInactifs
);

// -------------------- LISTE DES CLIENTS --------------------
router.get(
  '/liste-clients',
  adminController.listeClients
);

// -------------------- LISTE DES PRODUITS ACTIFS --------------------
router.get(
  '/liste-produits-actifs',
  adminController.listeProduitsActifs
);

// -------------------- NOMBRE DE PRODUITS ACTIFS --------------------
router.get(
  '/nombre-produits-actifs',
  adminController.nombreProduitsActifs
);

module.exports = router;