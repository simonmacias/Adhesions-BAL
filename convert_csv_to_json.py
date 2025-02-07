import csv
import json
from datetime import datetime
import uuid
import re

def clean_string(s):
    """Nettoie une chaîne de caractères basique"""
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
    """Nettoie la date de naissance"""
    if not date_str or date_str.lower() in ['inconnu', 'unknown']:
        return "1900"
    try:
        # Nettoyer la chaîne
        date_str = str(date_str).strip()
        # Si c'est déjà une année
        if len(str(date_str)) == 4:
            return str(date_str)
        # Si c'est au format DD/MM/YY ou DD/MM/YYYY
        parts = date_str.split('/')
        if len(parts) == 3:
            year = parts[2]
            if len(year) == 2:
                year = '19' + year if int(year) > 50 else '20' + year
            return year
        return "1900"
    except:
        return "1900"

def clean_genre(genre):
    """Nettoie le genre"""
    if not genre:
        return 'A'
    genre = str(genre).strip().upper()
    if genre in ['F', 'FEMME', 'FEMININE']:
        return 'F'
    elif genre in ['H', 'M', 'HOMME', 'MASCULIN']:
        return 'H'
    return 'A'

def clean_montant(montant):
    """Nettoie et convertit le montant en float"""
    try:
        if isinstance(montant, str):
            montant = montant.replace(',', '.')
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

def is_same_person(member1, member2):
    """Compare deux membres pour déterminer s'il s'agit de la même personne"""
    # Comparaison du nom et prénom (insensible à la casse)
    if member1['nom'].lower() == member2['nom'].lower() and member1['prenom'].lower() == member2['prenom'].lower():
        return True
    
    # Si l'email est renseigné et identique
    if member1.get('email') and member2.get('email') and member1['email'].lower() == member2['email'].lower():
        return True
    
    # Si le téléphone est renseigné et identique
    if member1.get('telephone') and member2.get('telephone') and member1['telephone'] == member2['telephone']:
        return True
    
    return False

def merge_member_data(existing_member, new_member_data):
    """Fusionne les données d'un membre existant avec les nouvelles données"""
    # Conserver l'historique existant
    historique = existing_member.get('historique', [])
    
    # Ajouter la nouvelle adhésion à l'historique si elle n'existe pas déjà
    new_adhesion = new_member_data['historique'][0]
    if not any(h['date'] == new_adhesion['date'] for h in historique):
        historique.append(new_adhesion)
    
    # Trier l'historique par date
    historique.sort(key=lambda x: x['date'])
    
    # Mettre à jour les informations du membre
    updated_member = existing_member.copy()
    updated_member.update({
        'email': new_member_data['email'] if new_member_data['email'] and '@noway.com' not in new_member_data['email'] else existing_member['email'],
        'telephone': new_member_data['telephone'] if new_member_data['telephone'] else existing_member['telephone'],
        'ville': new_member_data['ville'],
        'code_postal': new_member_data['code_postal'],
        'formuleadhesion': new_member_data['formuleadhesion'],
        'montantcotisation': new_member_data['montantcotisation'],
        'historique': historique
    })
    
    return updated_member

def process_csv_to_json(input_csv, output_json, existing_json=None):
    current_date = "2024-01-01"  # Date fixe pour 2024
    
    # Charger les membres existants si un fichier est fourni
    existing_members = []
    if existing_json:
        try:
            with open(existing_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
                existing_members = data.get('members', [])
        except FileNotFoundError:
            print(f"Le fichier {existing_json} n'existe pas. Un nouveau fichier sera créé.")
        except json.JSONDecodeError:
            print(f"Erreur de lecture du fichier {existing_json}. Un nouveau fichier sera créé.")
    
    # Liste pour stocker les nouveaux membres
    new_members = []
    updated_members = existing_members.copy()
    
    with open(input_csv, 'r', encoding='utf-8') as infile:
        next(infile)  # Skip header
        next(infile)  # Skip header
        
        for row in csv.reader(infile):
            if not row or len(row) < 8 or not any(row):  # Skip empty rows
                continue
                
            # Extraire et nettoyer les données de base
            ville_brute = clean_string(row[0])
            ville = clean_ville(ville_brute)
            code_postal = get_code_postal(ville_brute)
            
            nom_complet = clean_string(row[2])
            if not nom_complet:
                continue
                
            # Gestion spéciale des noms composés
            parts = nom_complet.split(' ')
            if len(parts) > 2:
                # Cas spéciaux pour les noms composés
                if parts[0].lower() in ['de', 'du', 'des', 'le', 'la', 'von', 'van']:
                    nom = f"{parts[0]} {parts[1]}".upper()
                    prenom = ' '.join(parts[2:]).strip().title()
                else:
                    nom = parts[0].upper()
                    prenom = ' '.join(parts[1:]).strip().title()
            else:
                nom = parts[0].strip().upper()
                prenom = parts[1].strip().title() if len(parts) > 1 else ""
            
            if not nom:  # Skip if no name
                continue
            
            email = clean_string(row[3])
            telephone = clean_string(row[4])
            genre = clean_genre(row[5])
            montant = clean_montant(row[7])
            formule = clean_formule(row[8]) if len(row) > 8 else "J'adhère"
            date_naissance = clean_date(row[1])
            
            # Créer le membre
            new_member = {
                'nom': nom,
                'prenom': prenom,
                'email': email or f"{nom.lower()}.{prenom.lower()}@noway.com",
                'datenaissance': date_naissance,
                'genre': genre,
                'ville': ville,
                'code_postal': code_postal,
                'telephone': telephone,
                'dateadhesion': current_date,
                'formuleadhesion': formule,
                'montantcotisation': montant,
                'enfants': 0,
                'historique': [{
                    "date": current_date,
                    "formule": formule,
                    "montant": montant
                }]
            }
            
            # Vérifier si le membre existe déjà
            found = False
            for i, existing_member in enumerate(updated_members):
                if is_same_person(existing_member, new_member):
                    # Mettre à jour le membre existant
                    updated_members[i] = merge_member_data(existing_member, new_member)
                    found = True
                    break
            
            # Si le membre n'existe pas, l'ajouter à la liste
            if not found:
                new_members.append(new_member)
    
    # Fusionner les listes de membres
    final_members = updated_members + new_members
    
    # Créer la structure JSON finale
    json_data = {
        'members': final_members
    }
    
    # Écrire le fichier JSON
    with open(output_json, 'w', encoding='utf-8') as outfile:
        json.dump(json_data, outfile, ensure_ascii=False, indent=2)
    
    print(f"\nConversion terminée. Fichier JSON créé : {output_json}")
    print(f"Nombre de membres existants mis à jour : {len(updated_members) - len(existing_members)}")
    print(f"Nombre de nouveaux membres ajoutés : {len(new_members)}")
    print(f"Nombre total de membres : {len(final_members)}")

# Utilisation
if __name__ == "__main__":
    input_csv = "TABLEAU ADHESION 2024 - adhérents(4).csv"
    output_json = "adherents_2024.json"
    existing_json = "adherents_2024.json"  # Fichier JSON existant (optionnel)
    process_csv_to_json(input_csv, output_json, existing_json) 