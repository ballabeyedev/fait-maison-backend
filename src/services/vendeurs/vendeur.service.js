const { Produit, Categorie, Boutique, Abonnement, Avis, Message, Paiement, Favori, Utilisateur } = require('../../models');
const { uploadImage } = require('../../middlewares/uploadService');
const sequelize = require('../../config/db');
const NotificationService = require('../notifications/notification.service');
const { Op, fn, col } = require('sequelize');

const DEFAULT_PAGE_SIZE = 20;

function paginate(page = 1, limit = DEFAULT_PAGE_SIZE) {
  return {
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  };
}

// Champs modifiables sur un Produit — HIGH-01 whitelist
const PRODUIT_FIELDS = ['nom', 'description', 'prix', 'quantite', 'categorieId', 'delai_preparation', 'disponible'];

// Champs modifiables sur une Boutique — HIGH-01 whitelist
const BOUTIQUE_FIELDS = ['nom', 'description', 'localisation', 'heure_ouverture', 'heure_fermeture', 'telephone', 'whatsapp', 'ville', 'latitude', 'longitude'];

class VendeurService {

  // -------------------- LISTER PRODUITS --------------------
  // HIGH-02 : pagination ajoutée
  static async listerProduits(vendeurId, { page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const { limit: l, offset } = paginate(page, limit);
    const { rows, count } = await Produit.findAndCountAll({
      where: { vendeurId },
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }],
      limit: l,
      offset,
      order: [['createdAt', 'DESC']]
    });
    return { produits: rows, total: count, page: parseInt(page), pages: Math.ceil(count / l) };
  }

  // -------------------- AJOUTER PRODUIT --------------------
  static async ajouterProduit(vendeurId, {
    nom, description, prix, quantite, categorieId,
    image, delai_preparation, disponible, nomVendeur
  }) {
    const t = await sequelize.transaction();
    try {
      let imageUrl = null;
      if (image?.buffer) imageUrl = await uploadImage(image.buffer);

      const produit = await Produit.create({
        nom, description, prix, quantite, image: imageUrl,
        vendeurId, categorieId, delai_preparation, disponible
      }, { transaction: t });

      await t.commit();

      NotificationService.notifierTousAcheteurs(
        `Nouveau produit : ${nom}`,
        `${nomVendeur || 'Un vendeur'} a publié "${nom}"`,
        'nouveau_produit'
      ).catch(() => {});

      return produit;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- MODIFIER PRODUIT --------------------
  // HIGH-01 : whitelist stricte des champs modifiables
  static async modifierProduit(vendeurId, produitId, updates) {
    const t = await sequelize.transaction();
    try {
      const produit = await Produit.findOne({
        where: { id: produitId, vendeurId },
        transaction: t
      });

      if (!produit) throw new Error("Produit introuvable ou accès interdit");

      // Construire un objet avec uniquement les champs autorisés
      const safeUpdates = {};
      for (const field of PRODUIT_FIELDS) {
        if (updates[field] !== undefined) safeUpdates[field] = updates[field];
      }

      // Upload image si fournie (vient du middleware multer, pas du body)
      if (updates.image?.buffer) {
        safeUpdates.image = await uploadImage(updates.image.buffer);
      }

      await produit.update(safeUpdates, { transaction: t });
      await t.commit();

      return produit;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- SUPPRIMER PRODUIT --------------------
  static async supprimerProduit(vendeurId, produitId) {
    const t = await sequelize.transaction();
    try {
      const produit = await Produit.findOne({ where: { id: produitId, vendeurId }, transaction: t });
      if (!produit) throw new Error("Produit introuvable ou accès interdit");

      await produit.destroy({ transaction: t });
      await t.commit();

      return { success: true, message: "Produit supprimé avec succès" };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- NOMBRE DE PRODUITS PAR CATEGORIE --------------------
  static async getProduitsParCategorie(vendeurId) {
    const result = await Produit.findAll({
      where: { vendeurId },
      attributes: [
        'categorieId',
        [sequelize.fn('COUNT', sequelize.col('"Produit"."id"')), 'nombreProduits']
      ],
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }],
      group: ['Produit.categorie_id', 'categorie.id', 'categorie.nom']
    });
    return result.map(r => ({
      categorieNom: r.categorie?.nom || null,
      nombreProduits: parseInt(r.get('nombreProduits'))
    }));
  }

  // -------------------- NOMBRE TOTAL DE PRODUITS --------------------
  static async getNombreProduits(vendeurId) {
    const nombreProduits = await Produit.count({ where: { vendeurId } });
    return { nombreProduits };
  }

  // -------------------- MA BOUTIQUE --------------------
  static async maBoutique(vendeurId) {
    const boutique = await Boutique.findOne({
      where: { vendeurId },
      include: [
        { model: Produit, as: 'produits', attributes: ['id', 'nom', 'prix', 'image', 'disponible', 'vues', 'statut'] },
        { model: Avis, as: 'avis', attributes: ['id', 'note', 'commentaire', 'createdAt'] }
      ]
    });
    if (!boutique) throw new Error('Boutique introuvable');
    const totalVues = boutique.produits.reduce((acc, p) => acc + (p.vues || 0), 0);
    const noteMoyenne = boutique.avis.length
      ? (boutique.avis.reduce((acc, a) => acc + a.note, 0) / boutique.avis.length).toFixed(2)
      : null;
    return { boutique, stats: { totalVues, nombreProduits: boutique.produits.length, noteMoyenne } };
  }

  // -------------------- CRÉER BOUTIQUE --------------------
  static async creerBoutique(vendeurId, data, logoFile) {
    const existante = await Boutique.findOne({ where: { vendeurId } });
    if (existante) throw new Error('Vous avez déjà une boutique');

    // HIGH-01 : whitelist champs boutique
    const safeData = {};
    for (const field of BOUTIQUE_FIELDS) {
      if (data[field] !== undefined) safeData[field] = data[field];
    }

    if (logoFile?.buffer) safeData.logo = await uploadImage(logoFile.buffer);

    const boutique = await Boutique.create({ ...safeData, vendeurId });
    return { boutique };
  }

  // -------------------- MODIFIER BOUTIQUE --------------------
  // HIGH-01 : whitelist stricte des champs modifiables
  static async modifierBoutique(vendeurId, data, logoFile) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });
    if (!boutique) throw new Error('Boutique introuvable');

    const safeData = {};
    for (const field of BOUTIQUE_FIELDS) {
      if (data[field] !== undefined) safeData[field] = data[field];
    }

    if (logoFile?.buffer) safeData.logo = await uploadImage(logoFile.buffer);

    await boutique.update(safeData);
    return { boutique };
  }

  // -------------------- MON ABONNEMENT --------------------
  static async monAbonnement(vendeurId) {
    const abonnement = await Abonnement.findOne({
      where: { utilisateurId: vendeurId },
      order: [['createdAt', 'DESC']],
    });
    if (!abonnement) throw new Error('Aucun abonnement trouvé');

    const now = new Date();
    const fin = new Date(abonnement.dateFin);
    const joursRestants = Math.max(0, Math.ceil((fin - now) / (1000 * 60 * 60 * 24)));

    return { abonnement, joursRestants };
  }

  // -------------------- INITIER RENOUVELLEMENT --------------------
  static async initierRenouvellement(vendeurId) {
    const abonnement = await Abonnement.findOne({
      where: { utilisateurId: vendeurId },
      order: [['createdAt', 'DESC']],
    });

    const now = new Date();
    if (abonnement) {
      const fin = new Date(abonnement.dateFin);
      const joursRestants = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));
      if (joursRestants > 7) throw new Error('Votre abonnement est encore actif (plus de 7 jours restants)');
    }

    return { montant: 2000, devise: 'FCFA', vendeurId, description: 'Renouvellement abonnement Fait Maison' };
  }

  // -------------------- STATISTIQUES VUES --------------------
  // HIGH-02 : pagination
  static async statistiquesVues(vendeurId, { page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const { limit: l, offset } = paginate(page, limit);
    const { rows, count } = await Produit.findAndCountAll({
      where: { vendeurId },
      attributes: ['id', 'nom', 'vues'],
      limit: l,
      offset,
      order: [['vues', 'DESC']]
    });
    const totalVues = rows.reduce((acc, p) => acc + (p.vues || 0), 0);
    return { produits: rows, totalVues, total: count, page: parseInt(page), pages: Math.ceil(count / l) };
  }

  // -------------------- DASHBOARD --------------------
  static async dashboard(vendeurId) {
    const [boutique, abonnementRaw, messagesNonLus, notifsNonLues, topProduits] = await Promise.all([
      Boutique.findOne({
        where: { vendeurId },
        attributes: ['id', 'nom', 'logo', 'localisation', 'whatsapp']
      }),
      Abonnement.findOne({
        where: { utilisateurId: vendeurId },
        order: [['createdAt', 'DESC']]
      }),
      Message.count({ where: { destinataireId: vendeurId, lu: false } }),
      sequelize.query(
        `SELECT COUNT(*) FROM notification WHERE utilisateur_id = :uid AND lue = false`,
        { replacements: { uid: vendeurId }, type: sequelize.QueryTypes.SELECT }
      ),
      Produit.findAll({
        where: { vendeurId },
        attributes: ['id', 'nom', 'vues', 'prix', 'image'],
        order: [['vues', 'DESC']],
        limit: 5
      }),
    ]);

    let avis = [];
    let noteMoyenne = null;
    let totalVues = 0;
    let nombreProduits = 0;

    if (boutique) {
      const [avisData, produitStats, favoriCount] = await Promise.all([
        Avis.findAll({
          where: { boutiqueId: boutique.id },
          include: [{ model: Utilisateur, as: 'acheteur', attributes: ['prenom', 'nom', 'photoProfil'] }],
          order: [['createdAt', 'DESC']],
          limit: 5
        }),
        Produit.findAll({ where: { vendeurId }, attributes: ['vues'] }),
        Favori.count({ where: { boutiqueId: boutique.id } })
      ]);

      avis = avisData;
      totalVues = produitStats.reduce((acc, p) => acc + (p.vues || 0), 0);
      nombreProduits = produitStats.length;

      const toutesLesNotes = await Avis.findAll({
        where: { boutiqueId: boutique.id },
        attributes: ['note']
      });
      if (toutesLesNotes.length > 0) {
        noteMoyenne = (toutesLesNotes.reduce((s, a) => s + a.note, 0) / toutesLesNotes.length).toFixed(2);
      }

      boutique.dataValues.nombreFavoris = favoriCount;
    }

    const joursRestants = abonnementRaw
      ? Math.max(0, Math.ceil((new Date(abonnementRaw.dateFin) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;

    const notifsCount = notifsNonLues[0]?.count || 0;

    return {
      boutique,
      abonnement: abonnementRaw ? {
        statut: abonnementRaw.statut,
        type: abonnementRaw.type,
        dateFin: abonnementRaw.dateFin,
        joursRestants
      } : null,
      stats: { totalVues, nombreProduits, noteMoyenne },
      messagesNonLus,
      notificationsNonLues: parseInt(notifsCount),
      topProduits,
      avisRecents: avis
    };
  }

  // -------------------- STATISTIQUES AVANCÉES --------------------
  static async statistiquesAvancees(vendeurId) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });

    const [produits, messagesCount, paiements] = await Promise.all([
      Produit.findAll({
        where: { vendeurId },
        attributes: ['id', 'nom', 'vues', 'prix', 'image', 'disponible']
      }),
      Message.count({ where: { destinataireId: vendeurId } }),
      Paiement.findAll({
        where: { utilisateurId: vendeurId, statut: 'success' },
        attributes: ['montant']
      })
    ]);

    const totalVues = produits.reduce((acc, p) => acc + (p.vues || 0), 0);
    const produitPlusVu = produits.sort((a, b) => (b.vues || 0) - (a.vues || 0))[0] || null;

    let noteMoyenne = null, nombreAvis = 0, meilleurAvis = null, nombreFavoris = 0;

    if (boutique) {
      const [avisData, favoriCount] = await Promise.all([
        Avis.findAll({ where: { boutiqueId: boutique.id }, attributes: ['note', 'commentaire', 'createdAt'] }),
        Favori.count({ where: { boutiqueId: boutique.id } })
      ]);

      nombreAvis = avisData.length;
      nombreFavoris = favoriCount;

      if (avisData.length > 0) {
        noteMoyenne = (avisData.reduce((s, a) => s + a.note, 0) / avisData.length).toFixed(2);
        meilleurAvis = avisData.sort((a, b) => b.note - a.note)[0];
      }
    }

    const totalPaiements = paiements.reduce((s, p) => s + (p.montant || 0), 0);

    return {
      totalVues, nombreProduits: produits.length, produitPlusVu, noteMoyenne,
      nombreAvis, nombreFavoris, messagesRecus: messagesCount, totalPaiements,
      produits: produits.sort((a, b) => (b.vues || 0) - (a.vues || 0))
    };
  }

  // -------------------- MES AVIS --------------------
  static async mesAvis(vendeurId, { note, tri = 'recent', page = 1, limit = 20 }) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });
    if (!boutique) throw new Error('Boutique introuvable');

    const where = { boutiqueId: boutique.id };
    if (note) where.note = parseInt(note);

    const order = tri === 'note_desc' ? [['note', 'DESC']]
      : tri === 'note_asc'  ? [['note', 'ASC']]
      : [['createdAt', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Avis.findAndCountAll({
      where,
      include: [{ model: Utilisateur, as: 'acheteur', attributes: ['id', 'prenom', 'nom', 'photoProfil'] }],
      order,
      limit: parseInt(limit),
      offset
    });

    const toutesNotes = await Avis.findAll({ where: { boutiqueId: boutique.id }, attributes: ['note'] });
    const noteMoyenne = toutesNotes.length
      ? (toutesNotes.reduce((s, a) => s + a.note, 0) / toutesNotes.length).toFixed(2)
      : null;

    return { total: count, page: parseInt(page), noteMoyenne, avis: rows };
  }

  // -------------------- RÉPONDRE À UN AVIS --------------------
  static async repondreAvis(vendeurId, avisId, reponse) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });
    if (!boutique) throw new Error('Boutique introuvable');

    const avis = await Avis.findOne({ where: { id: avisId, boutiqueId: boutique.id } });
    if (!avis) throw new Error('Avis introuvable ou accès interdit');

    await avis.update({ reponseVendeur: reponse });
    return { message: 'Réponse publiée avec succès', avis };
  }

  // -------------------- TOGGLE DISPONIBILITÉ --------------------
  static async toggleDisponibilite(vendeurId, produitId) {
    const produit = await Produit.findOne({ where: { id: produitId, vendeurId } });
    if (!produit) throw new Error('Produit introuvable ou accès interdit');

    await produit.update({ disponible: !produit.disponible });
    return {
      message: produit.disponible ? 'Produit marqué comme disponible' : 'Produit marqué comme indisponible',
      disponible: produit.disponible
    };
  }

  // -------------------- MODE PAUSE BOUTIQUE --------------------
  static async pauseBoutique(vendeurId) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });
    if (!boutique) throw new Error('Boutique introuvable');
    await Produit.update({ disponible: false }, { where: { vendeurId } });
    return { message: 'Boutique mise en pause — tous les produits sont maintenant indisponibles' };
  }

  static async reactiverBoutique(vendeurId) {
    const boutique = await Boutique.findOne({ where: { vendeurId } });
    if (!boutique) throw new Error('Boutique introuvable');
    await Produit.update({ disponible: true }, { where: { vendeurId } });
    return { message: 'Boutique réactivée — tous les produits sont maintenant disponibles' };
  }

  // -------------------- DUPLIQUER PRODUIT --------------------
  static async dupliquerProduit(vendeurId, produitId) {
    const original = await Produit.findOne({ where: { id: produitId, vendeurId } });
    if (!original) throw new Error('Produit introuvable ou accès interdit');

    const copie = await Produit.create({
      nom: `${original.nom} (copie)`,
      description: original.description,
      prix: original.prix,
      quantite: original.quantite,
      image: original.image,
      categorieId: original.categorieId,
      vendeurId,
      delai_preparation: original.delai_preparation,
      disponible: false,
      statut: 'approuve'
    });

    return { message: 'Produit dupliqué avec succès', produit: copie };
  }

  // -------------------- RECHERCHE PRODUITS --------------------
  // HIGH-02 : pagination ajoutée
  static async rechercherMesProduits(vendeurId, { q, categorieId, disponible, page = 1, limit = DEFAULT_PAGE_SIZE }) {
    const where = { vendeurId };
    if (q) where.nom = { [Op.iLike]: `%${q}%` };
    if (categorieId) where.categorieId = categorieId;
    if (disponible !== undefined) where.disponible = disponible === 'true';

    const { limit: l, offset } = paginate(page, limit);
    const { rows, count } = await Produit.findAndCountAll({
      where,
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset
    });
    return { total: count, page: parseInt(page), pages: Math.ceil(count / l), produits: rows };
  }

  // -------------------- HISTORIQUE PAIEMENTS --------------------
  // HIGH-02 : pagination ajoutée
  static async historiquePaiements(vendeurId, { page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const { limit: l, offset } = paginate(page, limit);
    const { rows, count } = await Paiement.findAndCountAll({
      where: { utilisateurId: vendeurId },
      attributes: ['id', 'montant', 'statut', 'methode', 'datePaiement', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset
    });
    const totalPaye = rows
      .filter(p => p.statut === 'success')
      .reduce((s, p) => s + (p.montant || 0), 0);
    return { total: count, page: parseInt(page), pages: Math.ceil(count / l), totalPaye, paiements: rows };
  }

  // -------------------- MES CONVERSATIONS --------------------
  // HIGH-02 : pagination ajoutée
  static async mesConversations(vendeurId, { page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const { limit: l, offset } = paginate(page, limit);
    const messages = await Message.findAll({
      where: { [Op.or]: [{ expediteurId: vendeurId }, { destinataireId: vendeurId }] },
      include: [
        { model: Utilisateur, as: 'expediteur', attributes: ['id', 'prenom', 'nom', 'photoProfil', 'role'] },
        { model: Utilisateur, as: 'destinataire', attributes: ['id', 'prenom', 'nom', 'photoProfil', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset
    });

    const conversationsMap = new Map();
    for (const msg of messages) {
      const interlocuteurId = msg.expediteurId === vendeurId ? msg.destinataireId : msg.expediteurId;
      if (!conversationsMap.has(interlocuteurId)) {
        const interlocuteur = msg.expediteurId === vendeurId ? msg.destinataire : msg.expediteur;
        conversationsMap.set(interlocuteurId, {
          interlocuteur,
          dernierMessage: { contenu: msg.contenu, date: msg.createdAt, lu: msg.lu },
          nonLus: 0
        });
      }
    }

    const nonLusParConv = await Message.findAll({
      where: { destinataireId: vendeurId, lu: false },
      attributes: ['expediteurId', [fn('COUNT', col('id')), 'nonLus']],
      group: ['expediteurId'],
      raw: true
    });

    for (const r of nonLusParConv) {
      if (conversationsMap.has(r.expediteurId)) {
        conversationsMap.get(r.expediteurId).nonLus = parseInt(r.nonLus);
      }
    }

    const conversations = Array.from(conversationsMap.values());
    return { total: conversations.length, conversations };
  }
}

module.exports = VendeurService;
