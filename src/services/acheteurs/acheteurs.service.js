const { Produit, Categorie, Utilisateur, Boutique, Abonnement } = require('../../models');
const { Op } = require('sequelize');
const includeVendeurActif = require('../../utils/includeVendeurActif');

const LIMIT = 15;

const paginate = (page = 1) => ({
  limit: LIMIT,
  offset: (page - 1) * LIMIT
});

class AcheteurService {

  // ==============================
  // 1. PRODUITS
  // ==============================
  static async listerTousProduits(page = 1) {
    try {
      console.log("📦 [listerTousProduits] page:", page);

      const { limit, offset } = paginate(page);

      const { rows, count } = await Produit.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: { quantite: { [Op.gt]: 0 } },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          },
          includeVendeurActif()
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log("✅ Produits trouvés:", rows.length);

      return {
        produits: rows,
        total: count,
        page,
        pages: Math.ceil(count / LIMIT)
      };

    } catch (error) {
      console.error("❌ ERREUR listerTousProduits:", error);
      throw error;
    }
  }

  // ==============================
  // 2. RECHERCHE
  // ==============================
  static async rechercherProduits(query, page = 1) {
    try {
      console.log("🔎 Recherche:", query);

      const { limit, offset } = paginate(page);

      if (!query || !query.trim()) {
        console.log("⚠️ Query vide");
        return { produits: [], total: 0, page, pages: 0 };
      }

      const searchTerm = `%${query.trim()}%`;

      const { rows, count } = await Produit.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          quantite: { [Op.gt]: 0 },
          [Op.or]: [
            { nom: { [Op.iLike]: searchTerm } },
            { '$categorie.nom$': { [Op.iLike]: searchTerm } }
          ]
        },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          },
          includeVendeurActif()
        ],
        order: [['nom', 'ASC']]
      });

      console.log("🔎 Résultats recherche:", rows.length);

      return {
        produits: rows,
        total: count,
        page,
        pages: Math.ceil(count / LIMIT)
      };

    } catch (error) {
      console.error("❌ ERREUR rechercherProduits:", error);
      throw error;
    }
  }

  // ==============================
  // 3. FILTRE VILLE
  // ==============================
  static async filtrerParVille(ville, page = 1) {
    try {
      console.log("🌍 Ville filtre:", ville);

      if (!ville || !ville.trim()) {
        console.log("⚠️ Ville vide");
        return { produits: [], total: 0, page, pages: 0 };
      }

      const { limit, offset } = paginate(page);
      const villeSearch = `%${ville.trim()}%`;

      const { rows, count } = await Produit.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: { quantite: { [Op.gt]: 0 } },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          },
          {
            ...includeVendeurActif(),
            include: [
              {
                model: Boutique,
                as: 'boutiques',
                required: true,
                where: { localisation: { [Op.iLike]: villeSearch } }
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log("🌍 Produits ville:", rows.length);

      return {
        produits: rows,
        total: count,
        page,
        ville: ville.trim(),
        pages: Math.ceil(count / LIMIT)
      };

    } catch (error) {
      console.error("❌ ERREUR filtrerParVille:", error);
      throw error;
    }
  }

  // ==============================
  // 4. WHATSAPP
  // ==============================
  static async contacterVendeurWhatsapp(produitId) {
    try {
      console.log("📲 WhatsApp produitId:", produitId);

      const now = new Date();

      const produit = await Produit.findByPk(produitId, {
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['nom']
          },
          {
            model: Utilisateur,
            as: 'vendeur',
            attributes: ['telephone', 'nom', 'prenom'],
            include: [
              {
                model: Boutique,
                as: 'boutiques',
                attributes: ['telephone', 'localisation']
              },
              {
                model: Abonnement,
                as: 'abonnements',
                required: true,
                where: {
                  statut: 'actif',
                  dateFin: { [Op.gte]: now }
                }
              }
            ]
          }
        ]
      });

      if (!produit) {
        console.log("❌ Produit introuvable");
        throw new Error('Produit non trouvé ou vendeur inactif');
      }

      console.log("✅ Produit trouvé");

      let tel =
        produit.vendeur.boutiques?.[0]?.telephone ||
        produit.vendeur.telephone;

      console.log("📞 Téléphone brut:", tel);

      if (!tel) throw new Error('Téléphone vendeur non disponible');

      tel = tel.replace(/[^0-9+]/g, '');

      if (!tel.startsWith('221')) {
        tel = '221' + tel;
      }

      console.log("📞 Téléphone final:", tel);

      const message = `
Bonjour ${produit.vendeur.nom || ''} ${produit.vendeur.prenom || ''},

Je suis intéressé par :

🛍️ ${produit.nom}
💰 ${produit.prix} FCFA
📦 ${produit.quantite}
🏷️ ${produit.categorie?.nom || ''}

Merci.
      `.trim();

      const url = `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;

      console.log("🔗 WhatsApp URL généré");

      return url;

    } catch (error) {
      console.error("❌ ERREUR WhatsApp:", error);
      throw error;
    }
  }

  // ==============================
  // 5. BOUTIQUES
  // ==============================
  static async listerBoutiques(page = 1) {
    try {
      console.log("🏪 Liste boutiques page:", page);

      const { limit, offset } = paginate(page);

      const { rows, count } = await Boutique.findAndCountAll({
        limit,
        offset,
        attributes: [
          'id', 'nom', 'description', 'localisation',
          'telephone', 'logo', 'heure_ouverture', 'heure_fermeture'
        ],
        include: [includeVendeurActif()],
        order: [['createdAt', 'DESC']]
      });

      console.log("🏪 Boutiques trouvées:", rows.length);

      return {
        boutiques: rows,
        total: count,
        page,
        pages: Math.ceil(count / LIMIT)
      };

    } catch (error) {
      console.error("❌ ERREUR boutiques:", error);
      throw error;
    }
  }

  // ==============================
  // 6. PRODUITS BOUTIQUE
  // ==============================
  static async getProduitsByBoutique(boutiqueId, page = 1) {
    try {
      console.log("🏬 Boutique ID:", boutiqueId);

      const boutique = await Boutique.findByPk(boutiqueId);

      if (!boutique) {
        console.log("❌ Boutique introuvable");
        throw new Error('Boutique introuvable');
      }

      const { limit, offset } = paginate(page);

      const { rows, count } = await Produit.findAndCountAll({
        limit,
        offset,
        where: { quantite: { [Op.gt]: 0 } },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          },
          {
            ...includeVendeurActif(),
            include: [
              {
                model: Boutique,
                as: 'boutiques',
                required: true,
                where: { id: boutiqueId }
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log("🏬 Produits boutique:", rows.length);

      return {
        boutique,
        produits: rows,
        total: count,
        page,
        pages: Math.ceil(count / LIMIT)
      };

    } catch (error) {
      console.error("❌ ERREUR getProduitsByBoutique:", error);
      throw error;
    }
  }
}

module.exports = AcheteurService;