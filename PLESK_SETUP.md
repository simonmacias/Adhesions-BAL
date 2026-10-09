# 🚀 Adhesions BAL - Architecture Plesk Complete

## Architecture

```
adherents.bal-liguge.fr
├── Frontend (index.html, css, js) ◄─ Servi par Express
├── API REST (Node.js/Express) ◄─── Gère la BDD
└── MariaDB (localhost:3306) ◄────── Données
```

## ⚡ Installation rapide

### 1️⃣ Préparer la base MariaDB

**Via phpMyAdmin** (`host01.lrob.net/phpMyAdmin`) :

1. Créez base de données :
```sql
CREATE DATABASE `bal-liguge_adherents` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Importez le schéma (`database/schema.sql`) dans phpMyAdmin

**Ou via SSH** :
```bash
mysql -u root -p < database/schema.sql
```

### 2️⃣ Configurer l'app Node.js sur Plesk

#### Via l'interface Plesk

1. **Domaines** → `bal-liguge.fr` → **Applications Node.js**
2. **Ajouter une application** :
   - **Nom** : adhesions
   - **Chemin** : `/adhesions` (ou `/` si c'est le domaine principal)
   - **Port** : 3000
   - **Démarrage** : `npm start`
   - **Node.js version** : 18+ LTS
   
3. **Téléchargez les fichiers** dans le répertoire de l'app :
   - `server/server.js`
   - `server/.env.example` → renommez en `.env` et remplissez-le
   - `package.json`
   - `index.html`
   - `css/style.css`
   - `database/` (dossier)

4. **Installez les dépendances** :
   ```bash
   npm install
   ```

5. **Créez le fichier `.env`** (IMPORTANT - À NE PAS COMMITER !) :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_password_mariadb
   DB_NAME=bal-liguge_adherents
   PORT=3000
   NODE_ENV=production
   ```

6. **Redémarrez l'app** via Plesk

#### Via SSH (si disponible)

```bash
ssh utilisateur@host01.lrob.net

# Naviguer au dossier
cd /var/www/adherents.bal-liguge.fr

# Copier les fichiers
scp -r /chemin/local/* utilisateur@host01.lrob.net:/var/www/adherents.bal-liguge.fr/

# Installer
npm install

# Tester
npm start
```

### 3️⃣ Configurer le proxy Plesk (si nécessaire)

Si l'app Node.js tourne sur le port 3000, Plesk doit la rendre accessible :

**Plesk Interface** → **Domaines** → **Paramètres d'hébergement Web**
- Vérifiez que **Applications Node.js** est activé
- Vérifiez l'URL : `https://adherents.bal-liguge.fr`

### 4️⃣ Tester

Ouvrez votre navigateur :
```
https://adherents.bal-liguge.fr
```

Vérifiez l'indicateur de statut en haut à droite : 
- 🟢 Connectée = tout fonctionne
- 🔴 Déconnectée = vérifiez les logs

## 🧪 Tests API

### Vérifier que l'API répond

```bash
curl https://adherents.bal-liguge.fr/api/health
# Réponse: {"status":"OK","timestamp":"..."}
```

### Lister les adhérents

```bash
curl https://adherents.bal-liguge.fr/api/members
```

### Créer un adhérent

```bash
curl -X POST https://adherents.bal-liguge.fr/api/members \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@example.com"}'
```

## 📁 Structure fichiers

```
/var/www/adherents.bal-liguge.fr/
├── index.html                 (Frontend)
├── css/
│   └── style.css
├── database/
│   └── schema.sql
├── server/
│   ├── server.js              (API)
│   └── .env                   (À créer - ne pas commiter)
├── package.json
├── package-lock.json
└── node_modules/              (Après npm install)
```

## 🔐 Sécurité

### À faire obligatoirement

✅ Créer un utilisateur MariaDB dédié (pas root)  
✅ Mettre le fichier `.env` en dehors du contrôle de version  
✅ Utiliser HTTPS (Plesk doit s'en charger)  
✅ Vérifier les permissions fichiers : `chmod 600 server/.env`  

### Créer un utilisateur MariaDB sécurisé

```sql
CREATE USER 'bal_user'@'localhost' IDENTIFIED BY 'password_secure_123';
GRANT ALL PRIVILEGES ON `bal-liguge_adherents`.* TO 'bal_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🐛 Dépannage

### ❌ "Cannot GET /"

L'app Node.js ne démarre pas. Vérifiez :
1. Plesk → Applications Node.js → Vérifiez le statut
2. Logs : Plesk → Applications Node.js → Logs
3. `.env` existe et est complet
4. `npm install` a été exécuté

### ❌ "API Déconnectée"

L'application frontend ne trouve pas l'API. Vérifiez :
1. Dans le navigateur, allez à `https://adherents.bal-liguge.fr/api/health`
2. Vérifiez la connexion MariaDB : `mysql -u root -p -D bal-liguge_adherents`
3. Vérifiez `.env` est bon

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:3306"

MariaDB n'est pas accessible. Vérifiez :
1. MariaDB tourne : `systemctl status mysql` ou `ps aux | grep mysql`
2. Identifiants dans `.env` sont corrects
3. Utilisateur MariaDB existe

### ❌ "Cannot find module 'express'"

Les dépendances ne sont pas installées :
```bash
cd /var/www/adherents.bal-liguge.fr/
npm install
```

## 📊 Logs

### Voir les logs live

```bash
# Via Plesk web interface
Domaines → adherents.bal-liguge.fr → Applications Node.js → Logs

# Ou via SSH
tail -f ~/.pm2/logs/adhesions-api-out.log
```

## 🚀 Améliorations futures

- [ ] Ajouter authentification
- [ ] Export/Import CSV
- [ ] Statistiques avancées
- [ ] Notifications email
- [ ] Backup auto MariaDB

## 📞 Support

- **Plesk Docs** : https://docs.plesk.com/
- **Express.js** : https://expressjs.com/
- **MariaDB** : https://mariadb.com/kb/
- **Node.js** : https://nodejs.org/docs/

## ✅ Checklist déploiement

- [ ] Base MariaDB créée
- [ ] Schéma importé
- [ ] App Node.js créée dans Plesk
- [ ] Fichiers copiés
- [ ] `npm install` exécuté
- [ ] `.env` configuré
- [ ] App redémarrée
- [ ] Frontend accessible : `https://adherents.bal-liguge.fr`
- [ ] Indicateur API = 🟢 Connectée
- [ ] Test créer adhérent fonctionne
