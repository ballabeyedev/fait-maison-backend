const express = require('express');
const router = express.Router();
const avisController = require('../../controllers/avis/avis.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const isAcheteur = require('../../middlewares/isAcheteur.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ajouterAvisSchema } = require('../../validations/avis.validation');

router.post('/', auth, checkActiveUser, isAcheteur, validate(ajouterAvisSchema), avisController.ajouterAvis);
router.get('/:boutiqueId', avisController.getAvisBoutique);
router.delete('/:avisId', auth, checkActiveUser, isAcheteur, avisController.supprimerAvis);

module.exports = router;
