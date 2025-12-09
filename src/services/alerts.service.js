import { supabase } from './supabase'

export const alertsService = {
  async getActiveAlerts() {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching alerts:', err)
      return []
    }
  },

  async acknowledgeAlert(id, acknowledgedBy) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'acknowledged', acknowledged_by: acknowledgedBy, acknowledged_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error acknowledging alert:', err)
      return null
    }
  },
  async dismissAlert(id) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'dismissed', resolved_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error dismissing alert:', err)
      return null
    }
  },

  async resolveAlert(id) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error resolving alert:', err)
      return null
    }
  },

  async createAlert(payload) {
    try {
      const now = new Date().toISOString()
      const row = {
        ...payload,
        status: payload.status || 'active',
        created_at: payload.created_at || now,
      }
      const { data, error } = await supabase.from('alerts').insert([row]).select().single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating alert:', err)
      throw err
    }
  },
  subscribeToAlerts(callback) {
    try {
      const channel = supabase
        .channel('realtime:alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => callback('INSERT', payload.new))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts' }, (payload) => callback('UPDATE', payload.new))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'alerts' }, (payload) => callback('DELETE', payload.old))
        .subscribe()
      return channel
    } catch (err) {
      console.error('subscribeToAlerts error', err)
      return null
    }
  }
}
