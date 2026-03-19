const { Produit, Categorie } = require('../../models');
const { uploadImage } = require('../../middlewares/uploadService');
const sequelize = require('../../config/db');

class VendeurService {

  // -------------------- LISTER PRODUITS D'UN VENDEUR --------------------
  static async listerProduits(vendeurId) {
    return await Produit.findAll({
      where: { vendeurId },
      include: [
        { model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }
      ]
    });
  }

  // -------------------- AJOUTER PRODUIT --------------------
  static async ajouterProduit(vendeurId, {
    nom,
    description,
    prix,
    quantite,
    categorieId,
    image
  }) {
    const t = await sequelize.transaction();

    try {
      let imageUrl = null;
      if (image?.path) {
        imageUrl = await uploadImage(image.path);
      }

      const produit = await Produit.create({
        nom,
        description,
        prix,
        quantite,
        image: imageUrl,
        vendeurId,
        categorieId
      }, { transaction: t });

      await t.commit();
      return produit;

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- MODIFIER PRODUIT --------------------
  static async modifierProduit(vendeurId, produitId, updates) {
    const t = await sequelize.transaction();

    try {
      const produit = await Produit.findOne({
        where: { id: produitId, vendeurId },
        transaction: t
      });

      if (!produit) throw new Error("Produit introuvable ou accès interdit");

      // Upload nouvelle image si fournie
      if (updates.image?.path) {
        updates.image = await uploadImage(updates.image.path);
      } else {
        delete updates.image;
      }

      await produit.update(updates, { transaction: t });
      await t.commit();

      return produit;

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- SUPPRIMER PRODUIT --------------------
  static async supprimerProduit(vendeurId, produitId) {
    const t = await sequelize.transaction();

    try {
      const produit = await Produit.findOne({
        where: { id: produitId, vendeurId },
        transaction: t
      });

      if (!produit) throw new Error("Produit introuvable ou accès interdit");

      await produit.destroy({ transaction: t });
      await t.commit();

      return { success: true, message: "Produit supprimé avec succès" };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- NOMBRE DE PRODUITS PAR CATEGORIE --------------------
  static async getProduitsParCategorie(vendeurId) {
    try {
      const result = await Produit.findAll({
        where: { vendeurId },
        attributes: [
          'categorieId',
          [sequelize.fn('COUNT', sequelize.col('"Produit"."id"')), 'nombreProduits']
        ],
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          }
        ],
        group: ['Produit.categorie_id', 'categorie.id', 'categorie.nom']
      });

      return result.map(r => ({
        categorieNom: r.categorie?.nom || null,
        nombreProduits: parseInt(r.get('nombreProduits'))
      }));

    } catch (err) {
      throw err;
    }
  }

   // -------------------- NOMBRE TOTAL DE PRODUITS AJOUTÉS --------------------
  static async getNombreProduits(vendeurId) {
    try {
      const nombreProduits = await Produit.count({
        where: { vendeurId }
      });

      return { nombreProduits };
    } catch (err) {
      throw err;
    }
  }

}

module.exports = VendeurService;