const AcheteurService = require('../../services/acheteurs/acheteurs.service');

class AcheteurController {

  // 1. Liste tous les produits
  static async listerProduits(req, res) {
    try {
      const result = await AcheteurService.listerTousProduits();

      if (!result.produits.length) {
        return res.status(404).json({
          success: false,
          message: 'Aucun produit disponible pour le moment.'
        });
      }

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Erreur listerProduits:', error);

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des produits'
      });
    }
  }

  // 2. Rechercher produits par nom ou catégorie
  static async rechercherProduits(req, res) {
    try {
      let { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "q" est requis pour la recherche'
        });
      }

      const result = await AcheteurService.rechercherProduits(q.trim());

      if (!result.produits.length) {
        return res.status(404).json({
          success: false,
          message: `Aucun produit trouvé correspondant à "${q.trim()}".`
        });
      }

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Erreur rechercherProduits:', error);

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la recherche'
      });
    }
  }

  // 3. Filtrer par ville
  static async filtrerParVille(req, res) {
    try {
      let { ville } = req.query;

      if (!ville || ville.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "ville" est requis'
        });
      }

      const result = await AcheteurService.filtrerParVille(ville.trim());

      if (!result.produits.length) {
        return res.status(404).json({
          success: false,
          message: `Aucun produit trouvé dans la ville "${ville.trim()}".`
        });
      }

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Erreur filtrerParVille:', error);

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors du filtrage par ville'
      });
    }
  }

  static async listerBoutiques(req, res) {
    try {
      const result = await AcheteurService.listerBoutiques();
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 4. WhatsApp vendeur pour produit
  static async contacterVendeurWhatsapp(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Paramètre id requis'
        });
      }

      const whatsappUrl = await AcheteurService.contacterVendeurWhatsapp(id);

      return res.status(200).json({
        success: true,
        message: 'Lien WhatsApp généré avec succès !',
        whatsappUrl
      });

    } catch (err) {
      console.error('❌ Erreur WhatsApp:', err);

      const statusCode = err.message === 'Produit non trouvé' || err.message.includes('Téléphone') ? 404 : 500;

      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Erreur serveur lors de la génération du lien WhatsApp'
      });
    }
  }

  // 5. Lister les produits d'une boutique spécifique
static async getProduitsByBoutique(req, res) {
  try {
    const { boutiqueId } = req.params;

    if (!boutiqueId) {
      return res.status(400).json({
        success: false,
        message: 'Paramètre boutiqueId requis'
      });
    }

    const result = await AcheteurService.getProduitsByBoutique(boutiqueId);

    if (!result.produits.length) {
      return res.status(404).json({
        success: false,
        message: `Aucun produit trouvé pour la boutique "${result.boutique.nom}".`
      });
    }

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur getProduitsByBoutique:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la récupération des produits de la boutique'
    });
  }
}
}

module.exports = AcheteurController;