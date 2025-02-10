import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const STORAGE_KEY = 'adherents_data'

const app = createApp({
    data() {
        return {
            members: [],
            statistics: [
                { label: 'Total Adhérents', value: 0 },
                { label: 'Cotisations à jour', value: 0 },
                { label: 'Nouveaux (2024)', value: 0 },
                { label: 'Taux renouvellement', value: '0%' }
            ],
            currentMember: null,
            modalInstance: null,
            formErrors: [],
            searchResults: [],
            similarMembers: [],
            villeSearch: '',
            showSuggestions: false,
            memberSuggestions: [],
            basicInfoModal: null,
            memberModal: null
        }
    },
    methods: {
        // Gestion des données
        loadData() {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                this.members = JSON.parse(stored)
                this.updateStatistics()
            }
        },
        saveData() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members))
            this.updateStatistics()
        },

        // Import/Export
        async handleXLSImport(event) {
            try {
                const file = event.target.files[0]
                if (!file) return

                const data = await file.arrayBuffer()
                const workbook = XLSX.read(data)
                
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)
                
                // Vérification des doublons
                const newMembers = jsonData.filter(member => {
                    const isDuplicate = this.members.some(existing => 
                        existing.nom.toLowerCase() === member.nom.toLowerCase() &&
                        existing.prenom.toLowerCase() === member.prenom.toLowerCase() &&
                        existing.dateNaissance === member.dateNaissance
                    )
                    return !isDuplicate
                })
                
                this.members = [...this.members, ...newMembers]
                this.saveData()
                alert(`${newMembers.length} nouveaux membres importés`)
                
                // Réinitialiser l'input file
                event.target.value = ''
            } catch (error) {
                alert('Erreur lors de l\'import XLS: ' + error.message)
            }
        },
        
        async handleJSONImport(event) {
            try {
                const file = event.target.files[0]
                if (!file) return

                const reader = new FileReader()
                
                reader.onload = (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result)
                        
                        // Vérifier si le JSON a la bonne structure
                        if (!jsonData.members || !Array.isArray(jsonData.members)) {
                            throw new Error('Format JSON invalide. Le fichier doit contenir une propriété "members" qui est un tableau.')
                        }
                        
                        // Vérification des doublons
                        const newMembers = jsonData.members.filter(member => {
                            const isDuplicate = this.members.some(existing => 
                                existing.nom.toLowerCase() === member.nom.toLowerCase() &&
                                existing.prenom.toLowerCase() === member.prenom.toLowerCase() &&
                                existing.dateNaissance === member.dateNaissance
                            )
                            return !isDuplicate
                        })
                        
                        // Ajouter les nouveaux membres
                        this.members = [...this.members, ...newMembers]
                        this.saveData()
                        alert(`${newMembers.length} nouveaux membres importés`)
                        
                    } catch (error) {
                        alert('Erreur lors du parsing JSON: ' + error.message)
                    }
                }
                
                reader.readAsText(file)
                
                // Réinitialiser l'input file
                event.target.value = ''
            } catch (error) {
                alert('Erreur lors de l\'import JSON: ' + error.message)
            }
        },
        
        exportData() {
            const worksheet = XLSX.utils.json_to_sheet(this.members)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Adhérents")
            
            const currentYear = new Date().getFullYear()
            XLSX.writeFile(workbook, `adherents_${currentYear}.xlsx`)
        },

        // Gestion des membres
        showAddModal() {
            // Réinitialiser les erreurs et les résultats de recherche
            this.formErrors = [];
            this.searchResults = [];
            this.similarMembers = [];
            
            this.currentMember = {
                id: null,
                nom: '',
                prenom: '',
                email: '',
                datenaissance: new Date().getFullYear() - 20,
                genre: '',
                ville: 'Ligugé',
                code_postal: '86240',
                coordinates: { lat: 46.5333, lon: 0.3 },
                telephone: '',
                dateadhesion: new Date().toISOString().split('T')[0],
                formuleadhesion: "J'adhère",
                montantcotisation: 5,
                enfants: 0,
                cotisationAJour: true,
                historique: []
            };
            this.villeSearch = 'Ligugé (86240)';
            this.modalInstance = new bootstrap.Modal(document.getElementById('memberModal'));
            this.modalInstance.show();
        },

        editMember(member) {
            this.currentMember = { ...member }
            this.modalInstance = new bootstrap.Modal(document.getElementById('memberModal'))
            this.modalInstance.show()
        },

        saveMember() {
            // Générer un ID unique si c'est un nouveau membre
            if (!this.currentMember.id) {
                this.currentMember.id = Date.now() + Math.random();
            }

            // S'assurer que les coordonnées sont présentes
            if (!this.currentMember.coordinates && this.currentMember.ville === 'Ligugé') {
                this.currentMember.coordinates = { lat: 46.5333, lon: 0.3 };
            }

            // S'assurer que l'historique est un tableau
            if (!Array.isArray(this.currentMember.historique)) {
                this.currentMember.historique = [];
            }

            // Ajouter l'adhésion actuelle à l'historique si ce n'est pas déjà fait
            const currentAdhesion = {
                date: this.currentMember.dateadhesion,
                formule: this.currentMember.formuleadhesion,
                montant: this.currentMember.montantcotisation
            };

            if (!this.currentMember.historique.some(h => 
                h.date === currentAdhesion.date && 
                h.formule === currentAdhesion.formule && 
                h.montant === currentAdhesion.montant)) {
                this.currentMember.historique.push(currentAdhesion);
            }

            // S'assurer que toutes les propriétés requises sont présentes
            const memberToSave = {
                ...this.currentMember,
                ville: this.currentMember.ville || 'Ligugé',
                code_postal: this.currentMember.code_postal || '86240',
                coordinates: this.currentMember.coordinates || { lat: 46.5333, lon: 0.3 },
                cotisationAJour: true
            };

            // Mettre à jour ou ajouter le membre dans la liste
            const index = this.members.findIndex(m => m.id === memberToSave.id);
            if (index === -1) {
                this.members.push({ ...memberToSave });
            } else {
                this.members[index] = { ...memberToSave };
            }

            // Sauvegarder les données
            this.saveData();
            this.modalInstance.hide();
        },

        deleteMember(member) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet adhérent ?')) {
                this.members = this.members.filter(m => m.id !== member.id)
                this.saveData()
            }
        },

        // Statistiques
        updateStatistics() {
            const currentYear = new Date().getFullYear()
            const totalMembers = this.members.length
            const upToDate = this.members.filter(m => m.cotisationAJour).length
            const newMembers = this.members.filter(m => {
                const adhesionYear = new Date(m.dateAdhesion).getFullYear()
                return adhesionYear === currentYear
            }).length
            
            const lastYearMembers = this.members.filter(m => {
                const adhesionYear = new Date(m.dateAdhesion).getFullYear()
                return adhesionYear === currentYear - 1
            }).length
            
            const renewalRate = lastYearMembers ? Math.round((newMembers / lastYearMembers) * 100) : 0

            this.statistics[0].value = totalMembers
            this.statistics[1].value = upToDate
            this.statistics[2].value = newMembers
            this.statistics[3].value = `${renewalRate}%`
        },

        // Normalisation des noms et prénoms
        normalizeString(str) {
            if (!str) return '';
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
                .replace(/[^a-z0-9]/g, '') // Garde uniquement les lettres et chiffres
                .trim(); // Supprime les espaces au début et à la fin
        },

        // Vérifie si un membre existe déjà
        checkExistingMember(nom, prenom) {
            const normalizedNom = this.normalizeString(nom);
            const normalizedPrenom = this.normalizeString(prenom);
            
            return this.members.find(member => 
                this.normalizeString(member.nom) === normalizedNom &&
                this.normalizeString(member.prenom) === normalizedPrenom
            );
        },

        // Recherche de membres existants
        searchMembers(searchTerm) {
            if (!searchTerm) {
                this.memberSuggestions = [];
                this.showSuggestions = false;
                return;
            }

            const normalizedSearch = this.normalizeString(searchTerm);
            this.memberSuggestions = this.members.filter(member => {
                const normalizedNom = this.normalizeString(member.nom);
                const normalizedPrenom = this.normalizeString(member.prenom);
                const fullName = normalizedNom + normalizedPrenom;
                return fullName.includes(normalizedSearch);
            }).slice(0, 5); // Limite à 5 suggestions

            this.showSuggestions = this.memberSuggestions.length > 0;
        },

        // Sélection d'un membre suggéré
        selectMember(member) {
            // Copier toutes les données du membre sélectionné
            this.currentMember = { ...member };
            this.villeSearch = member.ville && member.code_postal ? `${member.ville} (${member.code_postal})` : '';
            
            // Masquer la liste déroulante
            this.showSuggestions = false;
            this.memberSuggestions = [];
            
            // Mettre à jour le titre du modal pour indiquer qu'on est en mode édition
            const modalTitle = document.getElementById('memberModalLabel');
            if (modalTitle) {
                modalTitle.textContent = 'Modifier un adhérent';
            }
        },

        // Mise à jour lors de la saisie du nom ou prénom
        async onMemberInfoChange(field) {
            if (field !== 'nom') {
                return;
            }

            if (!this.currentMember[field]) {
                this.showSuggestions = false;
                this.memberSuggestions = [];
                return;
            }

            // Recherche de suggestions
            const searchTerm = this.currentMember[field];
            const normalizedSearch = this.normalizeString(searchTerm);
            
            this.memberSuggestions = this.members.filter(member => {
                const normalizedNom = this.normalizeString(member.nom);
                
                // Ne pas suggérer le membre en cours d'édition
                if (this.currentMember.id && member.id === this.currentMember.id) {
                    return false;
                }
                
                return normalizedNom.includes(normalizedSearch);
            }).slice(0, 5); // Limite à 5 suggestions

            this.showSuggestions = this.memberSuggestions.length > 0;

            // Vérification des doublons exacts
            if (this.currentMember.nom && this.currentMember.prenom) {
                const normalizedNewNom = this.normalizeString(this.currentMember.nom);
                const normalizedNewPrenom = this.normalizeString(this.currentMember.prenom);

                const existingMember = this.members.find(member => {
                    if (this.currentMember.id && member.id === this.currentMember.id) {
                        return false; // Ignorer le membre en cours d'édition
                    }
                    const normalizedExistingNom = this.normalizeString(member.nom);
                    const normalizedExistingPrenom = this.normalizeString(member.prenom);
                    return normalizedExistingNom === normalizedNewNom && 
                           normalizedExistingPrenom === normalizedNewPrenom;
                });

                if (existingMember) {
                    if (confirm(`Un membre avec ce nom existe déjà : ${existingMember.nom} ${existingMember.prenom}.\nVoulez-vous modifier son profil ?`)) {
                        this.selectMember(existingMember);
                        this.showSuggestions = false; // Masquer la liste après sélection
                    }
                }
            }
        },

        proceedToCotisation() {
            // Valider les informations de base
            this.formErrors = [];
            if (!this.currentMember.nom) {
                this.formErrors.push('Le nom est obligatoire');
            }
            if (!this.currentMember.prenom) {
                this.formErrors.push('Le prénom est obligatoire');
            }
            
            if (this.formErrors.length > 0) {
                return;
            }

            // Fermer le modal des informations de base
            this.basicInfoModal.hide();

            // Conserver les données existantes du membre
            const existingData = { ...this.currentMember };

            // Compléter les informations du membre pour la cotisation
            this.currentMember = {
                ...existingData,
                dateadhesion: new Date().toISOString().split('T')[0],
                formuleadhesion: existingData.formuleadhesion || "J'adhère",
                montantcotisation: existingData.montantcotisation || 5,
                enfants: existingData.enfants || 0,
                historique: existingData.historique || []
            };
            
            // Mettre à jour le champ de recherche de ville si une ville est définie
            this.villeSearch = this.currentMember.ville && this.currentMember.code_postal ? 
                `${this.currentMember.ville} (${this.currentMember.code_postal})` : 
                'Ligugé (86240)';

            // Ouvrir le modal de cotisation
            if (!this.memberModal) {
                this.memberModal = new bootstrap.Modal(document.getElementById('memberModal'));
            }
            this.memberModal.show();
        }
    },
    mounted() {
        this.loadData()
    }
})

app.mount('#app') 