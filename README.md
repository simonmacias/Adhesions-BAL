# Gestion des Adhérents

Application web pour la gestion des adhérents d'une association, avec support pour l'import/export de données et des statistiques détaillées.

## Fonctionnalités

- ✨ Interface utilisateur moderne et intuitive
- 📊 Statistiques détaillées (graphiques, répartition géographique)
- 📥 Import de données (CSV, XLS, JSON)
- 📤 Export de données (CSV, XLS, JSON)
- 🔒 Gestion sécurisée des adhérents
- 📱 Interface responsive (mobile-friendly)

## Prérequis

- Node.js (v14 ou supérieur)
- Python 3.8+ (pour les scripts de conversion)
- Un compte Supabase (base de données)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-compte/gestion-adherents.git
cd gestion-adherents
```

2. Copiez le fichier de configuration :
```bash
cp .env.example .env
```

3. Modifiez le fichier `.env` avec vos paramètres :
- Ajoutez vos identifiants Supabase
- Configurez votre secret pour l'authentification
- Ajustez les autres paramètres selon vos besoins

4. Installez les dépendances Python (pour les scripts de conversion) :
```bash
pip install -r requirements.txt
```

## Configuration de la Base de Données

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Dans les paramètres du projet, récupérez :
   - L'URL du projet
   - La clé d'API (anon/public)
4. Ajoutez ces informations dans votre fichier `.env`

## Sécurité

L'application utilise plusieurs niveaux de sécurité :

1. **Authentification** : Seuls les utilisateurs authentifiés peuvent accéder à l'application
2. **Autorisation** : Différents niveaux d'accès selon les rôles (admin, utilisateur)
3. **Protection des données** : Les données sensibles ne sont jamais exposées publiquement

## Utilisation

1. Lancez l'application :
```bash
# En mode développement
npm run dev

# En production
npm start
```

2. Accédez à l'application dans votre navigateur :
```
http://localhost:3000
```

## Scripts de Conversion

### CSV vers JSON
```bash
python convert_csv_to_json.py input.csv output.json
```

### JSON vers CSV
```bash
python convert_json_to_csv.py input.json output.csv
```

## Déploiement

1. Construisez l'application :
```bash
npm run build
```

2. Les fichiers de production seront générés dans le dossier `dist/`

3. Déployez ces fichiers sur votre serveur web

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## Licence

MIT

## Support

Pour toute question ou problème :
1. Ouvrez une issue sur GitHub
2. Contactez l'équipe de maintenance 