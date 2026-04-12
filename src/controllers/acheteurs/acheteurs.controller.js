const AcheteurService = require('../../services/acheteurs/acheteurs.service');

class AcheteurController {

  // ==============================
  // 1. LISTE PRODUITS (PAGINATION)
  // ==============================
  static async listerProduits(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const result = await AcheteurService.listerTousProduits(page);

      if (!result?.produits?.length) {
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

  // ==============================
  // 2. RECHERCHE (PAGINATION)
  // ==============================
  static async rechercherProduits(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "q" est requis pour la recherche'
        });
      }

      const result = await AcheteurService.rechercherProduits(q.trim(), page);

      if (!result?.produits?.length) {
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

  // ==============================
  // 3. FILTRE VILLE (PAGINATION)
  // ==============================
  static async filtrerParVille(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { ville } = req.query;

      if (!ville || !ville.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "ville" est requis'
        });
      }

      const result = await AcheteurService.filtrerParVille(ville.trim(), page);

      if (!result?.produits?.length) {
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

  // ==============================
  // 4. LISTE BOUTIQUES (PAGINATION)
  // ==============================
  static async listerBoutiques(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const result = await AcheteurService.listerBoutiques(page);

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Erreur listerBoutiques:', error);

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des boutiques'
      });
    }
  }

  // ==============================
  // 5. WHATSAPP VENDEUR
  // ==============================
  static async contacterVendeurWhatsapp(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Paramètre id invalide'
        });
      }

      const whatsappUrl = await AcheteurService.contacterVendeurWhatsapp(id);

      return res.status(200).json({
        success: true,
        message: 'Lien WhatsApp généré avec succès !',
        whatsappUrl
      });

    } catch (error) {
      console.error('❌ Erreur WhatsApp:', error);

      const statusCode =
        error.message === 'Produit non trouvé' ||
        error.message.includes('Téléphone')
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Erreur serveur lors de la génération du lien WhatsApp'
      });
    }
  }

  // ==============================
  // 6. PRODUITS PAR BOUTIQUE
  // ==============================
  static async getProduitsByBoutique(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { boutiqueId } = req.params;

      if (!boutiqueId || isNaN(boutiqueId)) {
        return res.status(400).json({
          success: false,
          message: 'Paramètre boutiqueId invalide'
        });
      }

      const result = await AcheteurService.getProduitsByBoutique(boutiqueId, page);

      if (!result?.produits?.length) {
        return res.status(404).json({
          success: false,
          message: `Aucun produit trouvé pour la boutique "${result?.boutique?.nom}".`
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
        message: error.message || 'Erreur serveur lors de la récupération des produits'
      });
    }
  }
}

module.exports = AcheteurController;