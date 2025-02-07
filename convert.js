const data = `Ville / Adresse,Année de naissance,Nom-Prénom,MAIL,       TEL,       HOMME / FEMME/Enfant,MONTANT COTISATION,Formule adhésion  ,Lieu d' adhésion  ,Membre du bureau et CA,Membre du bureau et CA
Ligugé        ,1983, Alamichel Amandine,amandinechamaille@gmail.com,06.47.66.87.98,F,5,j'adhère,local,,
Poitiers,1993, Arlettaz Maud,maudy@riseup.net,06.35.16.75.42,F,5,j'adhère,local,,`

// Fonction pour nettoyer les chaînes de caractères
const cleanString = (str) => {
    return str ? str.trim().replace(/\s+/g, ' ') : '';
};

// Fonction pour extraire le nom et le prénom
const extractNameParts = (fullName) => {
    const cleaned = cleanString(fullName);
    const parts = cleaned.split(' ');
    const nom = parts[0];
    const prenom = parts.slice(1).join(' ');
    return { nom, prenom };
};

// Conversion des données
const convertToAppFormat = (csvData) => {
    const lines = csvData.split('\n').slice(1); // Ignorer l'en-tête
    
    return lines.map(line => {
        const [
            ville,
            anneeNaissance,
            nomPrenom,
            email,
            telephone,
            genre,
            montantCotisation,
            formuleAdhesion,
            lieuAdhesion
        ] = line.split(',').map(cleanString);

        const { nom, prenom } = extractNameParts(nomPrenom);
        
        return {
            id: Date.now() + Math.random(), // Identifiant unique
            ville: ville,
            dateNaissance: anneeNaissance ? anneeNaissance : '',
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: telephone,
            genre: genre,
            montantCotisation: parseFloat(montantCotisation) || 0,
            formuleAdhesion: formuleAdhesion,
            dateAdhesion: '2025-01-01', // Date par défaut pour 2025
            cotisationAJour: true, // Par défaut à jour pour 2025
            enfants: genre.toLowerCase().includes('enfant') ? 1 : 0,
            historique: ['2025']
        };
    });
};

// Conversion et affichage du résultat
const jsonData = convertToAppFormat(data);
console.log(JSON.stringify(jsonData, null, 2)); 