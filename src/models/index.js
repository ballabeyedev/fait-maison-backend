const Boutique = require('./boutique.model');
const Utilisateur = require('./utilisateur.model');
const Produit = require('./produit.model');
const Categorie = require('./categorie.model');

Utilisateur.hasMany(Boutique, {
  foreignKey: 'vendeurId',
  as: 'boutiques'
});

Boutique.belongsTo(Utilisateur, {
  foreignKey: 'vendeurId',
  as: 'vendeur'
});

Utilisateur.hasMany(Produit, { 
    foreignKey: 'vendeurId', 
    as: 'produits' 
});

Produit.belongsTo(Utilisateur, { 
    foreignKey: 'vendeurId', 
    as: 'vendeur' 
});

Categorie.hasMany(Produit, { 
    foreignKey: 'categorieId', 
    as: 'produits' 
});

Produit.belongsTo(Categorie, { 
    foreignKey: 'categorieId', 
    as: 'categorie' 
});

module.exports = { Utilisateur, Produit, Categorie, Boutique };
