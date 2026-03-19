const AcheteurService = require('../../services/acheteurs/acheteurs.service');

class AcheteurController {

  // 1. Liste tous les produits
  static async listerProduits(req, res) {
    try {
      let { page = 1, limit = 20 } = req.query;

      // Conversion sécurisée
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;

      const result = await AcheteurService.listerTousProduits({ page, limit });

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

  // 2. Rechercher produits
  static async rechercherProduits(req, res) {
    try {
      let { q, page = 1, limit = 20 } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "q" est requis pour la recherche'
        });
      }

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;

      const result = await AcheteurService.rechercherProduits(q.trim(), { page, limit });

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
      let { ville, page = 1, limit = 20 } = req.query;

      if (!ville || ville.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "ville" est requis'
        });
      }

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;

      const result = await AcheteurService.filtrerParVille(ville.trim(), { page, limit });

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
        whatsappUrl,
        message: 'Lien WhatsApp généré avec succès !'
      });

    } catch (err) {
      console.error('❌ Erreur WhatsApp:', err);

      // Différencier erreur produit non trouvé et autre erreur
      const statusCode = err.message === 'Produit non trouvé' || err.message.includes('Téléphone') ? 404 : 500;

      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Erreur serveur lors de la génération du lien WhatsApp'
      });
    }
  }
}
module.exports = AcheteurController;
