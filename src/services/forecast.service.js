import { supabase } from './supabase'
import calculateDemandForecast from '../utils/mlAlgorithms'
import { transactionsService } from './transactions.service'
import { productsService } from './products.service'

export const forecastService = {
  // Generate forecasts for all active products and upsert into `demand_forecasts`
  async generateAndSave({ lookbackDays = 180, periods = ['7d', '30d'] } = {}) {
    try {
      const products = await productsService.getAll()
      const active = (products || []).filter((p) => p.is_active !== false)
      const results = []

      for (const p of active) {
        // fetch transactions for product (last lookbackDays)
        const txns = await transactionsService.getByProduct(p.id, lookbackDays)
        // only use out transactions
        // calculate 30-day forecast series (daily)
        const forecasts30 = calculateDemandForecast(txns || [], 30)
        const forecast7 = forecasts30.slice(0, 7).reduce((s, x) => s + (Number(x.forecasted_demand) || 0), 0)
        const forecast30 = forecasts30.slice(0, 30).reduce((s, x) => s + (Number(x.forecasted_demand) || 0), 0)
        const confidence = (forecasts30.length ? (forecasts30.reduce((s, x) => s + (Number(x.confidence_level) || 0), 0) / forecasts30.length) : 0.5)

        results.push({ product_id: p.id, period: '7d', forecast_units: Math.round(forecast7), confidence: Number(confidence.toFixed(2)) })
        results.push({ product_id: p.id, period: '30d', forecast_units: Math.round(forecast30), confidence: Number(confidence.toFixed(2)) })
      }

      // Upsert results into demand_forecasts table
      // We prepare rows and use upsert with ON CONFLICT idx_demand_forecasts_product_period
      const rows = results.map((r) => ({ product_id: r.product_id, forecast_period: r.period, forecast_units: r.forecast_units, confidence: r.confidence, updated_at: new Date().toISOString() }))
      if (rows.length) {
        try {
          const { data, error } = await supabase.from('demand_forecasts').upsert(rows, { onConflict: 'product_id,forecast_period', returning: 'representation' })
          if (error) throw error
          return data
        } catch (upsertErr) {
          console.warn('Upsert to demand_forecasts failed, attempting fallback without confidence column:', upsertErr?.message || upsertErr)
          // If the DB/schema doesn't have the 'confidence' column (common when migration wasn't applied), retry without that field
          const missingConfidence = String(upsertErr?.message || '').toLowerCase().includes("could not find the 'confidence' column") || String(upsertErr?.message || '').toLowerCase().includes('pgrst204')
          if (missingConfidence) {
            const rowsNoConfidence = rows.map(r => ({ product_id: r.product_id, forecast_period: r.forecast_period, forecast_units: r.forecast_units, updated_at: r.updated_at }))
            const { data: data2, error: error2 } = await supabase.from('demand_forecasts').upsert(rowsNoConfidence, { onConflict: 'product_id,forecast_period', returning: 'representation' })
            if (error2) throw error2
            return data2
          }
          throw upsertErr
        }
      }
      return []
    } catch (err) {
      console.error('Forecast generation error', err)
      throw err
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase.from('demand_forecasts').select('*')
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching demand_forecasts', err)
      return []
    }
  }
}

export default forecastService
