import { useEffect, useState, useCallback } from 'react'
import { forecastService } from '../services/forecast.service'
import { cacheService } from '../services/cache.service'

const CACHE_KEY = 'demand_forecasts_session'

export function useDemandForecasts() {
  const [data, setData] = useState(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      // If not force and we have cache, just return it
      if (!force) {
        const cached = await cacheService.get('demand_forecasts')
        if (cached && cached.length) {
          setData(cached)
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached))
          setLoading(false)
          return cached
        }
      }

      // generate and save forecasts (server-side upsert)
      await forecastService.generateAndSave()
      const fresh = await forecastService.getAll()
      setData(fresh)
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(fresh || []))
      // also cache via cacheService for other hooks
      await cacheService.set('demand_forecasts', fresh || [])
      return fresh
    } catch (err) {
      console.error('useDemandForecasts refresh error', err)
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    if (!data) {
      refresh().catch(() => {})
    }
    return () => { mounted = false }
  }, [data, refresh])

  return { data, loading, error, refresh }
}

export default useDemandForecasts
