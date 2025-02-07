import csv
import json
from datetime import datetime

def clean_string(s):
    """Nettoie une chaîne de caractères"""
    if not s:
        return ""
    return str(s).strip()

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
            montant = montant.replace(',', '.')
            montant = ''.join(c for c in montant if c.isdigit() or c == '.')
        return float(montant) if montant else 5.0
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
    
    with open(input_csv, 'r', encoding='utf-8') as infile:
        # Skip les 3 premières lignes (en-tête et description)
        next(infile)
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
            montant = clean_montant(row[6])
            formule = clean_formule(row[7])
            
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
                "date": "2023-01-01",
                "formule": formule,
                "montant": montant
            }]
            
            # Créer le membre
            member = {
                'nom': nom,
                'prenom': prenom,
                'email': email,
                'datenaissance': date_naissance,
                'genre': genre,
                'ville': ville,
                'telephone': telephone,
                'dateadhesion': "2023-01-01",
                'formuleadhesion': formule,
                'montantcotisation': montant,
                'enfants': 0,
                'historique': historique
            }
            
            members.append(member)
    
    # Créer la structure JSON finale
    json_data = {
        'members': members
    }
    
    # Écrire le fichier JSON
    with open(output_json, 'w', encoding='utf-8') as outfile:
        json.dump(json_data, outfile, ensure_ascii=False, indent=2)
    
    print(f"\nConversion terminée. Fichier JSON créé : {output_json}")
    print(f"Nombre de membres exportés : {len(members)}")

# Utilisation
input_csv = "TABLEAU ADHÉSION 2023 - Feuille 1(1).csv"
output_json = "adherents_2023.json"
process_csv_to_json(input_csv, output_json) 