const { Produit, Categorie, Utilisateur, Boutique } = require('../../models');
const { Op, col, where } = require('sequelize');

class AcheteurService {

  // 1. Liste de tous les produits (publics, paginés)
  static async listerTousProduits({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Produit.findAndCountAll({
      where: {
        quantite: { [Op.gt]: 0 } // Stock > 0
      },
      include: [
        {
          model: Categorie,
          as: 'categorie',
          attributes: ['id', 'nom']
        },
        {
          model: Utilisateur,
          as: 'vendeur',
          attributes: ['id', 'nom', 'prenom'],
          include: [
            {
              model: Boutique,
              as: 'boutiques',
              attributes: ['localisation'],
              required: false
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      produits: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  // 2. Rechercher par nom ou catégorie
 static async rechercherProduits(query, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { count, rows } = await Produit.findAndCountAll({
    where: {
      quantite: { [Op.gt]: 0 },
      nom: { [Op.iLike]: `%${query}%` } // Filtre sur nom du produit
    },
    include: [
      {
        model: Categorie,
        as: 'categorie',
        attributes: ['id', 'nom'],
        required: false,
        where: {
          nom: { [Op.iLike]: `%${query}%` } // Filtre sur nom de catégorie
        }
      },
      {
        model: Utilisateur,
        as: 'vendeur',
        attributes: ['id', 'nom', 'prenom'],
        include: [
          {
            model: Boutique,
            as: 'boutiques',
            attributes: ['localisation'],
            required: false
          }
        ]
      }
    ],
    order: [['nom', 'ASC']],
    limit,
    offset,
    distinct: true // Important pour que count soit correct
  });

  return {
    produits: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

  // 3. Filtrer par ville (boutique.localisation)
  static async filtrerParVille(ville, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Produit.findAndCountAll({
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
          model: Utilisateur,
          as: 'vendeur',
          attributes: ['id', 'nom', 'prenom'],
          required: true,
          include: [
            {
              model: Boutique,
              as: 'boutiques',
              attributes: ['localisation'],
              where: {
                localisation: { [Op.iLike]: `%${ville}%` }
              },
              required: true
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      produits: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      },
      ville
    };
  }

  // 4. Contact WhatsApp vendeur
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
          attributes: ['telephone', 'nom'],
          include: [{
            model: Boutique,
            as: 'boutiques',
            attributes: ['telephone', 'localisation']
          }]
        }
      ]
    });

    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    // Priorité téléphone boutique → vendeur
    let tel = produit.vendeur.boutiques?.[0]?.telephone || produit.vendeur.telephone;

    if (!tel) {
      throw new Error('Téléphone vendeur non disponible');
    }

    // Nettoyage numéro
    tel = tel.replace(/[^0-9]/g, '');

    // Ajouter indicatif Sénégal si absent
    if (!tel.startsWith('221')) {
      tel = '221' + tel;
    }

    // Message amélioré
        const message = `
          Bonjour ${produit.vendeur.nom  || ''} ${produit.vendeur.prenom  || ''},

          Je suis intéressé par votre produit :

          🛍️ Nom : ${produit.nom}
          💰 Prix : ${produit.prix} FCFA
          📦 Stock : ${produit.quantite}
          🏷️ Catégorie : ${produit.categorie?.nom || 'Non définie'}
          📍 Localisation : ${produit.vendeur.boutiques?.[0]?.localisation || 'Non précisée'}

            ${produit.description || ''}

          Merci de me donner plus d'informations.
        `;

    const text = encodeURIComponent(message);

    return `https://wa.me/${tel}?text=${text}`;
  }

}

module.exports = AcheteurService