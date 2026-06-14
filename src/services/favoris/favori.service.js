const { Favori, Boutique, Utilisateur } = require('../../models');

class FavoriService {

  static async ajouterFavori(acheteurId, boutiqueId) {
    const [favori, created] = await Favori.findOrCreate({
      where: { acheteurId, boutiqueId }
    });
    if (!created) return { success: false, message: 'Boutique déjà en favoris' };
    return { success: true, message: 'Boutique ajoutée aux favoris', favori };
  }

  static async supprimerFavori(acheteurId, boutiqueId) {
    const deleted = await Favori.destroy({ where: { acheteurId, boutiqueId } });
    if (!deleted) return { success: false, message: 'Favori introuvable' };
    return { success: true, message: 'Boutique retirée des favoris' };
  }

  static async mesFavoris(acheteurId) {
    const favoris = await Favori.findAll({
      where: { acheteurId },
      include: [
        {
          model: Boutique,
          as: 'boutique',
          include: [{ model: Utilisateur, as: 'vendeur', attributes: ['id', 'nom', 'prenom'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return favoris;
  }
}

module.exports = FavoriService;
