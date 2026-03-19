const VendeurService = require('../../services/vendeurs/vendeur.service');

class VendeurController {

  // -------------------- LISTER PRODUITS --------------------
  static async listerProduits(req, res) {
    try {
      const vendeurId = req.user.id;
      const produits = await VendeurService.listerProduits(vendeurId);
      return res.status(200).json({ success: true, produits });
    } catch (err) {
      console.error('Erreur listerProduits:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // -------------------- AJOUTER PRODUIT --------------------
  static async ajouterProduit(req, res) {
    try {
      const vendeurId = req.user.id;
      const { nom, description, prix, quantite, categorieId } = req.body;
      const image = req.file;


      const produit = await VendeurService.ajouterProduit(vendeurId, {
        nom,
        description,
        prix,
        quantite,
        categorieId,
        image
      });

      return res.status(201).json({ success: true, produit });

    } catch (err) {
      console.error('Erreur ajouterProduit:', err);
      return res.status(500).json({ success: false, message: err.message });
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
      console.error('Erreur modifierProduit:', err);
      return res.status(500).json({ success: false, message: err.message });
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
      console.error('Erreur supprimerProduit:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // -------------------- NOMBRE TOTAL DE PRODUITS --------------------
  static async nombreProduits(req, res) {
    try {
      const vendeurId = req.user.id;
      const stats = await VendeurService.getNombreProduits(vendeurId);
      return res.status(200).json({ success: true, stats });
    } catch (err) {
      console.error('Erreur nombreProduits:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // -------------------- NOMBRE DE PRODUITS PAR CATEGORIE --------------------
  static async produitsParCategorie(req, res) {
    try {
      const vendeurId = req.user.id;
      const stats = await VendeurService.getProduitsParCategorie(vendeurId);
      return res.status(200).json({ success: true, stats });
    } catch (err) {
      console.error('Erreur produitsParCategorie:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

}

module.exports = VendeurController;