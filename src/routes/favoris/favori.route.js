const express = require('express');
const router = express.Router();
const favoriController = require('../../controllers/favoris/favori.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const isAcheteur = require('../../middlewares/isAcheteur.middleware');

router.use(auth);
router.use(checkActiveUser);
router.use(isAcheteur);

router.post('/', favoriController.ajouterFavori);
router.delete('/:boutiqueId', favoriController.supprimerFavori);
router.get('/', favoriController.mesFavoris);

module.exports = router;
