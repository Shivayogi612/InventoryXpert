import { supabase } from './supabase'

export const alertsService = {
  async getActiveAlerts() {
    try {
      console.time('alertsService.getActiveAlerts')
      console.log('Alerts service: Attempting to fetch active alerts')
      const { data, error, count } = await supabase
        .from('alerts')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      console.log('Alerts service response:', { data, error, count })
      console.timeEnd('alertsService.getActiveAlerts')
      if (error) {
        console.error('Alerts service error:', error)
        throw error
      }
      console.log(`Alerts service: Successfully fetched ${data.length} alerts`)
      return data
    } catch (err) {
      console.error('Error fetching alerts:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
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
  async dismissAlert(id, dismissedBy) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          status: 'dismissed',
          resolved_at: new Date().toISOString(),
          acknowledged_by: dismissedBy
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error dismissing alert:', err)
      return null
    }
  },

  async resolveAlert(id, resolvedBy) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          acknowledged_by: resolvedBy
        })
        .eq('id', id)
        .select()
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