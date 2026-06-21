// controllers/commandes/commande.controller.js
const CommandeService = require('../../services/commandes/commande.service');
const PaiementService = require('../../services/paiement/paiement.service');

// -------------------- ACHETEUR : créer une commande --------------------
exports.creerCommande = async (req, res) => {
  try {
    const acheteurId = req.user.id;
    const {
      items,
      modeLivraison,
      modePaiement,
      adresseLivraison,
      numeroTelephone,
      note,
    } = req.body;

    const commande = await CommandeService.creerCommande({
      acheteurId,
      items,
      modeLivraison,
      modePaiement,
      adresseLivraison,
      numeroTelephone,
      note,
    });

    return res.status(201).json({ success: true, commande });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
};

// -------------------- ACHETEUR : payer une commande en ligne --------------------
exports.payerCommande = async (req, res) => {
  try {
    const acheteurId = req.user.id;
    const { id } = req.params;
    const { methode, numeroTelephone } = req.body;

    const commande = await CommandeService.getCommandePourUtilisateur(id, acheteurId);

    if (commande.acheteurId !== acheteurId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (commande.statutPaiement === 'paye') {
      return res.status(400).json({ success: false, message: 'Commande déjà payée' });
    }
    if (commande.statut === 'annulee') {
      return res.status(400).json({ success: false, message: 'Commande annulée' });
    }
    if (!['orange_money', 'wave'].includes(methode)) {
      return res.status(400).json({ success: false, message: 'Méthode de paiement non supportée' });
    }

    const result = await PaiementService.initPaiement({
      utilisateurId: acheteurId,
      methode,
      montant: parseInt(commande.montantTotal, 10),
      numeroTelephone: numeroTelephone || commande.numeroTelephone,
      type: 'commande',
      commandeId: commande.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Paiement initié. Redirigez le client vers paymentUrl.',
      paiementId: result.paiement.id,
      statut: result.paiement.statut,
      paymentUrl: result.providerData?.paymentUrl || null,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// -------------------- ACHETEUR : mes commandes --------------------
exports.mesCommandes = async (req, res) => {
  try {
    const commandes = await CommandeService.mesCommandes(req.user.id, { statut: req.query.statut });
    return res.status(200).json({ success: true, commandes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- ACHETEUR/VENDEUR : détail d'une commande --------------------
exports.getCommande = async (req, res) => {
  try {
    const commande = await CommandeService.getCommandePourUtilisateur(req.params.id, req.user.id);
    return res.status(200).json({ success: true, commande });
  } catch (err) {
    return res.status(err.status || 404).json({ success: false, message: err.message });
  }
};

// -------------------- ACHETEUR : annuler --------------------
exports.annulerCommande = async (req, res) => {
  try {
    const commande = await CommandeService.annulerCommande(req.params.id, req.user.id);
    return res.status(200).json({ success: true, commande });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
};

// -------------------- VENDEUR : commandes reçues --------------------
exports.commandesVendeur = async (req, res) => {
  try {
    const commandes = await CommandeService.commandesVendeur(req.user.id, { statut: req.query.statut });
    return res.status(200).json({ success: true, commandes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- VENDEUR : faire avancer le statut --------------------
exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!statut) {
      return res.status(400).json({ success: false, message: 'Le nouveau statut est requis' });
    }
    const commande = await CommandeService.changerStatut(req.params.id, req.user.id, statut);
    return res.status(200).json({ success: true, commande });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
};
