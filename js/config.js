// Configuration de l'application
const config = {
    // Identifiants HelloAsso encodés en base64
    helloasso: {
        clientId: 'SGVsbG9Bc3NvQ2xpZW50SUQ=', // À remplacer par votre clientId encodé
        clientSecret: 'SGVsbG9Bc3NvU2VjcmV0', // À remplacer par votre clientSecret encodé
        orgSlug: 'QkFMX09yZ2FuaXphdGlvbg==' // À remplacer par votre slug d'organisation encodé
    },

    // Fonction pour décoder les valeurs en base64
    decode: function(encodedValue) {
        try {
            return atob(encodedValue);
        } catch (error) {
            console.error('Erreur de décodage:', error);
            return '';
        }
    }
};

// Exporter la configuration
export default config; 