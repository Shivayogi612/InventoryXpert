import { supabase } from './supabase'

export const suppliersService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name', { ascending: true })
            if (error) throw error
            return data || []
        } catch (err) {
            console.error('Error fetching suppliers:', err)
            return []
        }
    },

    async getById(id) {
        try {
            if (!id) return null
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
                .single()
            if (error) throw error
            return data
        } catch (err) {
            console.error('Error fetching supplier by id:', err)
            return null
        }
    },

    async create(payload) {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .insert([payload])
                .select()
                .single()
            if (error) throw error
            return data
        } catch (err) {
            console.error('Error creating supplier:', err)
            throw err
        }
    },

    async update(id, payload) {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .update(payload)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data
        } catch (err) {
            console.error('Error updating supplier:', err)
            throw err
        }
    },

    async remove(id) {
        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id)
            if (error) throw error
            return true
        } catch (err) {
            console.error('Error deleting supplier:', err)
            throw err
        }
    }
}
