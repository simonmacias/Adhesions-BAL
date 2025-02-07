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
            modalInstance: null
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
            this.currentMember = {
                id: Date.now(),
                nom: '',
                prenom: '',
                email: '',
                dateAdhesion: new Date().toISOString().split('T')[0],
                cotisationAJour: true,
                ville: '',
                dateNaissance: '',
                telephone: '',
                genre: '',
                enfants: 0,
                historique: []
            }
            this.modalInstance = new bootstrap.Modal(document.getElementById('memberModal'))
            this.modalInstance.show()
        },

        editMember(member) {
            this.currentMember = { ...member }
            this.modalInstance = new bootstrap.Modal(document.getElementById('memberModal'))
            this.modalInstance.show()
        },

        saveMember() {
            const index = this.members.findIndex(m => m.id === this.currentMember.id)
            if (index === -1) {
                this.members.push(this.currentMember)
            } else {
                this.members[index] = this.currentMember
            }
            this.saveData()
            this.modalInstance.hide()
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
        }
    },
    mounted() {
        this.loadData()
    }
})

app.mount('#app') 