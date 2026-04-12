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
  // 1. LISTE TOUS PRODUITS (paginer)
  // ==============================
  static async listerTousProduits(page = 1) {
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

    return {
      produits: rows,
      total: count,
      page,
      pages: Math.ceil(count / LIMIT)
    };
  }

  // ==============================
  // 2. RECHERCHE PAR NOM OU CATÉGORIE
  // ==============================
  static async rechercherProduits(query, page = 1) {
    const { limit, offset } = paginate(page);

    // Nettoyage et validation
    if (!query || !query.trim()) {
      return {
        produits: [],
        total: 0,
        page,
        pages: 0
      };
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

    return {
      produits: rows,
      total: count,
      page,
      pages: Math.ceil(count / LIMIT)
    };
  }

  // ==============================
  // 3. FILTRER PAR VILLE (localisation de la boutique)
  // ==============================
  static async filtrerParVille(ville, page = 1) {
    if (!ville || !ville.trim()) {
      return {
        produits: [],
        total: 0,
        page,
        pages: 0,
        ville: null
      };
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

    return {
      produits: rows,
      total: count,
      page,
      ville: ville.trim(),
      pages: Math.ceil(count / LIMIT)
    };
  }

  // ==============================
  // 4. GÉNÉRATION LIEN WHATSAPP (avec vérification abonnement)
  // ==============================
  static async contacterVendeurWhatsapp(produitId) {
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
          required: true,
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

    if (!produit) throw new Error('Produit non trouvé ou vendeur non actif');

    let tel = produit.vendeur.boutiques?.[0]?.telephone || produit.vendeur.telephone;
    if (!tel) throw new Error('Téléphone vendeur non disponible');

    // Nettoyage robuste du numéro
    tel = tel.replace(/[^0-9+]/g, '');
    tel = tel.replace(/^00/, '');       // enlever 00 international
    if (!tel.match(/^(\+221|221)/)) {
      tel = tel.replace(/^\+/, '');     // enlever + s'il reste
      tel = '221' + tel;
    }
    tel = tel.replace(/^\+/, '');       // WhatsApp attend sans +

    const message = `
Bonjour ${produit.vendeur.nom || ''} ${produit.vendeur.prenom || ''},

Je suis intéressé par votre produit :

🛍️ Nom : ${produit.nom}
💰 Prix : ${produit.prix} FCFA
📦 Stock : ${produit.quantite}
🏷️ Catégorie : ${produit.categorie?.nom || 'Non définie'}
📍 Localisation : ${produit.vendeur.boutiques?.[0]?.localisation || 'Non précisée'}

${produit.description || ''}

Merci.
    `.trim();

    return `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;
  }

  // ==============================
  // 5. LISTE DES BOUTIQUES (paginer)
  // ==============================
  static async listerBoutiques(page = 1) {
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

    return {
      boutiques: rows,
      total: count,
      page,
      pages: Math.ceil(count / LIMIT)
    };
  }

  // ==============================
  // 6. PRODUITS D'UNE BOUTIQUE SPÉCIFIQUE
  // ==============================
  static async getProduitsByBoutique(boutiqueId, page = 1) {
    const boutique = await Boutique.findByPk(boutiqueId);
    if (!boutique) throw new Error('Boutique introuvable');

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

    return {
      boutique,
      produits: rows,
      total: count,
      page,
      pages: Math.ceil(count / LIMIT)
    };
  }
}

module.exports = AcheteurService;