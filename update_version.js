const fs = require('fs');
const path = require('path');

// Lire le fichier version.json
const versionPath = path.join(__dirname, 'version.json');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Incrémenter le numéro de patch
version.patch += 1;
version.lastUpdate = new Date().toISOString().split('T')[0];

// Sauvegarder la nouvelle version
fs.writeFileSync(versionPath, JSON.stringify(version, null, 4));

// Lire le fichier index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Mettre à jour la version dans index.html
const versionString = `v${version.major}.${version.minor}.${version.patch}`;
indexContent = indexContent.replace(
    /<span class="text-light small">v\d+\.\d+\.\d+<\/span>/,
    `<span class="text-light small">${versionString}</span>`
);

// Sauvegarder index.html
fs.writeFileSync(indexPath, indexContent);

console.log(`Version mise à jour : ${versionString}`); 