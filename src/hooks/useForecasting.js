import { useEffect, useState } from 'react'
import { useCache } from './useCache'
import { transactionsService } from '../services/transactions.service'
import calculateDemandForecast from '../utils/mlAlgorithms'

export function useForecasting(productId, days = 7) {
  const key = `transactions:product:${productId}`
  const fetchFn = () => transactionsService.getByProduct(productId, 180)
  const { data: txns = [], syncing, refresh } = useCache(key, fetchFn, { staleTime: 5 * 60 * 1000 })
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const build = async () => {
      setLoading(true)
      try {
        const f = calculateDemandForecast(txns, days)
        if (mounted) setForecast(f)
      } catch (err) {
        console.error('Forecast hook error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (productId) build()
    return () => { mounted = false }
  }, [txns, productId, days])

  return { forecast, loading, syncing, refresh }
}

export default useForecasting
