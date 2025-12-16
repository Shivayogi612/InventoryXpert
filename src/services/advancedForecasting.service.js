import { supabase } from './supabase'
import { transactionsService } from './transactions.service'
import { productsService } from './products.service'

// Simple Moving Average Model
export function simpleMovingAverageModel(transactions = [], days = 30, window = 7) {
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
      return Array.from({ length: days }).map((_, i) => {
        const d = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
        return {
          forecast_date: d.toISOString().slice(0, 10),
          forecasted_demand: 0,
          confidence_level: 0.5,
          model_version: 'sma-v1',
          factors: { reason: 'no_history' },
        }
      })
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
    const sma = (arr, windowSize) => {
      const res = []
      for (let i = 0; i < arr.length; i++) {
        const start = Math.max(0, i - windowSize + 1)
        const slice = arr.slice(start, i + 1)
        const avg = slice.reduce((s, x) => s + x, 0) / (slice.length || 1)
        res.push(Number(avg.toFixed(3)))
      }
      return res
    }

    // 3. Calculate SMA with specified window
    const values = series.map((s) => s.value)
    const smaValues = sma(values, window)
    const latestSMA = smaValues[smaValues.length - 1] || 0

    // 4. Generate forecast for next `days` days
    const forecasts = []
    for (let i = 1; i <= days; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const forecastValue = Math.max(0, Math.round(latestSMA))

      // Confidence level based on variance
      const mean = values.reduce((s, v) => s + v, 0) / (values.length || 1)
      const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length || 1)
      const std = Math.sqrt(variance)
      const conf = Math.max(0.5, Math.min(1.0, 1 - Math.min(1, std / (mean + 1))))
      const historyFactor = Math.min(1, series.filter((s) => s.value > 0).length / 30)
      const confidence = Number((0.5 + conf * 0.5 * historyFactor).toFixed(2))

      forecasts.push({
        forecast_date: d.toISOString().slice(0, 10),
        forecasted_demand: forecastValue,
        confidence_level: confidence,
        model_version: `sma-${window}d`,
        factors: { window, base: Math.round(latestSMA) },
      })
    }

    return forecasts
  } catch (err) {
    console.error('SMA Forecast error', err)
    const now = new Date()
    return Array.from({ length: days }).map((_, i) => ({ 
      forecast_date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0,10), 
      forecasted_demand: 0, 
      confidence_level: 0.5, 
      model_version: `sma-${window}d`, 
      factors: { error: err.message } 
    }))
  }
}

