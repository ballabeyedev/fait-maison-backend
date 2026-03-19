const { Utilisateur, Boutique} = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, bcryptConfig } = require('../config/security');
const sequelize = require('../config/db');
const { uploadImage } = require('../middlewares/uploadService');

class AuthService {

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

      // 🔍 Vérification email
      const exist = await Utilisateur.findOne({
        where: { email: emailClean },
        transaction: t
      });

      if (exist) {
        await t.rollback();
        return { success: false, message: "Cet email est déjà utilisé" };
      }

      // 🔍 Vérification téléphone
      if (telephone) {
        const telExist = await Utilisateur.findOne({
          where: { telephone },
          transaction: t
        });

        if (telExist) {
          await t.rollback();
          return { success: false, message: "Téléphone déjà utilisé" };
        }
      }

      // 🔐 Hash mot de passe
      const hashedPassword = await bcrypt.hash(
        mot_de_passe,
        bcryptConfig.saltRounds
      );

      // 🖼️ Upload photo
      let photoUrl = null;
      if (photoProfil?.path) {
        photoUrl = await uploadImage(photoProfil.path);
      }

      // 👤 Création utilisateur
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

      let boutiqueCreated = null;

      if (role === 'Vendeur' && boutique) {

        let logoUrl = null;
        if (boutique.logo?.path) {
          logoUrl = await uploadImage(boutique.logo.path);
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

      await t.commit();

      return {
        success: true,
        message: "Inscription réussie",
        utilisateur,
        boutique: boutiqueCreated
      };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- CONNEXION --------------------
  static async login({ identifiant, mot_de_passe }) {
    const isEmail = /\S+@\S+\.\S+/.test(identifiant);
    const utilisateur = await Utilisateur.findOne({
      where: isEmail ? { email: identifiant } : { telephone: identifiant },
    });

    if (!utilisateur) 
      return { 
        success: false,
        error: 'Identifiant ou mot de passe incorrect' 
      };
    
    if (utilisateur.statut !== 'actif') {
      return {
        success: false,
        error: `Votre compte est ${utilisateur.statut}. Veuillez contacter le support ou réactiver votre compte.`
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
      adresse: utilisateur.adresse,
      telephone: utilisateur.telephone,
      photoProfil: utilisateur.photoProfil,
      role: utilisateur.role,
    }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return {
      success: true, 
      token, 
      utilisateur 
    };
  }

}

module.exports = AuthService;
