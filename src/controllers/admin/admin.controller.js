const AdminService = require('../../services/admin/admin.service');
const formatUser = require('../../utils/formatUser');

// -------------------- LISTE DES VENDEURS --------------------
exports.listeVendeur = async (req, res) => {
  try {
    const result = await AdminService.listerVendeur();

    const vendeursFormates = result.vendeurs.map(vendeur => formatUser(vendeur));

    return res.status(200).json({
      message: result.message,
      vendeurs: vendeursFormates
    });

  } catch (error) {
    console.error("Erreur dans listeVendeur :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des vendeurs"
    });
  }
};

// -------------------- NOMBRE DE VENDEURS ACTIF --------------------
exports.nombreVendeursActif = async (req, res) => {
  try {
    const result = await AdminService.nombreVendeursActif();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans nombreVendeurs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du comptage des vendeurs"
    });
  }
};

// -------------------- NOMBRE DE VENDEURS inactif--------------------
exports.nombreVendeursInactif = async (req, res) => {
  try {
    const result = await AdminService.nombreVendeursInactif();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans nombreVendeurs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du comptage des vendeurs"
    });
  }
};

// -------------------- LISTE DES PRODUITS ACTIFS --------------------
exports.listeProduitsActifs = async (req, res) => {
  try {

    const result = await AdminService.listerProduitsActifs();

    return res.status(200).json({
      message: result.message,
      produits: result.produits
    });

  } catch (error) {
    console.error("Erreur dans listeProduitsActifs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des produits actifs"
    });
  }
};

// -------------------- NOMBRE DE PRODUITS ACTIFS --------------------
exports.nombreProduitsActifs = async (req, res) => {
  try {
    const result = await AdminService.nombreProduitsActifs();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans nombreProduitsActifs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du comptage des produits actifs"
    });
  }
};

// -------------------- LISTE DES CLIENTS --------------------
exports.listeClients = async (req, res) => {
  try {

    const result = await AdminService.listerClients();

    return res.status(200).json({
      message: result.message,
      clients: result.clients
    });

  } catch (error) {
    console.error("Erreur dans listeClients :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des clients"
    });
  }
};

// -------------------- NOMBRE DE CLIENTS --------------------
exports.nombreClientsActifs = async (req, res) => {
  try {
    const result = await AdminService.nombreClientsActifs();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans nombreClientsActifs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du comptage des clients actifs"
    });
  }
};

// -------------------- NOMBRE DE CLIENTS --------------------
exports.nombreClientsInactifs = async (req, res) => {
  try {
    const result = await AdminService.nombreClientsInactifs();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans nombreClientsInactifs :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du comptage des clients inactifs"
    });
  }
};

