const formatUser = (utilisateur) => {
  const userFormatted = {
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    adresse: utilisateur.adresse,
    telephone: utilisateur.telephone,
    photoProfil: utilisateur.photoProfil,
    role: utilisateur.role,
  };

  if (utilisateur.role === 'Vendeur' && utilisateur.boutiques) {
    userFormatted.boutiques = utilisateur.boutiques;
  }

  return userFormatted;
};

module.exports = formatUser;