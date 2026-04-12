const { Utilisateur, Boutique, Abonnement } = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, bcryptConfig } = require('../config/security');
const sequelize = require('../config/db');
const { uploadImage } = require('../middlewares/uploadService');

class AuthService {

  // ==============================
  // REGISTER
  // ==============================
  static async register({
    nom,
    prenom,
    email,
    mot_de_passe,
    adresse,
    telephone,
    photoProfil,
    role = 'Acheteur',
    boutique
  }) {
    const t = await sequelize.transaction();

    try {
      const emailClean = email.trim().toLowerCase();

      const exist = await Utilisateur.findOne({
        where: { email: emailClean },
        transaction: t
      });

      if (exist) {
        await t.rollback();
        return { success: false, message: "Cet email est déjà utilisé" };
      }

      const hashedPassword = await bcrypt.hash(
        mot_de_passe,
        bcryptConfig.saltRounds
      );

      let photoUrl = null;
      if (photoProfil?.buffer) {
        photoUrl = await uploadImage(photoProfil.buffer);
      }

      const utilisateur = await Utilisateur.create({
        nom,
        prenom,
        email: emailClean,
        mot_de_passe: hashedPassword,
        adresse,
        telephone,
        photoProfil: photoUrl,
        role
      }, { transaction: t });

      let abonnementData = null;
      let boutiqueCreated = null;

      if (role === 'Vendeur') {

        const dateDebut = new Date();
        const dateFin = new Date();
        dateFin.setMonth(dateFin.getMonth() + 3);

        const abonnement = await Abonnement.create({
          utilisateurId: utilisateur.id,
          type: 'essai',
          dateDebut,
          dateFin,
          montant: 0
        }, { transaction: t });

        abonnementData = {
          id: abonnement.id,
          type: abonnement.type,
          statut: abonnement.statut,
          dateDebut: abonnement.dateDebut,
          dateFin: abonnement.dateFin,
          montant: abonnement.montant
        };

        if (boutique) {
          const existBoutique = await Boutique.findOne({
            where: {
              telephone: boutique.telephone
            },
            transaction: t
          });

          if (existBoutique) {
            await t.rollback();
            return {
              success: false,
              message: "Ce numéro de téléphone est déjà utilisé par une autre boutique"
            };
          }
          let logoUrl = null;
          if (boutique?.logo?.buffer) {
            logoUrl = await uploadImage(boutique.logo.buffer);
          }

          boutiqueCreated = await Boutique.create({
            nom: boutique.nom,
            description: boutique.description,
            localisation: boutique.localisation,
            heure_ouverture: boutique.heure_ouverture,
            heure_fermeture: boutique.heure_fermeture,
            telephone: boutique.telephone,
            logo: logoUrl,
            vendeurId: utilisateur.id
          }, { transaction: t });
        }
      }

      await t.commit();

      return {
        success: true,
        message: "Inscription réussie",
        utilisateur,
        abonnement: abonnementData,
        boutique: boutiqueCreated
      };

    } catch (err) {
      await t.rollback();
      return {
        success: false,
        message: "Erreur serveur lors de l’inscription"
      };
    }
  }

  // ==============================
  // LOGIN
  // ==============================
  static async login({ identifiant, mot_de_passe }) {

    try {

      const isEmail = /\S+@\S+\.\S+/.test(identifiant);

      const utilisateur = await Utilisateur.findOne({
        where: isEmail ? { email: identifiant } : { telephone: identifiant },
        include: [
          {
            model: Abonnement,
            as: 'abonnements',
            required: false
          }
        ],
        order: [[{ model: Abonnement, as: 'abonnements' }, 'createdAt', 'DESC']]
      });

      if (!utilisateur) {
        return {
          success: false,
          error: 'Identifiant ou mot de passe incorrect'
        };
      }

      if (utilisateur.statut !== 'actif') {
        return {
          success: false,
          error: `Votre compte est ${utilisateur.statut}`
        };
      }

      const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

      if (!valid) {
        return {
          success: false,
          message: 'Identifiant ou mot de passe incorrect'
        };
      }

      const token = jwt.sign({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

      return {
        success: true,
        message: "Connexion réussie",
        token,
        utilisateur,
        abonnement: utilisateur.abonnements?.[0] || null,
      };

    } catch (error) {
      console.error("❌ ERREUR LOGIN:", error);
      console.error("📍 Stack:", error.stack);
      throw error;
    }
  }
}

module.exports = AuthService;