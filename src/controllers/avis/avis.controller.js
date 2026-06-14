const AvisService = require('../../services/avis/avis.service');

exports.ajouterAvis = async (req, res) => {
  try {
    const result = await AvisService.ajouterAvis(req.user.id, req.body);
    if (!result.success) return res.status(400).json({ message: result.message });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur ajouterAvis:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAvisBoutique = async (req, res) => {
  try {
    const avis = await AvisService.getAvisBoutique(req.params.boutiqueId);
    const moyenne = await AvisService.getMoyenneNote(req.params.boutiqueId);
    return res.status(200).json({ avis, ...moyenne });
  } catch (error) {
    console.error('Erreur getAvisBoutique:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.supprimerAvis = async (req, res) => {
  try {
    const result = await AvisService.supprimerAvis(req.params.avisId, req.user.id);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerAvis:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
