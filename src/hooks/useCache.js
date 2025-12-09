import { useEffect, useRef, useState } from 'react'
import { cacheService } from '../services/cache.service'
import { toast } from 'react-hot-toast'

export function useCache(key, fetchFunction, options = {}) {
  const { staleTime = 5 * 60 * 1000, initialData = [] } = options
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    // 1. Return cached data immediately
    ;(async () => {
      try {
        const cached = await cacheService.get(key)
        if (mounted.current) {
          setData(cached ?? initialData)
        }
        const last = await cacheService.getLastSyncTime(key)
        if (last) setLastSync(last)
      } catch (err) {
        console.error('Cache read error', err)
      }

      // 2. Trigger background fetch
      refresh()
    })()

    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const refresh = async () => {
    setSyncing(true)
    setLoading((prev) => prev || false) // keep loading false for instant display
    try {
      const result = await fetchFunction()
      if (!mounted.current) return
      await cacheService.set(key, result)
      setData(result ?? initialData)
      setLastSync(Date.now())
    } catch (err) {
      console.error(`Failed to refresh cache for ${key}:`, err)
      toast.error('Failed to sync data. Showing cached version.')
    } finally {
      if (mounted.current) setSyncing(false)
    }
  }

  const isStale = async () => {
    return cacheService.isStale(key, staleTime)
  }

  return {
    data,
    loading,
    syncing,
    lastSync,
    refresh,
    isStale,
  }
}
