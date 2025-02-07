const fs = require('fs');
const path = require('path');

// Lire le fichier version.json
const versionPath = path.join(__dirname, 'version.json');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Incrémenter la version patch
version.patch += 1;
version.lastUpdate = new Date().toISOString().split('T')[0];

// Sauvegarder la nouvelle version
fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));

// Mettre à jour index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Remplacer la version dans index.html
const versionString = `v${version.major}.${version.minor}.${version.patch}`;
indexContent = indexContent.replace(
    /v\d+\.\d+\.\d+/g,
    versionString
);

fs.writeFileSync(indexPath, indexContent);

console.log(`Version mise à jour vers ${versionString}`); 