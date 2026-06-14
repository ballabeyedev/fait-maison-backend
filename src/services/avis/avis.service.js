const { Avis, Boutique, Utilisateur } = require('../../models');
const sequelize = require('../../config/db');
const { fn, col } = require('sequelize');

class AvisService {

  static async ajouterAvis(acheteurId, { boutiqueId, note, commentaire }) {
    const boutique = await Boutique.findByPk(boutiqueId);
    if (!boutique) throw new Error('Boutique introuvable');

    if (boutique.vendeurId === acheteurId) {
      return { success: false, message: 'Vous ne pouvez pas noter votre propre boutique' };
    }

    const avis = await Avis.create({ acheteurId, boutiqueId, note, commentaire });
    return { success: true, message: 'Avis ajouté', avis };
  }

  static async getAvisBoutique(boutiqueId) {
    const avis = await Avis.findAll({
      where: { boutiqueId },
      include: [
        { model: Utilisateur, as: 'acheteur', attributes: ['id', 'nom', 'prenom', 'photoProfil'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return avis;
  }

  static async getMoyenneNote(boutiqueId) {
    const result = await Avis.findOne({
      where: { boutiqueId },
      attributes: [[fn('AVG', col('note')), 'moyenne'], [fn('COUNT', col('id')), 'total']],
      raw: true
    });
    return {
      moyenne: parseFloat(result.moyenne) || 0,
      total: parseInt(result.total) || 0
    };
  }

  static async supprimerAvis(avisId, acheteurId) {
    const avis = await Avis.findOne({ where: { id: avisId, acheteurId } });
    if (!avis) return { success: false, message: 'Avis introuvable ou accès interdit' };
    await avis.destroy();
    return { success: true, message: 'Avis supprimé' };
  }
}

module.exports = AvisService;
