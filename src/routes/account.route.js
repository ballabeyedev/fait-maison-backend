const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');
const checkActiveUser = require('../middlewares/checkActiveUser.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { authRateLimit } = require('../middlewares/rateLimit.middleware');
const {
  modifierProfilSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validations/account.validation');

router.use(auth);
router.use(checkActiveUser);

router.get('/me', accountController.me);
router.put('/modifier-profil', upload.single('photoProfil'), validate(modifierProfilSchema), accountController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), accountController.changePassword);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), accountController.forgotPassword);
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), accountController.resetPassword);

module.exports = router;
