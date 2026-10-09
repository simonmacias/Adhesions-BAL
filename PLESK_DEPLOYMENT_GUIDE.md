# Architecture Adhesions BAL - GitHub Pages + Plesk Node.js + MariaDB

## 🏗️ Architecture

```
┌─────────────────────────┐
│   GitHub Pages          │
│   (Frontend Vue.js)     │
│  index.html + css/js    │
└────────────┬────────────┘
             │
             │ HTTPS API calls
             │ (CORS enabled)
             │
        ┌────▼────────────────────┐
        │  Plesk Node.js Server    │
        │  host01.lrob.net         │
        │  - Express API           │
        │  - Port 3000 (proxy)     │
        └────┬────────────────────┘
             │
             │ MySQL/TCP:3306
             │
        ┌────▼─────────────────┐
        │  MariaDB Local        │
        │  localhost:3306       │
        │  bal-liguge_adherents │
        └──────────────────────┘
```

## 📋 Étapes de déploiement

### Étape 1️⃣ : Préparer la base de données MariaDB

1. **Accédez à phpMyAdmin** sur `host01.lrob.net/phpMyAdmin`
2. **Créez la base de données** :
   ```sql
   CREATE DATABASE bal-liguge_adherents DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Importez le schéma** : Copiez-collez le contenu de `database/schema.sql` dans phpMyAdmin

### Étape 2️⃣ : Déployer l'API Node.js sur Plesk

#### Méthode A : Via l'interface Plesk

1. **Connectez-vous à Plesk** (généralement `host01.lrob.net:8443`)
2. **Allez à** : Domaines → Votre domaine → Applications Node.js
3. **Créez une nouvelle application** :
   - **Nom** : adhesions-api
   - **Chemin** : /api (ou /adhesions-api)
   - **Port** : 3000
   - **Node version** : 18+ LTS recommandé

4. **Créez les fichiers** dans le répertoire de l'application :
   - Copiez `plesk-api/server.js`
   - Copiez `plesk-api/package.json`
   - Créez `plesk-api/.env` avec vos identifiants

   ```env
   DB_HOST=localhost
   DB_USER=votre_utilisateur_mariadb
   DB_PASSWORD=votre_mot_de_passe_secure
   DB_NAME=bal-liguge_adherents
   PORT=3000
   ```

5. **Installez les dépendances** :
   ```bash
   cd /votre/chemin/adhesions-api
   npm install
   ```

6. **Redémarrez l'application** via Plesk

#### Méthode B : SSH (si accès disponible)

```bash
# Connectez-vous en SSH
ssh user@host01.lrob.net

# Naviguez vers le répertoire Node.js
cd /var/www/adhesions-api/

# Copiez les fichiers
cp plesk-api/server.js .
cp plesk-api/package.json .
cp plesk-api/.env.example .env

# Éditez .env
nano .env

# Installez les dépendances
npm install

# Testez
npm start
```

### Étape 3️⃣ : Configurer le proxy sur Plesk

**Important** : Rendez l'API accessible publiquement.

1. **Via Plesk Interface** :
   - Domaines → Votre domaine → Web Hosting Settings
   - Vérifiez que l'application Node.js est active
   - L'URL sera : `https://host01.lrob.net/api` (ou votre domaine)

2. **Alternative avec Apache proxy** (si besoin) :
   ```apache
   ProxyPreserveHost On
   ProxyPass /api http://localhost:3000/api
   ProxyPassReverse /api http://localhost:3000/api
   ```

### Étape 4️⃣ : Déployer le frontend sur GitHub Pages

1. **Allez à** : https://github.com/simonmacias/Adhesions-BAL/settings/pages
2. **Source** : Deploy from branch → main (ou master)
3. **Branche** : `/root` (racine)
4. **Votre site** : https://simonmacias.github.io/Adhesions-BAL

### Étape 5️⃣ : Configurer l'URL API dans le frontend

