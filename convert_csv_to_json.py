import csv
import json
from datetime import datetime
import uuid
import re

def clean_string(s):
    """Nettoie une chaîne de caractères"""
    if not s:
        return ""
    return str(s).strip()

def get_code_postal(ville):
    """Retourne le code postal en fonction de la ville"""
    ville = ville.lower().strip()
    codes_postaux = {
        'ligugé': '86240',
        'poitiers': '86000',
        'smarves': '86240',
        'saint-benoit': '86280',
        'saint benoit': '86280',
        'st benoit': '86280',
        'buxerolles': '86180',
        'iteuil': '86240',
        'fontaine': '86240',
        'roches premaries': '86340',
        'les roches premaries': '86340',
        'roches-premaries': '86340',
        'migne auxances': '86440',
        'migné auxances': '86440',
        'chateau larcher': '86370',
        'château larcher': '86370',
        'vivonne': '86370',
        'gencay': '86160',
        'gençay': '86160',
        'montamise': '86360',
        'montamisé': '86360',
        'nantes': '44000',
        'bordeaux': '33000',
        'paris': '75000',
        'bruxelles': '1000',
        'nimes': '30000',
        'alpe d\'huez': '38750',
        'cherves': '86170',
        'avanton': '86170',
        'beruges': '86190',
        'bonnes': '86300',
        'celle lesvecaux': '86600',
        'champagné saint hilaire': '86160',
        'dissay': '86130',
        'jaunay clan': '86130',
        'lezay': '79120',
        'loix': '17111',
        'lournand': '71250',
        'magné': '79460',
        'marçay': '86370',
        'marnay': '86160',
        'moncontour': '86330',
        'nouaillé maupertuis': '86340',
        'saint hilaire de riez': '85270',
        'saint jean d\'yriex': '16710',
        'saint-sauvant': '86600',
        'valdivienne': '86300'
    }
    
    for k, v in codes_postaux.items():
        if k in ville.lower():
            return v
    
    return '86240'  # Code postal par défaut (Ligugé)

def clean_ville(ville):
    """Nettoie et normalise le nom de la ville"""
    if not ville:
        return "Ligugé"
    
    ville = ville.strip()
    if ville.lower() in ['inconnu', 'unknown', '']:
        return "Ligugé"
        
    # Normalisation des noms de villes
    ville_normalisee = {
        'st benoit': 'Saint-Benoit',
        'st-benoit': 'Saint-Benoit',
        'saint benoit': 'Saint-Benoit',
        'migne auxances': 'Migné-Auxances',
        'migné auxances': 'Migné-Auxances',
        'chateau larcher': 'Château-Larcher',
        'roches premaries': 'Les Roches-Prémarie-Andillé',
        'les roches premaries': 'Les Roches-Prémarie-Andillé',
        'roches-premaries': 'Les Roches-Prémarie-Andillé',
        'celle lesvecaux': 'Celle-Lévescault',
        'champagné saint hilaire': 'Champagné-Saint-Hilaire',
        'nouaillé maupertuis': 'Nouaillé-Maupertuis',
        'saint hilaire de riez': 'Saint-Hilaire-de-Riez',
        'saint jean d\'yriex': 'Saint-Jean-d\'Yriex',
        'saint-sauvant': 'Saint-Sauvant',
        'alpe d\'huez': 'L\'Alpe d\'Huez'
    }
    
    ville_lower = ville.lower()
    for k, v in ville_normalisee.items():
        if k.lower() == ville_lower:
            return v
            
    # Si pas de correspondance, on retourne la ville avec la première lettre en majuscule
    return ville.capitalize()

def clean_date(date_str):
    """Convertit une date au format DD/MM/YY en année"""
    if not date_str:
        return ""
    try:
        # Si c'est déjà une année
        if len(str(date_str)) == 4:
            return str(date_str)
        # Format DD/MM/YY ou DD/MM/YYYY
        parts = date_str.split('/')
        if len(parts) == 3:
            return parts[2] if len(parts[2]) == 4 else ('19' + parts[2] if int(parts[2]) > 50 else '20' + parts[2])
        return ""
    except:
        return ""

