const formatUser = (utilisateur) => ({
  id: utilisateur.id,
  nom: utilisateur.nom,
  prenom: utilisateur.prenom,
  email: utilisateur.email,
  adresse: utilisateur.adresse,
  telephone: utilisateur.telephone,
  photoProfil: utilisateur.photoProfil,
  role: utilisateur.role,
  logo: utilisateur.logo,
});

module.exports = formatUser;
