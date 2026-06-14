const { Utilisateur, Boutique, Abonnement, TokenBlacklist, UserOtp } = require('../models');
const { sendWelcomeEmail, sendVerificationEmail } = require('./resend.service');
const logger = require('../utils/logger');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomInt } = require('crypto');
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

      const hashedPassword = await bcrypt.hash(mot_de_passe, bcryptConfig.saltRounds);

      let photoUrl = null;
      if (photoProfil?.buffer) {
        photoUrl = await uploadImage(photoProfil.buffer);
      }

      const utilisateur = await Utilisateur.create({
        nom,
        prenom,
        email: emailClean,
        mot_de_passe: hashedPassword,
        adresse: adresse || null,
        telephone,
        photoProfil: photoUrl,
        role,
        verifie: false, // MED-03 : nécessite vérification email
      }, { transaction: t });

      let abonnementData = null;
      let boutiqueCreated = null;

      if (role === 'Vendeur') {
        const dateDebut = new Date();
        const dateFin = new Date();
        dateFin.setMonth(dateFin.getMonth() + 1);

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
            where: { telephone: boutique.telephone },
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

      // MED-03 : générer token de vérification email (24h)
      const verificationCode = randomInt(100000, 1000000).toString();
      const verificationHash = await bcrypt.hash(verificationCode, 10);
      await UserOtp.create({
        utilisateurId: utilisateur.id,
        otpHash: verificationHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      }, { transaction: t });

      await t.commit();

      // Emails en arrière-plan (non bloquants)
      sendWelcomeEmail({
        to: emailClean,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role
      }).catch(() => {});

      sendVerificationEmail({
        to: emailClean,
        nom: utilisateur.nom,
        code: verificationCode,
      }).catch(() => {});

      return {
        success: true,
        message: "Inscription réussie. Vérifiez votre email pour activer votre compte.",
        utilisateur,
        abonnement: abonnementData,
        boutique: boutiqueCreated
      };

    } catch (err) {
      await t.rollback();
      logger.error('auth.register', { message: err.message });
      return {
        success: false,
        message: "Erreur serveur lors de l'inscription"
      };
    }
  }

  // ==============================
  // VÉRIFICATION EMAIL — MED-03
  // ==============================
  static async verifierEmail(email, code) {
    const utilisateur = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!utilisateur) return { success: false, message: 'Email introuvable' };

    if (utilisateur.verifie) {
      return { success: true, message: 'Email déjà vérifié' };
    }

    const otpRecord = await UserOtp.findOne({
      where: {
        utilisateurId: utilisateur.id,
        expiresAt: { [require('sequelize').Op.gte]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) return { success: false, message: 'Code expiré ou invalide. Relancez l\'inscription.' };

    const valid = await bcrypt.compare(code, otpRecord.otpHash);
    if (!valid) return { success: false, message: 'Code de vérification incorrect' };

    await utilisateur.update({ verifie: true });
    await otpRecord.destroy();

    return { success: true, message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' };
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
        return { success: false, error: 'Identifiant ou mot de passe incorrect' };
      }

      if (utilisateur.statut !== 'actif') {
        return { success: false, error: `Votre compte est ${utilisateur.statut}` };
      }

      const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
      if (!valid) {
        return { success: false, message: 'Identifiant ou mot de passe incorrect' };
      }

      const token = jwt.sign({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

      const refreshToken = jwt.sign(
        { id: utilisateur.id },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiresIn }
      );

      // Récupérer les menus accessibles selon les permissions RBAC
      const { Permission, Menu } = require('../models');
      const permissionsData = await Permission.findAll({
        where: { userId: utilisateur.id },
        include: [{ model: Menu, as: 'menu', where: { isActive: true }, required: false }],
      });
      const menus = permissionsData
        .filter((p) => p.canView && p.menu)
        .map((p) => ({
          id:   p.menu.id,
          name: p.menu.name,
          code: p.menu.code,
          path: p.menu.path,
          icon: p.menu.icon,
          permissions: {
            canView:   p.canView,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          },
        }));

      return {
        success: true,
        message: "Connexion réussie",
        token,
        refreshToken,
        utilisateur: { ...utilisateur.toJSON(), isFirstLogin: utilisateur.isFirstLogin },
        abonnement: utilisateur.abonnements?.[0] || null,
        menus,
      };

    } catch (error) {
      // CRIT-03 : logger structuré, pas de console.error + stack trace brute
      logger.error('auth.login', { message: error.message });
      throw error;
    }
  }

  // ==============================
  // LOGOUT
  // ==============================
  static async logout(token, expiresAt) {
    await TokenBlacklist.create({ token, expiresAt });
    return { success: true, message: 'Déconnexion réussie' };
  }

  // ==============================
  // CHANGER MOT DE PASSE
  // ==============================
  static async changerMotDePasse(userId, ancienMotDePasse, nouveauMotDePasse, confirmation) {
    if (nouveauMotDePasse !== confirmation) {
      throw Object.assign(
        new Error('Le nouveau mot de passe et la confirmation ne correspondent pas.'),
        { status: 400 }
      );
    }

    const utilisateur = await Utilisateur.findByPk(userId);
    if (!utilisateur) throw Object.assign(new Error('Utilisateur introuvable.'), { status: 404 });

    const valid = await bcrypt.compare(ancienMotDePasse, utilisateur.mot_de_passe);
    if (!valid) throw Object.assign(new Error('Ancien mot de passe incorrect.'), { status: 401 });

    // Validation de la politique de mot de passe
    const { passwordSchema } = require('../validators/auth.validator');
    const { error } = passwordSchema.validate(nouveauMotDePasse);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });

    const hash = await bcrypt.hash(nouveauMotDePasse, bcryptConfig.saltRounds);
    await utilisateur.update({ mot_de_passe: hash, isFirstLogin: false });

    return { message: 'Mot de passe modifié avec succès.' };
  }

  // ==============================
  // REFRESH TOKEN
  // ==============================
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      const utilisateur = await Utilisateur.findByPk(decoded.id);
      if (!utilisateur) {
        return { success: false, message: 'Utilisateur introuvable' };
      }

      const newToken = jwt.sign({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      }, jwtConfig.secret, { expiresIn: '1h' });

      return { success: true, token: newToken };
    } catch (err) {
      return { success: false, message: 'Refresh token invalide ou expiré' };
    }
  }
}

module.exports = AuthService;
