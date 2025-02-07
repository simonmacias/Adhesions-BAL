import json
import csv
from datetime import datetime

def format_montant(montant):
    """Formate le montant avec 2 décimales"""
    return f"{float(montant):.2f}"

def format_genre(genre, enfants):
    """Formate le genre et le nombre d'enfants"""
    if enfants > 0:
        return f"{genre}+{enfants} enfants"
    return genre

def process_json_to_csv(json_path, csv_path):
    # Lire le fichier JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Définir les en-têtes du CSV
    headers = [
        'id',
        'nom',
        'prenom',
        'email',
        'datenaissance',
        'genre',
        'ville',
        'code_postal',
        'telephone',
        'dateadhesion',
        'formuleadhesion',
        'montantcotisation',
        'enfants',
        'historique',
        'created_at',
        'updated_at'
    ]
    
    # Préparer les données pour le CSV
    rows = [headers]  # Ajouter les en-têtes comme première ligne
    
    # Traiter chaque membre
    for member in data['members']:
        # Vérifier et nettoyer les données obligatoires
        nom = member.get('nom', '').strip()
        prenom = member.get('prenom', '').strip()
        email = member.get('email', 'adresseinconnue@noway.com').strip()
        datenaissance = member.get('datenaissance', 2000)
        genre = member.get('genre', 'A').strip()  # A pour Autre si non spécifié
        ville = member.get('ville', 'Poitiers').strip()
        code_postal = member.get('codepostal', '86000').strip()
        telephone = member.get('telephone', '').strip()
        dateadhesion = member.get('dateadhesion', datetime.now().strftime('%Y-%m-%d'))
        formuleadhesion = member.get('formuleadhesion', "J'adhère").strip()
        montantcotisation = float(member.get('montantcotisation', 5))
        enfants = int(member.get('enfants', 0))
        
        # S'assurer que l'historique est une liste valide
        historique = member.get('historique', [])
        if not historique:
            historique = [{
                "date": dateadhesion,
                "formule": formuleadhesion,
                "montant": montantcotisation
            }]
        
        # Gérer les timestamps
        created_at = member.get('created_at', datetime.now().isoformat())
        updated_at = member.get('updated_at', created_at)
        
        # Vérifier que les champs obligatoires sont présents et non vides
        if not all([nom, prenom, email, datenaissance, genre, ville, code_postal, dateadhesion, formuleadhesion]):
            print(f"Membre ignoré car données incomplètes: {nom} {prenom}")
            continue
            
        row = [
            member.get('id', ''),
            nom,
            prenom,
            email,
            datenaissance,
            genre,
            ville,
            code_postal,
            telephone,
            dateadhesion,
            formuleadhesion,
            montantcotisation,
            enfants,
            json.dumps(historique, ensure_ascii=False),
            created_at,
            updated_at
        ]
        rows.append(row)
    
    # Écrire dans le fichier CSV
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print(f"Conversion terminée. {len(data['members'])} membres exportés vers {csv_path}")

# Utilisation
json_path = "adherents_2024-12-31_2025-02-04.json"
csv_path = "members_rows.csv"
process_json_to_csv(json_path, csv_path) 