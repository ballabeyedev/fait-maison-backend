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
      console.log("🚀 [REGISTER] Début inscription");
      console.log("📧 Email:", email);
      console.log("📱 Téléphone:", telephone);
      console.log("👤 Role:", role);

      const emailClean = email.trim().toLowerCase();

      // 🔍 EMAIL CHECK
      const exist = await Utilisateur.findOne({
        where: { email: emailClean },
        transaction: t
      });

      console.log("🔎 Email exist check:", !!exist);

      if (exist) {
        console.log("❌ Email déjà utilisé");
        await t.rollback();
        return { success: false, message: "Cet email est déjà utilisé" };
      }

      // 🔍 TELEPHONE CHECK
      if (telephone) {
        const telExist = await Utilisateur.findOne({
          where: { telephone },
          transaction: t
        });

        console.log("🔎 Tel exist check:", !!telExist);

        if (telExist) {
          console.log("❌ Téléphone déjà utilisé");
          await t.rollback();
          return { success: false, message: "Téléphone déjà utilisé" };
        }
      }

      // 🔐 PASSWORD
      console.log("🔐 Hash password...");
      const hashedPassword = await bcrypt.hash(
        mot_de_passe,
        bcryptConfig.saltRounds
      );

      // 🖼️ IMAGE
      let photoUrl = null;
      if (photoProfil?.buffer) {
        console.log("🖼️ Upload photo profil...");
        photoUrl = await uploadImage(photoProfil.buffer);
      }

      // 👤 CREATE USER
      console.log("👤 Création utilisateur...");
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

      console.log("✅ Utilisateur créé ID:", utilisateur.id);

      let boutiqueCreated = null;

      // ==============================
      // VENDEUR LOGIC
      // ==============================
      if (role === 'Vendeur') {

        console.log("🏪 Création abonnement vendeur...");

        const maintenant = new Date();
        const finEssai = new Date();
        finEssai.setMonth(finEssai.getMonth() + 3);

        const abonnement = await Abonnement.create({
          utilisateurId: utilisateur.id,
          type: 'essai',
          dateDebut: maintenant,
          dateFin: finEssai,
          montant: 0
        }, { transaction: t });

        console.log("📦 Abonnement créé ID:", abonnement.id);

        // 🏪 BOUTIQUE
        if (boutique) {
          console.log("🏪 Création boutique...");

          let logoUrl = null;
          if (boutique?.logo?.buffer) {
            console.log("🖼️ Upload logo boutique...");
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

          console.log("🏪 Boutique créée ID:", boutiqueCreated.id);
        }
      }

      // COMMIT
      await t.commit();
      console.log("🎉 TRANSACTION COMMIT OK");

      return {
        success: true,
        message: "Inscription réussie",
        utilisateur,
        boutique: boutiqueCreated
      };

    } catch (err) {

      console.error("❌ ERREUR REGISTER:", err);
      console.error("📍 Stack:", err.stack);

      await t.rollback();
      console.log("🔁 Transaction rollback effectuée");

      throw err;
    }
  }

  // ==============================
  // LOGIN
  // ==============================
  static async login({ identifiant, mot_de_passe }) {

    try {
      console.log("🔐 [LOGIN] Début login");
      console.log("📧 Identifiant:", identifiant);

      const isEmail = /\S+@\S+\.\S+/.test(identifiant);

      const utilisateur = await Utilisateur.findOne({
        where: isEmail ? { email: identifiant } : { telephone: identifiant },
      });

      console.log("👤 User trouvé:", !!utilisateur);

      if (!utilisateur) {
        console.log("❌ Utilisateur introuvable");
        return {
          success: false,
          error: 'Identifiant ou mot de passe incorrect'
        };
      }

      console.log("📌 Statut user:", utilisateur.statut);

      if (utilisateur.statut !== 'actif') {
        console.log("⛔ Compte inactif");
        return {
          success: false,
          error: `Votre compte est ${utilisateur.statut}`
        };
      }

      console.log("🔐 Vérification password...");
      const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

      if (!valid) {
        console.log("❌ Password incorrect");
        return {
          success: false,
          message: 'Identifiant ou mot de passe incorrect'
        };
      }

      console.log("✅ Auth OK");

      const token = jwt.sign({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

      console.log("🎟️ Token généré");

      return {
        success: true,
        message: "Connexion réussie",
        token,
        utilisateur
      };

    } catch (error) {
      console.error("❌ ERREUR LOGIN:", error);
      console.error("📍 Stack:", error.stack);
      throw error;
    }
  }
}

module.exports = AuthService;