def clean_genre(genre):
    """Nettoie le genre"""
    if not genre:
        return ""
    genre = str(genre).strip().upper()
    if genre in ['F', 'FEMME', 'FEMININE']:
        return 'F'
    elif genre in ['H', 'M', 'HOMME', 'MASCULIN']:
        return 'H'
    return ''

def clean_montant(montant):
    """Nettoie et convertit le montant en float"""
    try:
        if isinstance(montant, str):
            # Remplacer la virgule par un point
            montant = montant.replace(',', '.')
            # Supprimer tous les caractères non numériques sauf le point
            montant = re.sub(r'[^\d.]', '', montant)
        val = float(montant) if montant else 5.0
        return round(val, 2)
    except:
        return 5.00

def clean_formule(formule):
    """Nettoie et normalise la formule d'adhésion"""
    if not formule:
        return "J'adhère"
    
    formule = formule.lower().strip()
    formules_mapping = {
        "j'adhere": "J'adhère",
        "j'adhère": "J'adhère",
        "jadhere": "J'adhère",
        "jadhère": "J'adhère",
        "j'adore": "J'adore",
        "jadore": "J'adore",
        "j'accélère": "J'accélère",
        "j'accelere": "J'accélère",
        "jaccelere": "J'accélère",
        "jaccélère": "J'accélère",
        "passage": "Passage"
    }
    
    for k, v in formules_mapping.items():
        if k in formule:
            return v
            
    return "J'adhère"

def process_csv_to_json(input_csv, output_json):
    members = []
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    with open(input_csv, 'r', encoding='utf-8') as infile:
        # Skip les 2 premières lignes (en-tête et description)
        next(infile)
        next(infile)
        
        for row in csv.reader(infile):
            if not row or len(row) < 8 or not any(row):  # Skip empty rows
                continue
                
            # Extraire les données
            ville = clean_string(row[0])
            date_naissance = clean_date(row[1])
            nom_complet = clean_string(row[2])
            email = clean_string(row[3])
            telephone = clean_string(row[4])
            genre = clean_genre(row[5])
            enfants = int(clean_string(row[6]) or 0)
            montant = clean_montant(row[7])
            formule = clean_formule(row[8])
            
            if not nom_complet:  # Skip if no name
                continue
                
            # Séparer nom et prénom
            parts = nom_complet.split(' ')
            if len(parts) > 1:
                nom = parts[0].strip().upper()
                prenom = ' '.join(parts[1:]).strip().title()
            else:
                nom = nom_complet.strip().upper()
                prenom = ""
            
            # Créer l'historique
            historique = [{
                "date": "2025-01-01",
                "formule": formule,
                "montant": montant
            }]
            
            # Créer le membre
            member = {
                "id": str(uuid.uuid4()),
                "nom": nom,
                "prenom": prenom,
                "email": email,
                "datenaissance": int(date_naissance) if date_naissance.isdigit() else None,
                "genre": genre,
                "ville": ville,
                "codepostal": get_code_postal(ville),
                "telephone": telephone,
                "dateadhesion": "2025-01-01",
                "formuleadhesion": formule,
                "montantcotisation": montant,
                "enfants": enfants,
                "historique": historique,
                "created_at": current_date,
                "updated_at": current_date
            }
            
            members.append(member)
    
    # Créer la structure JSON finale
    json_data = {
        "period": {
            "start": "2025-01-01",
            "end": "2025-12-31"
        },
        "members": members
    }
    
    # Écrire le fichier JSON
    with open(output_json, 'w', encoding='utf-8') as outfile:
        json.dump(json_data, outfile, ensure_ascii=False, indent=2)
    
    print(f"\nConversion terminée. Fichier JSON créé : {output_json}")
    print(f"Nombre de membres exportés : {len(members)}")

# Utilisation
if __name__ == "__main__":
    input_csv = "TABLEAU ADHESION 2025.xlsx - adhérents(1).csv"
    output_json = "adherents_2025.json"
    process_csv_to_json(input_csv, output_json) 