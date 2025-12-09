import { useEffect, useRef, useState } from 'react'
import { alertsService } from '../services/alerts.service'
import { cacheService } from '../services/cache.service'
import { productsService } from '../services/products.service'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const subRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // try cache first
        const cached = await cacheService.get('alerts')
        if (mounted && cached) setAlerts(cached)

        const fresh = await alertsService.getActiveAlerts()
        // enrich with product names
        const products = (await cacheService.get('products')) || await productsService.getAll()
        const prodMap = new Map((products || []).map((p) => [p.id, p]))
        const enriched = (fresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
        if (mounted) {
          setAlerts(enriched)
          setUnreadCount(enriched.length)
          await cacheService.set('alerts', enriched)
        }

        // auto-generate alerts based on product levels and refresh alerts afterwards
        await autoGenerateAlerts()
        const refreshed = await alertsService.getActiveAlerts()
        const enrichedRefreshed = (refreshed || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
        if (mounted) {
          setAlerts(enrichedRefreshed)
          setUnreadCount(enrichedRefreshed.length)
          await cacheService.set('alerts', enrichedRefreshed)
        }

        // subscribe to real-time updates
        const sub = alertsService.subscribeToAlerts((event, payload) => {
          // payload is new/old row depending on event
          if (!mounted) return
          if (event === 'INSERT') {
            const product = prodMap.get(payload.product_id)
            const enrichedNew = { ...payload, product_name: product?.name || null }
            setAlerts((s) => [enrichedNew, ...s])
            setUnreadCount((c) => c + 1)
            cacheService.set('alerts', [enrichedNew, ...(alerts || [])])
            toast('New alert: ' + (payload.title || 'Alert'), { icon: '⚠️' })
          } else if (event === 'UPDATE') {
            const updated = { ...payload, product_name: prodMap.get(payload.product_id)?.name || null }
            setAlerts((s) => s.map((a) => (a.id === payload.id ? updated : a)))
            cacheService.set('alerts', alerts.map((a) => (a.id === payload.id ? updated : a)))
          } else if (event === 'DELETE') {
            setAlerts((s) => s.filter((a) => a.id !== payload.id))
            cacheService.set('alerts', alerts.filter((a) => a.id !== payload.id))
          }
        })
        subRef.current = sub
      } catch (err) {
        console.error('useAlerts load error', err)
        toast.error('Failed to load alerts. Showing cached data if available.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
      try {
        const sub = subRef.current
        if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe()
      } catch (err) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function autoGenerateAlerts() {
    try {
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const existing = (await alertsService.getActiveAlerts()) || []
      for (const p of products) {
        const qty = Number(p.quantity || 0)
        const reorder = Number(p.reorder_level)
        // default threshold: use product `reorder_level` when set and > 0, otherwise 5
        const threshold = reorder > 0 ? reorder : 5
        const maxStock = Number(p.max_stock_level || 0)
        if (qty === 0) {
          const has = existing.find((a) => a.product_id === p.id && a.type === 'out_of_stock' && a.status === 'active')
          if (!has) {
            await alertsService.createAlert({ product_id: p.id, type: 'out_of_stock', severity: 'critical', title: `${p.name} is out of stock`, message: `Product ${p.name} (SKU: ${p.sku}) is out of stock.`, metadata: {} })
            await cacheService.clear('alerts')
          }
        } else if (qty <= threshold) {
          const has = existing.find((a) => a.product_id === p.id && a.type === 'low_stock' && a.status === 'active')
          if (!has) {
            await alertsService.createAlert({ product_id: p.id, type: 'low_stock', severity: 'high', title: `${p.name} is low on stock`, message: `Product ${p.name} (SKU: ${p.sku}) has low inventory.`, metadata: {} })
            await cacheService.clear('alerts')
          }
        } else if (maxStock && qty > maxStock) {
          const has = existing.find((a) => a.product_id === p.id && a.type === 'overstock' && a.status === 'active')
          if (!has) {
            await alertsService.createAlert({ product_id: p.id, type: 'overstock', severity: 'low', title: `${p.name} is overstocked`, message: `Product ${p.name} (SKU: ${p.sku}) exceeds max stock level.`, metadata: {} })
            await cacheService.clear('alerts')
          }
        }
      }
    } catch (err) {
      console.error('Auto-generate alerts error', err)
    }
  }

  const acknowledge = async (id, by) => {
    try {
      const actor = by || user?.id || user?.email || 'system'
      const res = await alertsService.acknowledgeAlert(id, actor)
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (fresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
      setAlerts(enriched)
      setUnreadCount(enriched.length)
      return res
    } catch (err) {
      console.error('acknowledge error', err)
      throw err
    }
  }

  const dismiss = async (id) => {
    try {
      const actor = user?.id || user?.email || 'system'
      const res = await alertsService.dismissAlert(id, actor)
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (fresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
      setAlerts(enriched)
      setUnreadCount(enriched.length)
      return res
    } catch (err) {
      console.error('dismiss error', err)
      throw err
    }
  }

  const resolve = async (id) => {
    try {
      const actor = user?.id || user?.email || 'system'
      const res = await alertsService.resolveAlert(id, actor)
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (fresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
      setAlerts(enriched)
      setUnreadCount(enriched.length)
      return res
    } catch (err) {
      console.error('resolve error', err)
      throw err
    }
  }

  // Mark all active alerts as acknowledged (used when user views the alert center)
  const markAllRead = async () => {
    try {
      const actor = user?.id || user?.email || 'system'
      const ids = (alerts || []).map((a) => a.id).filter(Boolean)
      if (!ids.length) return
      // Acknowledge all in parallel
      await Promise.all(ids.map((id) => alertsService.acknowledgeAlert(id, actor)))
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (fresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
      setAlerts(enriched)
      setUnreadCount(enriched.length)
    } catch (err) {
      console.error('markAllRead error', err)
    }
  }

  return { alerts, loading, unreadCount, acknowledge, dismiss, resolve, markAllRead }
}

export default useAlerts

