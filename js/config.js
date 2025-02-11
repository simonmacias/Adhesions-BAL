// Configuration de l'application
const config = {
    // Identifiants HelloAsso encodés en base64
    helloasso: {
        clientId: 'MGQ4N2UyYjNiYzcyNDg4ZjgxYmEzNGFiZWJjNDNmYmE=',
        clientSecret: 'MC9WRnBsenBWeEFFbjkzR0xBL3FUK1doS1NWL3FLN2I=',
        orgSlug: 'bGUtY2FmZS1kZS1saWd1Z2U='
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