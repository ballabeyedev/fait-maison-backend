const VendeurService = require('../../services/vendeurs/vendeur.service');
const logger = require('../../utils/logger');

// H-05 : éviter de fuiter err.message technique dans les 500
function serverError(res, context, err) {
  logger.error(context, { message: err.message, stack: err.stack });
  return res.status(500).json({ success: false, message: 'Erreur serveur interne.' });
}

class VendeurController {

  // -------------------- LISTER PRODUITS --------------------
  static async listerProduits(req, res) {
    try {
      const vendeurId = req.user.id;
      const { page, limit } = req.query;
      const result = await VendeurService.listerProduits(vendeurId, { page, limit });
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'listerProduits:', err);
    }
  }

  // -------------------- AJOUTER PRODUIT --------------------
  static async ajouterProduit(req, res) {
    try {
      const vendeurId = req.user.id;
      const { nom, description, prix, quantite, categorieId, delai_preparation, disponible } = req.body;
      const image = req.file;
      const nomVendeur = `${req.user.prenom || ''} ${req.user.nom || ''}`.trim();

      const produit = await VendeurService.ajouterProduit(vendeurId, {
        nom,
        description,
        prix,
        quantite,
        categorieId,
        image,
        delai_preparation,
        disponible,
        nomVendeur
      });

      return res.status(201).json({ success: true, produit });

    } catch (err) {
      return serverError(res, 'ajouterProduit:', err);
    }
  }

  // -------------------- MODIFIER PRODUIT --------------------
  static async modifierProduit(req, res) {
    try {
      const vendeurId = req.user.id;
      const produitId = req.params.id;
      const updates = { ...req.body };
      const image = req.file;
      if (image) updates.image = image;

      const produit = await VendeurService.modifierProduit(vendeurId, produitId, updates);
      return res.status(200).json({ success: true, produit });

    } catch (err) {
      return serverError(res, 'modifierProduit:', err);
    }
  }

  // -------------------- SUPPRIMER PRODUIT --------------------
  static async supprimerProduit(req, res) {
    try {
      const vendeurId = req.user.id;
      const produitId = req.params.id;

      const result = await VendeurService.supprimerProduit(vendeurId, produitId);
      return res.status(200).json(result);

    } catch (err) {
      return serverError(res, 'supprimerProduit:', err);
    }
  }

  // -------------------- NOMBRE TOTAL DE PRODUITS --------------------
  static async nombreProduits(req, res) {
    try {
      const vendeurId = req.user.id;
      const stats = await VendeurService.getNombreProduits(vendeurId);
      return res.status(200).json({ success: true, stats });
    } catch (err) {
      return serverError(res, 'nombreProduits:', err);
    }
  }

  // -------------------- NOMBRE DE PRODUITS PAR CATEGORIE --------------------
  static async produitsParCategorie(req, res) {
    try {
      const vendeurId = req.user.id;
      const stats = await VendeurService.getProduitsParCategorie(vendeurId);
      return res.status(200).json({ success: true, stats });
    } catch (err) {
      return serverError(res, 'produitsParCategorie:', err);
    }
  }

  // -------------------- MA BOUTIQUE --------------------
  static async maBoutique(req, res) {
    try {
      const vendeurId = req.user.id;
      const result = await VendeurService.maBoutique(vendeurId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      if (err.message === 'Boutique introuvable') return res.status(404).json({ success: false, message: err.message });
      return serverError(res, 'maBoutique', err);
    }
  }

  // -------------------- CRÉER BOUTIQUE --------------------
  static async creerBoutique(req, res) {
    try {
      const vendeurId = req.user.id;
      const data = req.body;
      const logoFile = req.file;
      const result = await VendeurService.creerBoutique(vendeurId, data, logoFile);
      return res.status(201).json({ success: true, ...result });
    } catch (err) {
      if (err.message.includes('déjà')) return res.status(409).json({ success: false, message: err.message });
      return serverError(res, 'creerBoutique', err);
    }
  }

  // -------------------- MODIFIER BOUTIQUE --------------------
  static async modifierBoutique(req, res) {
    try {
      const vendeurId = req.user.id;
      const data = req.body;
      const logoFile = req.file;
      const result = await VendeurService.modifierBoutique(vendeurId, data, logoFile);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      if (err.message === 'Boutique introuvable') return res.status(404).json({ success: false, message: err.message });
      return serverError(res, 'modifierBoutique', err);
    }
  }

  // -------------------- MON ABONNEMENT --------------------
  static async monAbonnement(req, res) {
    try {
      const vendeurId = req.user.id;
      const result = await VendeurService.monAbonnement(vendeurId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      if (err.message.includes('Aucun')) return res.status(404).json({ success: false, message: err.message });
      return serverError(res, 'monAbonnement', err);
    }
  }

  // -------------------- INITIER RENOUVELLEMENT --------------------
  static async initierRenouvellement(req, res) {
    try {
      const vendeurId = req.user.id;
      const result = await VendeurService.initierRenouvellement(vendeurId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      if (err.message.includes('actif')) return res.status(400).json({ success: false, message: err.message });
      return serverError(res, 'initierRenouvellement', err);
    }
  }

  // -------------------- STATISTIQUES VUES --------------------
  static async statistiquesVues(req, res) {
    try {
      const vendeurId = req.user.id;
      const result = await VendeurService.statistiquesVues(vendeurId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'statistiquesVues:', err);
    }
  }

  // -------------------- DASHBOARD --------------------
  static async dashboard(req, res) {
    try {
      const result = await VendeurService.dashboard(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'dashboard:', err);
    }
  }

  // -------------------- STATISTIQUES AVANCÉES --------------------
  static async statistiquesAvancees(req, res) {
    try {
      const result = await VendeurService.statistiquesAvancees(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'statistiquesAvancees:', err);
    }
  }

  // -------------------- MES AVIS --------------------
  static async mesAvis(req, res) {
    try {
      const result = await VendeurService.mesAvis(req.user.id, req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message === 'Boutique introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // -------------------- RÉPONDRE À UN AVIS --------------------
  static async repondreAvis(req, res) {
    try {
      const { reponse } = req.body;
      if (!reponse) return res.status(400).json({ success: false, message: 'La réponse est requise' });
      const result = await VendeurService.repondreAvis(req.user.id, req.params.avisId, reponse);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message.includes('introuvable') ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // -------------------- TOGGLE DISPONIBILITÉ --------------------
  static async toggleDisponibilite(req, res) {
    try {
      const result = await VendeurService.toggleDisponibilite(req.user.id, req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message.includes('introuvable') ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // -------------------- MODE PAUSE --------------------
  static async pauseBoutique(req, res) {
    try {
      const result = await VendeurService.pauseBoutique(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message === 'Boutique introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  static async reactiverBoutique(req, res) {
    try {
      const result = await VendeurService.reactiverBoutique(req.user.id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message === 'Boutique introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // -------------------- DUPLIQUER PRODUIT --------------------
  static async dupliquerProduit(req, res) {
    try {
      const result = await VendeurService.dupliquerProduit(req.user.id, req.params.id);
      return res.status(201).json({ success: true, ...result });
    } catch (err) {
      logger.error(''); const status = err.message.includes('introuvable') ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // -------------------- RECHERCHE PRODUITS --------------------
  static async rechercherMesProduits(req, res) {
    try {
      const result = await VendeurService.rechercherMesProduits(req.user.id, req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'rechercherMesProduits:', err);
    }
  }

  // -------------------- HISTORIQUE PAIEMENTS --------------------
  static async historiquePaiements(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await VendeurService.historiquePaiements(req.user.id, { page, limit });
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'historiquePaiements:', err);
    }
  }

  // -------------------- MES CONVERSATIONS --------------------
  static async mesConversations(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await VendeurService.mesConversations(req.user.id, { page, limit });
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return serverError(res, 'mesConversations:', err);
    }
  }

}

module.exports = VendeurController;