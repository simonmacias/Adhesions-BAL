const XLSX = require('xlsx');

// Données des adhérents
const adherents = [
    {
        nom: "Alamichel",
        prenom: "Amandine",
        email: "amandinechamaille@gmail.com",
        dateAdhesion: "2025-01-01",
        cotisationAJour: true,
        ville: "Ligugé",
        dateNaissance: "1983",
        telephone: "06.47.66.87.98",
        genre: "F",
        enfants: 0,
        historique: "2025",
        montantCotisation: 5,
        formuleAdhesion: "j'adhère"
    }
    // ... Ajoutez les autres adhérents ici
];

// Création du workbook
const wb = XLSX.utils.book_new();

// Conversion des données en worksheet
const ws = XLSX.utils.json_to_sheet(adherents);

// Ajout de la feuille au workbook
XLSX.utils.book_append_sheet(wb, ws, "Adhérents");

// Écriture du fichier
XLSX.writeFile(wb, 'adherents_import.xlsx'); 