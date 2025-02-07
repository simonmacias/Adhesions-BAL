import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = 'https://wetwafvvzwqtjmtfzmap.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndldHdhZnZ2endxdGptdGZ6bWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODM1NjEsImV4cCI6MjA1NDI1OTU2MX0.fuUDGoJgOIoAiaOyof1hCIEQpkmCJfm2Vt2KAkAg3Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

// Fonctions d'accès aux données
export const dataService = {
    // Charger tous les adhérents
    async loadMembers() {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('nom')
        
        if (error) throw error
        return data || []
    },

    // Sauvegarder un adhérent
    async saveMember(member) {
        // Préparer les données
        const memberData = {
            ...member,
            updated_at: new Date().toISOString()
        }

        if (member.id) {
            // Mise à jour
            const { data, error } = await supabase
                .from('members')
                .update(memberData)
                .eq('id', member.id)
                .select()
            
            if (error) throw error
            return data[0]
        } else {
            // Création
            memberData.created_at = new Date().toISOString()
            const { data, error } = await supabase
                .from('members')
                .insert([memberData])
                .select()
            
            if (error) throw error
            return data[0]
        }
    },

    // Supprimer un adhérent
    async deleteMember(id) {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id)
        
        if (error) throw error
    },

    // Rechercher des membres
    async searchMembers(query) {
        if (!query || query.length < 2) return []

        const { data, error } = await supabase
            .from('members')
            .select('*')
            .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(5)

        if (error) throw error
        return data || []
    },

    // Rechercher des villes (utilise l'API gouvernementale française)
    async searchVilles(query) {
        if (!query || query.length < 2) return []

        try {
            const response = await fetch(
                `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`
            )
            const data = await response.json()
            
            return data.features.map(feature => ({
                nom: feature.properties.city,
                code: feature.properties.postcode,
                coordinates: feature.geometry.coordinates
            }))
        } catch (error) {
            console.error('Erreur lors de la recherche de villes:', error)
            return []
        }
    },

    // Tester la connexion
    async testConnection() {
        try {
            const { data, error } = await supabase.from('members').select('count').single()
            if (error) throw error
            console.log('Connexion à Supabase réussie !')
            return true
        } catch (error) {
            console.error('Erreur de connexion à Supabase:', error)
            return false
        }
    },

    // Récupérer le hash d'authentification
    async getAuthHash() {
        try {
            const { data, error } = await supabase
                .from('config')
                .select('value')
                .eq('key', 'auth_hash')
                .single()
            
            if (error) throw error
            return data?.value || null
        } catch (error) {
            console.error('Erreur lors de la récupération du hash:', error)
            return null
        }
    }
} 