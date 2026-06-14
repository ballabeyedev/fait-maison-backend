const AcheteurService = require('../../services/acheteurs/acheteurs.service');
const logger = require('../../utils/logger');

function serverError(res, context, err) {
  logger.error(context, { message: err.message, stack: err.stack });
  return res.status(500).json({ success: false, message: 'Erreur serveur interne.' });
}

class AcheteurController {
  // 1. LISTE PRODUITS
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

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('', { err });
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des produits'
      });
    }
  }

  // 2. RECHERCHE
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

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('', { err });
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la recherche'
      });
    }
  }

  // 3. FILTRE PAR VILLE
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

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('', { err });
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors du filtrage par ville'
      });
    }
  }

  // 4. LISTE BOUTIQUES
  static async listerBoutiques(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await AcheteurService.listerBoutiques(page);

      if (!result?.boutiques?.length) {
        return res.status(404).json({
          success: false,
          message: 'Aucune boutique disponible pour le moment.'
        });
      }

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('', { err });
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des boutiques'
      });
    }
  }

  // 5. GÉNÉRATION LIEN WHATSAPP
  static async contacterVendeurWhatsapp(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID du produit invalide'
        });
      }

      const whatsappUrl = await AcheteurService.contacterVendeurWhatsapp(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Lien WhatsApp généré avec succès',
        whatsappUrl
      });
    } catch (error) {
      logger.error('', { err });
      const status = error.message.includes('non trouvé') || error.message.includes('Téléphone') ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Erreur serveur'
      });
    }
  }

  // 7. INCRÉMENTER VUES
  static async incrementerVues(req, res) {
    try {
      const { id } = req.params;
      const result = await AcheteurService.incrementerVues(id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 8. DÉTAIL PRODUIT
  static async getDetailProduit(req, res) {
    try {
      const { id } = req.params;
      const result = await AcheteurService.getDetailProduit(id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      const status = err.message === 'Produit introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // 9. DÉTAIL BOUTIQUE
  static async getDetailBoutique(req, res) {
    try {
      const { id } = req.params;
      const result = await AcheteurService.getDetailBoutique(id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      const status = err.message === 'Boutique introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // 10. BOUTIQUES PROCHES
  static async boutiquesProches(req, res) {
    try {
      const { lat, lng, rayon } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'Les paramètres lat et lng sont requis' });
      }
      const result = await AcheteurService.boutiquesProches(lat, lng, rayon || 5);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 11. LISTE PRODUITS AVEC FILTRES AVANCÉS
  static async listerProduitsAvecFiltres(req, res) {
    try {
      const result = await AcheteurService.listerProduitsAvecFiltres(req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 12. PRODUITS TENDANCE
  static async produitsTendance(req, res) {
    try {
      const result = await AcheteurService.produitsTendance(req.query.limite);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 13. NOUVELLES BOUTIQUES
  static async nouvellesBoutiques(req, res) {
    try {
      const result = await AcheteurService.nouvellesBoutiques(req.query.limite);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 14. BOUTIQUES VÉRIFIÉES
  static async boutiquesVerifiees(req, res) {
    try {
      const result = await AcheteurService.boutiquesVerifiees(req.query.page);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 15. PROMOTIONS ACTIVES (vue acheteur)
  static async promotionsActives(req, res) {
    try {
      const result = await AcheteurService.promotionsActives(req.query.page);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 16. RECHERCHE GLOBALE
  static async rechercheGlobale(req, res) {
    try {
      const { q, page } = req.query;
      if (!q || !q.trim()) {
        return res.status(400).json({ success: false, message: 'Le paramètre "q" est requis' });
      }
      const result = await AcheteurService.rechercheGlobale(q, page);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 17. PAGE ACCUEIL
  static async accueil(req, res) {
    try {
      const result = await AcheteurService.accueil(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 18. MES AVIS DONNÉS
  static async mesAvis(req, res) {
    try {
      const result = await AcheteurService.mesAvis(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 19. MODIFIER UN AVIS
  static async modifierAvis(req, res) {
    try {
      const result = await AcheteurService.modifierAvis(req.user.id, req.params.id, req.body);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      const status = err.message.includes('introuvable') ? 404 : err.message.includes('note') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // 20. MES CONVERSATIONS (vue acheteur)
  static async mesConversations(req, res) {
    try {
      const result = await AcheteurService.mesConversations(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 21. TABLEAU DE BORD ACHETEUR
  static async monTableauDeBord(req, res) {
    try {
      const result = await AcheteurService.monTableauDeBord(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error('', { err });
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // 6. PRODUITS PAR BOUTIQUE
  static async getProduitsByBoutique(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { boutiqueId } = req.params;

      if (!boutiqueId || !/^\d+$/.test(String(boutiqueId).trim())) {
        return res.status(400).json({
          success: false,
          message: 'ID de boutique invalide'
        });
      }

      const result = await AcheteurService.getProduitsByBoutique(parseInt(boutiqueId), page);

      if (!result?.produits?.length) {
        return res.status(404).json({
          success: false,
          message: `Aucun produit trouvé pour la boutique "${result.boutique?.nom || 'cette boutique'}"`
        });
      }

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('', { err });
      const status = error.message === 'Boutique introuvable' ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Erreur serveur'
      });
    }
  }
}

module.exports = AcheteurController;