// Configuration de l'application - EXEMPLE
// Renommez ce fichier en config.js et remplacez les valeurs par les vôtres
const config = {
    // Mot de passe crypté (à remplacer par votre propre mot de passe crypté en base64)
    authHash: "VOTRE_MOT_DE_PASSE_CRYPTE",
    // Fonction de décryptage simple
    decrypt: function(hash) {
        return atob(hash);
    }
};

export default config; 