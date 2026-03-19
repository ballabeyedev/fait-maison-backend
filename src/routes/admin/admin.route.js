const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middlewares/auth.middleware');

// -------------------- NOMBRE DE VENDEURS ACTIF--------------------
router.get(
  '/nombre-vendeurs-actif',
  auth,
  adminController.nombreVendeursActif
);

// -------------------- NOMBRE DE VENDEURS INACTIF--------------------
router.get(
  '/nombre-vendeurs-inactif',
  auth,
  adminController.nombreVendeursInactif
);

// -------------------- LISTE DES VENDEURS --------------------
router.get(
  '/liste-vendeurs',
  auth,
  adminController.listeVendeur
);

// -------------------- NOMBRE DE CLIENTS ACTIFS --------------------
router.get(
  '/nombre-clients-actifs',
  auth,
  adminController.nombreClientsActifs
);

// -------------------- NOMBRE DE CLIENTS INACTIFS --------------------
router.get(
  '/nombre-clients-inactifs',
  auth,
  adminController.nombreClientsInactifs
);

// -------------------- LISTE DES CLIENTS --------------------
router.get(
  '/liste-clients',
  auth,
  adminController.listeClients
);

// -------------------- LISTE DES PRODUITS ACTIFS --------------------
router.get(
  '/liste-produits-actifs',
  auth,
  adminController.listeProduitsActifs
);

// -------------------- NOMBRE DE PRODUITS ACTIFS --------------------
router.get(
  '/nombre-produits-actifs',
  auth,
  adminController.nombreProduitsActifs
);

module.exports = router;