// Seasonal Model (Monthly/Weekly)
export function seasonalModel(transactions = [], days = 30, seasonType = 'weekly') {
  try {
    const now = new Date()
    const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // last year

    // 1. Filter "out" transactions
    const outs = transactions
      .filter((t) => t && (t.type === 'out' || t.type === 'sold' || t.type === 'transfer_out'))
      .map((t) => ({
        date: new Date(t.created_at),
        qty: Math.abs(Number(t.quantity) || 0),
      }))
      .filter((t) => t.date >= cutoff)

    if (!outs.length) {
      return Array.from({ length: days }).map((_, i) => {
        const d = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
        return {
          forecast_date: d.toISOString().slice(0, 10),
          forecasted_demand: 0,
          confidence_level: 0.5,
          model_version: `seasonal-${seasonType}`,
          factors: { reason: 'no_history' },
        }
      })
    }

    // 2. Group by date and sum quantities
    const dailyMap = {}
    outs.forEach((o) => {
      const key = o.date.toISOString().slice(0, 10)
      dailyMap[key] = (dailyMap[key] || 0) + o.qty
    })

    // 3. Calculate seasonal patterns
    const seasonalPatterns = {}
    
    if (seasonType === 'weekly') {
      // Weekly pattern: average by day of week
      const dowSums = Array(7).fill(0)
      const dowCounts = Array(7).fill(0)
      
      Object.keys(dailyMap).forEach(dateStr => {
        const date = new Date(dateStr)
        const dow = date.getDay()
        dowSums[dow] += dailyMap[dateStr]
        dowCounts[dow] += 1
      })
      
      for (let i = 0; i < 7; i++) {
        seasonalPatterns[i] = dowCounts[i] ? dowSums[i] / dowCounts[i] : 0
      }
    } else if (seasonType === 'monthly') {
      // Monthly pattern: average by day of month
      const domSums = Array(31).fill(0)
      const domCounts = Array(31).fill(0)
      
      Object.keys(dailyMap).forEach(dateStr => {
        const date = new Date(dateStr)
        const dom = date.getDate() - 1 // 0-30
        domSums[dom] += dailyMap[dateStr]
        domCounts[dom] += 1
      })
      
      for (let i = 0; i < 31; i++) {
        seasonalPatterns[i] = domCounts[i] ? domSums[i] / domCounts[i] : 0
      }
    }

    // 4. Calculate baseline trend
    const series = Object.keys(dailyMap).map(date => ({
      date,
      value: dailyMap[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Simple linear trend
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
    series.forEach((point, i) => {
      sumX += i
      sumY += point.value
      sumXY += i * point.value
      sumXX += i * i
    })

    const n = series.length
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // 5. Generate forecasts
    const forecasts = []
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const futureIndex = series.length + i - 1
      
      // Trend component
      const trendValue = Math.max(0, slope * futureIndex + intercept)
      
      // Seasonal component
      let seasonalMultiplier = 1
      if (seasonType === 'weekly') {
        const dow = futureDate.getDay()
        const avg = Object.values(seasonalPatterns).reduce((sum, val) => sum + val, 0) / 7
        seasonalMultiplier = avg > 0 ? seasonalPatterns[dow] / avg : 1
      } else if (seasonType === 'monthly') {
        const dom = futureDate.getDate() - 1
        const avg = Object.values(seasonalPatterns).reduce((sum, val) => sum + val, 0) / 31
        seasonalMultiplier = avg > 0 ? seasonalPatterns[dom] / avg : 1
      }
      
      const forecastValue = Math.max(0, Math.round(trendValue * seasonalMultiplier))
      
      // Confidence (simplified)
      const confidence = Math.max(0.6, Math.min(1.0, 1 - Math.abs(slope) / (Math.abs(slope) + 10)))

      forecasts.push({
        forecast_date: futureDate.toISOString().slice(0, 10),
        forecasted_demand: forecastValue,
        confidence_level: confidence,
        model_version: `seasonal-${seasonType}`,
        factors: { trend: Math.round(trendValue), seasonal: seasonalMultiplier.toFixed(2) },
      })
    }

    return forecasts
  } catch (err) {
    console.error('Seasonal Forecast error', err)
    const now = new Date()
    return Array.from({ length: days }).map((_, i) => ({ 
      forecast_date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0,10), 
      forecasted_demand: 0, 
      confidence_level: 0.5, 
      model_version: `seasonal-${seasonType}`, 
      factors: { error: err.message } 
    }))
  }
}
// Promotion-aware Model
export function promotionAwareModel(transactions = [], days = 30, promotions = []) {
  try {
    const now = new Date()
    const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) // last 180 days

    // 1. Filter "out" transactions
    const outs = transactions
      .filter((t) => t && (t.type === 'out' || t.type === 'sold' || t.type === 'transfer_out'))
      .map((t) => ({
        date: new Date(t.created_at),
        qty: Math.abs(Number(t.quantity) || 0),
      }))
      .filter((t) => t.date >= cutoff)

    if (!outs.length) {
      return Array.from({ length: days }).map((_, i) => {
        const d = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
        return {
          forecast_date: d.toISOString().slice(0, 10),
          forecasted_demand: 0,
          confidence_level: 0.5,
          model_version: 'promotion-aware',
          factors: { reason: 'no_history' },
        }
      })
    }

    // 2. Identify promotion periods and lift factors
    const promotionPeriods = []
    if (promotions && promotions.length > 0) {
      promotions.forEach(promo => {
        const startDate = new Date(promo.start_date)
        const endDate = new Date(promo.end_date)
        promotionPeriods.push({ startDate, endDate, lift: promo.expected_lift || 1.5 })
      })
    }

    // 3. Calculate baseline demand (non-promotion periods)
    const nonPromoSales = []
    const dailyMap = {}
    
    outs.forEach(o => {
      const dateStr = o.date.toISOString().slice(0, 10)
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + o.qty
      
      // Check if this date was during a promotion
      let isPromoDay = false
      for (const promo of promotionPeriods) {
        if (o.date >= promo.startDate && o.date <= promo.endDate) {
          isPromoDay = true
          break
        }
      }
      
      if (!isPromoDay) {
        nonPromoSales.push(o.qty)
      }
    })

    // 4. Calculate baseline average
    const baselineAvg = nonPromoSales.length > 0 
      ? nonPromoSales.reduce((sum, qty) => sum + qty, 0) / nonPromoSales.length
      : Object.values(dailyMap).reduce((sum, qty) => sum + qty, 0) / Object.keys(dailyMap).length

    // 5. Generate forecasts
    const forecasts = []
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = futureDate.toISOString().slice(0, 10)
      
      // Check if future date falls in a promotion period
      let multiplier = 1
      for (const promo of promotionPeriods) {
        if (futureDate >= promo.startDate && futureDate <= promo.endDate) {
          multiplier = promo.lift
          break
        }
      }
      
      const forecastValue = Math.max(0, Math.round(baselineAvg * multiplier))
      
      // Confidence (higher for known promotions, lower for predictions)
      const isKnownPromo = multiplier !== 1
      const confidence = isKnownPromo ? 0.9 : 0.7

      forecasts.push({
        forecast_date: dateStr,
        forecasted_demand: forecastValue,
        confidence_level: confidence,
        model_version: 'promotion-aware',
        factors: { baseline: Math.round(baselineAvg), promotion_multiplier: multiplier },
      })
    }

    return forecasts
  } catch (err) {
    console.error('Promotion-aware Forecast error', err)
    const now = new Date()
    return Array.from({ length: days }).map((_, i) => ({ 
      forecast_date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0,10), 
      forecasted_demand: 0, 
      confidence_level: 0.5, 
      model_version: 'promotion-aware', 
      factors: { error: err.message } 
    }))
  }
}