exports.ajoutCategorie = async (req, res) => {
  try {
    const result = await AdminService.creerCategorie(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -------------------- SUSPENDRE VENDEUR --------------------
exports.suspendreVendeur = async (req, res) => {
  try {
    const result = await AdminService.suspendreVendeur(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur suspendreVendeur:', error);
    return res.status(error.message === 'Vendeur introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- ACTIVER VENDEUR --------------------
exports.activerVendeur = async (req, res) => {
  try {
    const result = await AdminService.activerVendeur(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur activerVendeur:', error);
    return res.status(error.message === 'Vendeur introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- SUSPENDRE ACHETEUR --------------------
exports.suspendreAcheteur = async (req, res) => {
  try {
    const result = await AdminService.suspendreAcheteur(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur suspendreAcheteur:', error);
    return res.status(error.message === 'Acheteur introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- LISTE ABONNEMENTS --------------------
exports.getAbonnements = async (req, res) => {
  try {
    const result = await AdminService.getAbonnements();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur getAbonnements:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- STATS GLOBALES --------------------
exports.getStatsGlobales = async (req, res) => {
  try {
    const result = await AdminService.getStatsGlobales();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur getStatsGlobales:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- APPROUVER PRODUIT --------------------
exports.approuverProduit = async (req, res) => {
  try {
    const result = await AdminService.approuverProduit(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur approuverProduit:', error);
    return res.status(error.message === 'Produit introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- REJETER PRODUIT --------------------
exports.rejeterProduit = async (req, res) => {
  try {
    const result = await AdminService.rejeterProduit(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur rejeterProduit:', error);
    return res.status(error.message === 'Produit introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- SUPPRIMER PRODUIT --------------------
exports.supprimerProduit = async (req, res) => {
  try {
    const result = await AdminService.supprimerProduit(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerProduit:', error);
    return res.status(error.message === 'Produit introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- SUPPRIMER BOUTIQUE --------------------
exports.supprimerBoutique = async (req, res) => {
  try {
    const result = await AdminService.supprimerBoutique(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerBoutique:', error);
    return res.status(error.message === 'Boutique introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- VÉRIFIER VENDEUR --------------------
exports.verifierVendeur = async (req, res) => {
  try {
    const result = await AdminService.verifierVendeur(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur verifierVendeur:', error);
    return res.status(error.message === 'Vendeur introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- SIGNALEMENTS --------------------
exports.getSignalements = async (req, res) => {
  try {
    const result = await AdminService.getSignalements();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur getSignalements:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.traiterSignalement = async (req, res) => {
  try {
    const result = await AdminService.traiterSignalement(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur traiterSignalement:', error);
    return res.status(error.message === 'Signalement introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

exports.rejeterSignalement = async (req, res) => {
  try {
    const result = await AdminService.rejeterSignalement(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur rejeterSignalement:', error);
    return res.status(error.message === 'Signalement introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- KPIs --------------------

exports.revenusParMois = async (req, res) => {
  try {
    const result = await AdminService.revenusParMois(req.query.annee);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur revenusParMois:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.inscriptionsMensuelles = async (req, res) => {
  try {
    const result = await AdminService.inscriptionsMensuelles(req.query.annee);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur inscriptionsMensuelles:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.abonnementsExpirationProche = async (req, res) => {
  try {
    const result = await AdminService.abonnementsExpirationProche(req.query.jours);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur abonnementsExpirationProche:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- PAIEMENTS --------------------

exports.tousLesPaiements = async (req, res) => {
  try {
    const result = await AdminService.tousLesPaiements(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur tousLesPaiements:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.paiementsEchoues = async (req, res) => {
  try {
    const result = await AdminService.paiementsEchoues();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur paiementsEchoues:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- ABONNEMENT MANUEL --------------------

exports.abonnementManuel = async (req, res) => {
  try {
    const result = await AdminService.abonnementManuel(req.params.vendeurId, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur abonnementManuel:', error);
    return res.status(error.message === 'Vendeur introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

exports.revoquerAbonnement = async (req, res) => {
  try {
    const result = await AdminService.revoquerAbonnement(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur revoquerAbonnement:', error);
    return res.status(error.message === 'Abonnement introuvable' ? 404 : 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- CATÉGORIES --------------------

exports.modifierCategorie = async (req, res) => {
  try {
    const result = await AdminService.modifierCategorie(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur modifierCategorie:', error);
    const status = error.message.includes('introuvable') ? 404 : error.message.includes('déjà utilisé') ? 409 : 500;
    return res.status(status).json({ message: error.message || 'Erreur serveur' });
  }
};

exports.supprimerCategorie = async (req, res) => {
  try {
    const result = await AdminService.supprimerCategorie(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur supprimerCategorie:', error);
    const status = error.message.includes('introuvable') ? 404 : error.message.includes('Impossible') ? 409 : 500;
    return res.status(status).json({ message: error.message || 'Erreur serveur' });
  }
};

// -------------------- NOTIFICATION BROADCAST --------------------

exports.notificationGlobale = async (req, res) => {
  try {
    const { titre, message, type, cible } = req.body;
    if (!titre || !message) return res.status(400).json({ message: 'titre et message sont requis' });
    const result = await AdminService.notificationGlobale({ titre, message, type, cible });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur notificationGlobale:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- MODÉRATION AVANCÉE --------------------

exports.produitsEnAttente = async (req, res) => {
  try {
    const result = await AdminService.produitsEnAttente();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur produitsEnAttente:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// -------------------- COMMANDES (e-commerce) --------------------

exports.toutesCommandes = async (req, res) => {
  try {
    const { statut, page, limit } = req.query;
    const result = await AdminService.toutesLesCommandes({ statut, page, limit });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur toutesCommandes:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.statsEcommerce = async (req, res) => {
  try {
    const result = await AdminService.statsEcommerce();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur statsEcommerce:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};