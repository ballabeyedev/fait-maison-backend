const { validationResult } = require('express-validator');
const SignalementService = require('../../services/signalements/signalement.service');

class SignalementController {

  static async signalerContenu(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const signaleurId = req.user.id;
      const { type, cibleId, raison, description } = req.body;

      const result = await SignalementService.signalerContenu(signaleurId, { type, cibleId, raison, description });
      return res.status(201).json({ success: true, ...result });
    } catch (err) {
      console.error('Erreur signalerContenu:', err);
      const status = err.message.includes('introuvable') ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  static async mesSignalements(req, res) {
    try {
      const signaleurId = req.user.id;
      const result = await SignalementService.mesSignalements(signaleurId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error('Erreur mesSignalements:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}

module.exports = SignalementController;