**Dans le fichier `index.html`**, ligne ~57 :

```javascript
// Configuration API
const API_BASE_URL = 'https://host01.lrob.net/api'
// OU si votre domaine est configuré : const API_BASE_URL = 'https://votre-domaine.com/api'
```

Sauvegardez et l'application rechargera automatiquement depuis GitHub Pages.

## 🧪 Tests

### Vérifier que l'API répond

```bash
# Dans votre navigateur ou avec curl
curl https://host01.lrob.net/api/health

# Devrait répondre :
# {"status":"OK","message":"API opérationnelle"}
```

### Vérifier la connexion MariaDB

```bash
# Sur votre serveur SSH
mysql -u votre_utilisateur -p -e "SELECT COUNT(*) FROM bal-liguge_adherents.members;"
```

### Tester le frontend

1. Allez à `https://simonmacias.github.io/Adhesions-BAL`
2. Vérifiez l'indicateur de statut en haut à droite (🟢 Connectée ou 🔴 Déconnectée)
3. Testez l'ajout d'un adhérent

## 📁 Structure des fichiers

```
Adhesions-BAL/
├── index.html                 ← Frontend (GitHub Pages)
├── css/
│   └── style.css
├── database/
│   └── schema.sql             ← Schéma MariaDB
├── plesk-api/
│   ├── server.js              ← API Node.js
│   ├── package.json
│   └── .env.example
├── package.json
└── README.md
```

## 🔒 Sécurité

### À faire absolument

✅ Ne jamais commiter `.env` sur GitHub  
✅ Utiliser des identifiants forts pour MariaDB  
✅ Activer HTTPS (normalement auto sur Plesk)  
✅ Limiter les CORS aux domaines autorisés uniquement  

### Fichier .gitignore

```
.env
.env.local
node_modules/
.DS_Store
```

## 🚀 Optimisations

### 1. Activer le caching HTTP

Dans `server.js`, ajouter :
```javascript
app.set('etag', false)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})
```

### 2. Ajouter l'authentification (futur)

Si vous avez besoin de protéger l'API :
```javascript
app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    // Vérifier le token...
    next()
})
```

### 3. Pagination pour les listes longues

```javascript
// Dans server.js
app.get('/api/members?page=1&limit=50', ...)
```

## 📞 Troubleshooting

### ❌ Erreur : "API ne répond pas"

1. Vérifiez que l'application Node.js est active dans Plesk
2. Vérifiez les logs : Plesk → Applications Node.js → Logs
3. Vérifiez la connexion MariaDB : `mysql -u user -p`

### ❌ Erreur CORS

Vérifiez `index.html` ligne ~57, l'URL API doit être exacte.

### ❌ Erreur MariaDB "Access Denied"

1. Vérifiez les identifiants dans `.env`
2. Vérifiez que l'utilisateur MariaDB existe
3. Testez : `mysql -u user -p -h localhost -D bal-liguge_adherents`

### ❌ Le frontend ne voit pas les données

1. Ouvrez la console du navigateur (F12)
2. Cherchez les erreurs en rouge
3. Vérifiez l'onglet Network pour voir les requêtes API
4. Vérifiez que l'API répond : `curl https://host01.lrob.net/api/members`

## 📚 Ressources

- **Express.js** : https://expressjs.com/
- **mysql2** : https://github.com/sidorares/node-mysql2
- **GitHub Pages** : https://docs.github.com/pages
- **Plesk Docs** : https://docs.plesk.com/
- **MariaDB** : https://mariadb.com/kb/

## 🎯 Prochaines étapes

- [ ] Déployer le schéma MariaDB
- [ ] Créer l'application Node.js sur Plesk
- [ ] Tester la connexion API
- [ ] Configurer l'URL API dans index.html
- [ ] Pousser les changements sur GitHub
- [ ] Tester le frontend sur GitHub Pages
