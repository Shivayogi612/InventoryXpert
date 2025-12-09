import { useState, useEffect } from 'react'
import { getProductDemandInsight } from '../services/demandInsight.service'

const CACHE_KEY = (productId) => `demand_insight_${productId}`

export default function useProductDemandInsight(productId, opts = { ttlSeconds: 60 * 60 * 24 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!productId) return

    const cached = sessionStorage.getItem(CACHE_KEY(productId))
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const age = Date.now() - (parsed._fetched_at || 0)
        if (age < (opts.ttlSeconds || 86400) * 1000) {
          setData(parsed.value)
        }
      } catch (e) {
        console.warn('failed to read demand insight cache', e)
      }
    }

    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getProductDemandInsight(productId)
        if (!mounted) return
        setData(result)
        try {
          sessionStorage.setItem(CACHE_KEY(productId), JSON.stringify({ _fetched_at: Date.now(), value: result }))
        } catch (e) { console.warn('sessionStorage set failed', e) }
      } catch (err) {
        console.error('useProductDemandInsight error', err)
        if (!mounted) return
        setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // If there's no cached value, fetch immediately. If there is cached value, still refresh in background.
    if (!data) load()
    else {
      // background refresh
      load()
    }

    return () => { mounted = false }
  }, [productId])

  return { data, loading, error, refresh: async () => { return await getProductDemandInsight(productId) } }
}
