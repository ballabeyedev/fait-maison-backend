const Utilisateur = require('../../models/utilisateur.model');
const Produit = require('../../models/produit.model');
const Categorie = require('../../models/categorie.model');
const { Op } = require('sequelize');

class AdminService {

  // 1. Lister tous les vendeurs
  static async listerVendeur() {
    try {
      const vendeurs = await Utilisateur.findAll({
        attributes: { exclude: ['mot_de_passe'] },
        where: { role: 'Vendeur' },
        order: [['createdAt', 'DESC']]
      });

      return {
        message: "Liste des vendeurs",
        vendeurs
      };

    } catch (error) {
      console.error("Erreur listerVendeur :", error);
      throw error;
    }
  }

  // 2. Nombre total de vendeurs actif
  static async nombreVendeursActif() {
    const total = await Utilisateur.count({
      where: { role: 'Vendeur', statut: 'actif' }
    });

    return {
      message: "Nombre total de vendeurs actif",
      totalVendeurs: total
    };
  }

   // 2. Nombre total de vendeurs actif
  static async nombreVendeursInactif() {
    const total = await Utilisateur.count({
      where: { role: 'Vendeur', statut: 'inactif' }
    });

    return {
      message: "Nombre total de vendeurs inactif",
      totalVendeurs: total
    };
  }

  // 3. Lister tous les produits actifs
  static async listerProduitsActifs() {
    try {
      const { rows } = await Produit.findAndCountAll({
        where: { quantite: { [Op.gt]: 0 } },
        include: [
          {
            model: Utilisateur,
            as: 'vendeur',
            attributes: ['id', 'nom', 'prenom']
          },
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      return {
        message: "Liste des produits actifs",
        produits: rows
      };

    } catch (error) {
      console.error("Erreur listerProduitsActifs :", error);
      throw error;
    }
  }

  // 4. Nombre total de clients actifs
  static async nombreClientsActifs() {
    const total = await Utilisateur.count({
      where: { role: 'Acheteur', statut: 'actif' }
    });

    return {
      message: "Nombre total de clients actifs",
      totalClients: total
    };
  }

  // 4. Nombre total de clients actifs
  static async nombreClientsInactifs() {
    const total = await Utilisateur.count({
      where: { role: 'Acheteur', statut: 'inactif' }
    });

    return {
      message: "Nombre total de clients inactifs",
      totalClients: total
    };
  }

  // 5. Liste des clients
  static async listerClients() {
    try {

      const { rows } = await Utilisateur.findAndCountAll({
        where: { role: 'Acheteur' },
        attributes: { exclude: ['mot_de_passe'] },
        order: [['createdAt', 'DESC']]
      });

      return {
        message: "Liste des clients",
        clients: rows
      };

    } catch (error) {
      console.error("Erreur listerClients :", error);
      throw error;
    }
  }

  // 6. Nombre total de produits actifs
  static async nombreProduitsActifs() {
    const total = await Produit.count({
      where: { quantite: { [Op.gt]: 0 } }
    });

    return {
      message: "Nombre total de produits actifs",
      totalProduits: total
    };
  }

}

module.exports = AdminService;