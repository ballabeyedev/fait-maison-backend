const FavoriService = require('../../services/favoris/favori.service');

exports.ajouterFavori = async (req, res) => {
  try {
    const result = await FavoriService.ajouterFavori(req.user.id, req.body.boutiqueId);
    if (!result.success) return res.status(409).json({ message: result.message });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur ajouterFavori:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.supprimerFavori = async (req, res) => {
  try {
    const result = await FavoriService.supprimerFavori(req.user.id, req.params.boutiqueId);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerFavori:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.mesFavoris = async (req, res) => {
  try {
    const favoris = await FavoriService.mesFavoris(req.user.id);
    return res.status(200).json({ favoris });
  } catch (error) {
    console.error('Erreur mesFavoris:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
