const { Produit, Categorie, Utilisateur, Boutique } = require('../../models');
const { Op } = require('sequelize');
const includeVendeurActif = require('../../utils/includeVendeurActif');

const LIMIT = 15;

// 🔥 HELPERS PROPRES
const paginate = (page = 1) => ({
  limit: LIMIT,
  offset: (page - 1) * LIMIT
});

const buildVendeurInclude = () => {
  const vendeur = includeVendeurActif();

  return {
    ...vendeur,
    include: [...(vendeur.include || [])]
  };
};

class AcheteurService {

  // ==============================
  // 1. PRODUITS
  // ==============================
  static async listerTousProduits(page = 1) {
    const { limit, offset } = paginate(page);

    const { rows, count } = await Produit.findAndCountAll({
      limit,
      offset,
      distinct: true,
      where: {
        quantite: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Categorie,
          as: 'categorie',
          attributes: ['id', 'nom']
        },
        buildVendeurInclude()
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
  // 2. RECHERCHE
  // ==============================
  static async rechercherProduits(query, page = 1) {
    const { limit, offset } = paginate(page);

    const { rows, count } = await Produit.findAndCountAll({
      limit,
      offset,
      distinct: true,
      where: {
        quantite: { [Op.gt]: 0 },
        [Op.or]: [
          { nom: { [Op.iLike]: `%${query}%` } },
          { '$categorie.nom$': { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: Categorie,
          as: 'categorie',
          attributes: ['id', 'nom']
        },
        buildVendeurInclude()
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
  // 3. FILTRE VILLE
  // ==============================
  static async filtrerParVille(ville, page = 1) {
    const { limit, offset } = paginate(page);

    const vendeur = includeVendeurActif();

    const { rows, count } = await Produit.findAndCountAll({
      limit,
      offset,
      distinct: true,
      where: {
        quantite: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Categorie,
          as: 'categorie',
          attributes: ['id', 'nom']
        },
        {
          ...vendeur,
          include: [
            ...(vendeur.include || []),
            {
              model: Boutique,
              as: 'boutiques',
              required: true,
              where: {
                localisation: { [Op.iLike]: `%${ville}%` }
              }
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
      ville,
      pages: Math.ceil(count / LIMIT)
    };
  }

  // ==============================
  // 4. WHATSAPP
  // ==============================
  static async contacterVendeurWhatsapp(produitId) {
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
            }
          ]
        }
      ]
    });

    if (!produit) throw new Error('Produit non trouvé');

    let tel =
      produit.vendeur.boutiques?.[0]?.telephone ||
      produit.vendeur.telephone;

    if (!tel) throw new Error('Téléphone vendeur non disponible');

    tel = tel.replace(/[^0-9]/g, '');

    if (!tel.startsWith('221')) {
      tel = '221' + tel;
    }

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
`;

    return `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;
  }

  // ==============================
  // 5. BOUTIQUES
  // ==============================
  static async listerBoutiques(page = 1) {
    const { limit, offset } = paginate(page);

    const { rows, count } = await Boutique.findAndCountAll({
      limit,
      offset,
      attributes: [
        'id',
        'nom',
        'description',
        'localisation',
        'telephone',
        'logo',
        'heure_ouverture',
        'heure_fermeture'
      ],
      include: [buildVendeurInclude()],
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
  // 6. PRODUITS PAR BOUTIQUE
  // ==============================
  static async getProduitsByBoutique(boutiqueId, page = 1) {
    const { limit, offset } = paginate(page);

    const boutique = await Boutique.findByPk(boutiqueId);

    if (!boutique) throw new Error("Boutique introuvable");

    const vendeur = includeVendeurActif();

    const { rows, count } = await Produit.findAndCountAll({
      limit,
      offset,
      where: {
        quantite: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Categorie,
          as: 'categorie',
          attributes: ['id', 'nom']
        },
        {
          ...vendeur,
          include: [
            ...(vendeur.include || []),
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