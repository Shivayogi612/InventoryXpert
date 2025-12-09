// Simple Moving Average (SMA) demand forecasting utility
// Implements calculateDemandForecast(transactions, days = 7)
export function calculateDemandForecast(transactions = [], days = 7) {
  // transactions: array of { type, quantity, created_at }
  try {
    const now = new Date()
    const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // last 90 days

    // 1. Filter "out" transactions for last 90 days
    const outs = transactions
      .filter((t) => t && (t.type === 'out' || t.type === 'sold' || t.type === 'transfer_out'))
      .map((t) => ({
        date: new Date(t.created_at),
        qty: Math.abs(Number(t.quantity) || 0),
      }))
      .filter((t) => t.date >= cutoff)

    if (!outs.length) {
      // No history: return flat zeros with low confidence
      const result = Array.from({ length: days }).map((_, i) => {
        const d = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
        return {
          forecast_date: d.toISOString().slice(0, 10),
          forecasted_demand: 0,
          confidence_level: 0.5,
          model_version: 'sma-v1',
          factors: { reason: 'no_history' },
        }
      })
      return result
    }

    // 2. Group by date and sum quantities
    const dailyMap = {}
    outs.forEach((o) => {
      const key = o.date.toISOString().slice(0, 10)
      dailyMap[key] = (dailyMap[key] || 0) + o.qty
    })

    // Build series for last N days (use 90 days window)
    const series = []
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      series.push({ date: key, value: dailyMap[key] || 0 })
    }

    // helper for SMA
    const sma = (arr, window) => {
      const res = []
      for (let i = 0; i < arr.length; i++) {
        const start = Math.max(0, i - window + 1)
        const slice = arr.slice(start, i + 1)
        const avg = slice.reduce((s, x) => s + x, 0) / (slice.length || 1)
        res.push(Number(avg.toFixed(3)))
      }
      return res
    }

    // 3. Calculate 7-day, 14-day, 30-day SMA
    const values = series.map((s) => s.value)
    const sma7 = sma(values, 7)
    const sma14 = sma(values, 14)
    const sma30 = sma(values, 30)

    const latestSMA7 = sma7[sma7.length - 1] || 0
    const latestSMA14 = sma14[sma14.length - 1] || 0
    const latestSMA30 = sma30[sma30.length - 1] || 0

    // 4. Detect trend (compare SMAs)
    let trend = 'stable'
    if (latestSMA7 > latestSMA14 && latestSMA14 > latestSMA30) trend = 'increasing'
    else if (latestSMA7 < latestSMA14 && latestSMA14 < latestSMA30) trend = 'decreasing'

    // 5. Day-of-week seasonality: compute average by weekday
    const dowSums = Array(7).fill(0)
    const dowCounts = Array(7).fill(0)
    series.forEach((s) => {
      const d = new Date(s.date)
      const dow = d.getDay()
      dowSums[dow] += s.value
      dowCounts[dow] += 1
    })
    const dowAvg = dowSums.map((sum, i) => (dowCounts[i] ? sum / dowCounts[i] : 0))

    // 6. Generate forecast for next `days` days using weighted average of SMAs and seasonality
    const forecasts = []
    for (let i = 1; i <= days; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const dow = d.getDay()
      // base = avg of SMAs with weights favoring short window
      const base = (latestSMA7 * 0.6 + latestSMA14 * 0.3 + latestSMA30 * 0.1)
      const seasonal = dowAvg[dow] || 0
      // blend base and seasonal
      const forecastRaw = base * 0.7 + seasonal * 0.3
      // apply small trend multiplier
      const trendMultiplier = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1.0
      const forecastValue = Math.max(0, Math.round(forecastRaw * trendMultiplier))

      // 7. Confidence level
      // - variance in history: lower variance -> higher confidence
      const mean = values.reduce((s, v) => s + v, 0) / (values.length || 1)
      const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length || 1)
      const std = Math.sqrt(variance)
      // map std to confidence between 0.5 - 1.0 (higher std => lower confidence)
      const conf = Math.max(0.5, Math.min(1.0, 1 - Math.min(1, std / (mean + 1))))
      // penalize short history
      const historyFactor = Math.min(1, series.filter((s) => s.value > 0).length / 30)
      const confidence = Number((0.5 + conf * 0.5 * historyFactor).toFixed(2))

      forecasts.push({
        forecast_date: d.toISOString().slice(0, 10),
        forecasted_demand: forecastValue,
        confidence_level: confidence,
        model_version: 'sma-v1',
        factors: { trend, base: Math.round(base), seasonal: Math.round(seasonal) },
      })
    }

    return forecasts
  } catch (err) {
    console.error('Forecast error', err)
    const now = new Date()
    return Array.from({ length: days }).map((_, i) => ({ forecast_date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0,10), forecasted_demand: 0, confidence_level: 0.5, model_version: 'sma-v1', factors: { error: err.message } }))
  }
}

export default calculateDemandForecast
