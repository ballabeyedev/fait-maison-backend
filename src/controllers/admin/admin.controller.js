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