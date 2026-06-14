// controllers/paiement/paiement.controller.js
const PaiementService = require('../../services/paiement/paiement.service');
const OrangeMoneyService = require('../../services/paiement/orangeMoney.service');

// -------------------- INITIER LE PAIEMENT --------------------
exports.payer = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const { methode, montant, numeroTelephone } = req.body;

    // Validation basique
    if (!methode || !montant || !numeroTelephone) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants : methode, montant, numeroTelephone",
      });
    }

    if (!['orange_money', 'wave'].includes(methode)) {
      return res.status(400).json({
        success: false,
        message: "Méthode de paiement non supportée",
      });
    }

    if (montant <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant doit être positif",
      });
    }

    const result = await PaiementService.initPaiement({
      utilisateurId,
      methode,
      montant,
      numeroTelephone,
    });

    return res.status(200).json({
      success: true,
      message: "Paiement initié. Redirigez le client vers payment_url.",
      paiementId: result.paiement.id,
      statut: result.paiement.statut,
      // URL Orange Money vers laquelle rediriger le client
      paymentUrl: result.providerData?.paymentUrl || null,
    });

  } catch (err) {
    console.error("[PAIEMENT] Erreur initPaiement:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------- WEBHOOK ORANGE MONEY --------------------
// Route publique — Orange appelle ce endpoint automatiquement
exports.webhook = async (req, res) => {
  try {
    console.log("[WEBHOOK] Notification Orange Money reçue:", JSON.stringify(req.body));

    // Valider que la notification vient bien d'Orange
    const estValide = OrangeMoneyService.validerSignature(req);
    if (!estValide) {
      console.warn("[WEBHOOK] Signature invalide ou body malformé");
      return res.status(400).json({ success: false, message: "Notification invalide" });
    }

    // Orange Money envoie selon leur doc :
    // { status: "SUCCESS" | "FAILED", order_id: "...", pay_token: "...", ... }
    const {
      status,
      order_id,
      pay_token,
      txnid,             // ID transaction côté Orange
    } = req.body;

    await PaiementService.confirmerPaiement({
      transactionId: pay_token || txnid || null,
      status,
      orderId: order_id,
    });

    // Orange attend un 200 pour considérer la notification comme reçue
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[WEBHOOK] Erreur traitement:", err.message);
    // On renvoie quand même 200 pour éviter qu'Orange retry en boucle sur une erreur interne
    return res.status(200).json({ success: false, error: err.message });
  }
};

// -------------------- CONSULTER UN PAIEMENT --------------------
exports.getPaiement = async (req, res) => {
  try {
    const { paiementId } = req.params;

    const paiement = await PaiementService.getPaiement(paiementId);

    if (!paiement) {
      return res.status(404).json({ success: false, message: "Paiement introuvable" });
    }

    // Vérifier que le paiement appartient bien à cet utilisateur
    if (paiement.utilisateurId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    return res.status(200).json({ success: true, paiement });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- HISTORIQUE DES PAIEMENTS --------------------
exports.getHistorique = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const paiements = await PaiementService.getHistorique(utilisateurId);
    return res.status(200).json({ success: true, paiements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};