// Dynamic Safety Stock Calculation
export function calculateDynamicSafetyStock(forecastData, leadTimeDays = 7, serviceLevel = 0.95) {
  try {
    if (!forecastData || forecastData.length === 0) {
      return {
        safety_stock: 0,
        reorder_point: 0,
        explanation: 'No forecast data available'
      }
    }

    // Calculate forecast average and standard deviation
    const demands = forecastData.map(f => f.forecasted_demand)
    const avgDemand = demands.reduce((sum, d) => sum + d, 0) / demands.length
    
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / demands.length
    const stdDev = Math.sqrt(variance)
    
    // Simple service level factor (Z-score approximation)
    const zScore = serviceLevel >= 0.99 ? 2.33 : 
                  serviceLevel >= 0.95 ? 1.645 : 
                  serviceLevel >= 0.90 ? 1.28 : 1.0
    
    // Safety stock = Z × σ × √(Lead Time)
    const safetyStock = Math.ceil(zScore * stdDev * Math.sqrt(leadTimeDays))
    
    // Reorder point = Average Daily Demand × Lead Time + Safety Stock
    const avgDailyDemand = avgDemand
    const reorderPoint = Math.ceil(avgDailyDemand * leadTimeDays + safetyStock)
    
    return {
      safety_stock: safetyStock,
      reorder_point: reorderPoint,
      avg_daily_demand: avgDailyDemand,
      lead_time_days: leadTimeDays,
      service_level: serviceLevel,
      explanation: `Based on ${forecastData.length}-day forecast with ${Math.round(avgDemand)} avg daily demand and ${Math.round(stdDev)} std dev`
    }
  } catch (err) {
    console.error('Safety Stock calculation error', err)
    return {
      safety_stock: 0,
      reorder_point: 0,
      explanation: `Calculation error: ${err.message}`
    }
  }
}

// Scenario Planning Calculator
export function calculateScenarioImpact(currentForecast, growthPercentage) {
  try {
    if (!currentForecast || currentForecast.length === 0) {
      return []
    }
    
    const adjustedForecasts = currentForecast.map(forecast => {
      const adjustedDemand = Math.round(forecast.forecasted_demand * (1 + growthPercentage / 100))
      return {
        ...forecast,
        original_demand: forecast.forecasted_demand,
        adjusted_demand: adjustedDemand,
        difference: adjustedDemand - forecast.forecasted_demand
      }
    })
    
    // Calculate total impact
    const originalTotal = adjustedForecasts.reduce((sum, f) => sum + f.original_demand, 0)
    const adjustedTotal = adjustedForecasts.reduce((sum, f) => sum + f.adjusted_demand, 0)
    
    return {
      forecasts: adjustedForecasts,
      original_total: originalTotal,
      adjusted_total: adjustedTotal,
      difference_total: adjustedTotal - originalTotal,
      growth_percentage: growthPercentage
    }
  } catch (err) {
    console.error('Scenario calculation error', err)
    return {
      forecasts: [],
      original_total: 0,
      adjusted_total: 0,
      difference_total: 0,
      growth_percentage: growthPercentage,
      error: err.message
    }
  }
}

// Main service functions
export const advancedForecastingService = {
  async generateForecastByModel(productId, modelType, params = {}) {
    try {
      const transactions = await transactionsService.getByProduct(productId, 180)
      
      switch (modelType) {
        case 'sma':
          return simpleMovingAverageModel(transactions, params.days || 30, params.window || 7)
        case 'seasonal':
          return seasonalModel(transactions, params.days || 30, params.seasonType || 'weekly')
        case 'promotion':
          return promotionAwareModel(transactions, params.days || 30, params.promotions || [])
        default:
          return simpleMovingAverageModel(transactions, params.days || 30, 7)
      }
    } catch (err) {
      console.error('Advanced forecast generation error', err)
      throw err
    }
  },
  
  calculateDynamicSafetyStock,
  calculateScenarioImpact
}
export default advancedForecastingService