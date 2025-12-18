import { useEffect, useRef, useState } from 'react'
import { alertsService } from '../services/alerts.service'
import { cacheService } from '../services/cache.service'
import { productsService } from '../services/products.service'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { smsService } from '../services/sms.service'

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
        // Clear cache on load to ensure we get fresh data
        await cacheService.clear('alerts')

        const fresh = await alertsService.getActiveAlerts()
        const filteredFresh = (fresh || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')

        // enrich with product names
        const products = (await cacheService.get('products')) || await productsService.getAll()
        const prodMap = new Map((products || []).map((p) => [p.id, p]))
        const enriched = (filteredFresh || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
        if (mounted) {
          setAlerts(enriched)
          setUnreadCount(enriched.length)
          await cacheService.set('alerts', enriched)
        }

        // auto-generate alerts based on product levels and refresh alerts afterwards
        await autoGenerateAlerts()
        const refreshed = await alertsService.getActiveAlerts()
        const filteredRefreshed = (refreshed || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')
        const enrichedRefreshed = (filteredRefreshed || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
        if (mounted) {
          setAlerts(enrichedRefreshed)
          setUnreadCount(enrichedRefreshed.length)
          await cacheService.set('alerts', enrichedRefreshed)
        }

        // subscribe to real-time updates
        const sub = alertsService.subscribeToAlerts((event, payload) => {
          if (!mounted) return

          if (event === 'INSERT') {
            // Only add if it's a low stock or out of stock alert
            if (payload.type === 'low_stock' || payload.type === 'out_of_stock' || payload.type === 'stockout_risk') {
              const product = prodMap.get(payload.product_id)
              const enrichedNew = { ...payload, product_name: product?.name || null }

              setAlerts((prev) => {
                const updated = [enrichedNew, ...prev]
                cacheService.set('alerts', updated)
                return updated
              })
              setUnreadCount((c) => c + 1)
            }
          } else if (event === 'UPDATE') {
            const updated = { ...payload, product_name: prodMap.get(payload.product_id)?.name || null }

            setAlerts((prev) => {
              let next
              // If the alert is no longer active (acknowledged, resolved, dismissed), remove it from the list
              if (payload.status !== 'active') {
                next = prev.filter((a) => a.id !== payload.id)
                setUnreadCount((c) => Math.max(0, c - 1))
              } else {
                next = prev.map((a) => (a.id === payload.id ? updated : a))
              }
              cacheService.set('alerts', next)
              return next
            })
          } else if (event === 'DELETE') {
            setAlerts((prev) => {
              const next = prev.filter((a) => a.id !== payload.id)
              setUnreadCount((c) => Math.max(0, c - 1))
              cacheService.set('alerts', next)
              return next
            })
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

        if (qty <= threshold) {
          // Check for any active or RECENTLY RESOLVED alerts for this product to avoid spamming
          // Recent = within last 4 hours
          const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

          const hasRecentlyActive = existing.find((a) =>
            a.product_id === p.id &&
            (a.type === 'low_stock' || a.type === 'out_of_stock') &&
            (a.status === 'active' || (a.status === 'resolved' && a.resolved_at > fourHoursAgo))
          )

          if (!hasRecentlyActive) {
            const isOutOfStock = qty === 0;
            console.log(`NEW ALERT DETECTED: ${isOutOfStock ? 'Out of stock' : 'Low stock'} for ${p.name}`);
            const alertData = {
              product_id: p.id,
              type: isOutOfStock ? 'out_of_stock' : 'low_stock',
              severity: isOutOfStock ? 'critical' : 'high',
              title: isOutOfStock ? `${p.name} is out of stock` : `${p.name} is low on stock`,
              message: isOutOfStock ? `Product ${p.name} (SKU: ${p.sku}) is out of stock.` : `Product ${p.name} (SKU: ${p.sku}) has low inventory.`,
              metadata: {}
            };
            await alertsService.createAlert(alertData)
            await cacheService.clear('alerts')

            // Send only SMS notifications as per user request
            await sendSMSNotification(alertData)
              .catch(err => console.error('Failed to send SMS notification:', err));

            // Add a small delay between multiple SMS sends to prevent provider rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log(`Alert already active for ${p.name}, skipping SMS to prevent duplicates.`);
          }
        }
      }
    } catch (err) {
      console.error('Auto-generate alerts error', err)
    }
  }

  /**
   * Send SMS notification for alerts using the centralized SMS service
   * @param {Object} alert - The alert to send via SMS
   */
  async function sendSMSNotification(alert) {
    try {
      const products = (await cacheService.get('products')) || await productsService.getAll();
      const product = products.find(p => p.id === alert.product_id);
      const message = smsService.formatStockAlert(alert, product);

      const result = await smsService.sendSMS(message);

      if (result.success) {
        console.log('SMS sent successfully:', result);
      }

      return result;
    } catch (err) {
      console.error('SMS notification error:', err);
      toast.error(`Failed to send SMS alert for ${alert.title}`);
      throw err;
    }
  }

  const acknowledge = async (id, by) => {
    try {
      const actor = by || user?.id || user?.email || 'system'
      const res = await alertsService.acknowledgeAlert(id, actor)
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const filtered = (fresh || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (filtered || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
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
      const filtered = (fresh || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (filtered || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
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
      const filtered = (fresh || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (filtered || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
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
      // After marking all as read, there should be no active alerts
      setAlerts([])
      setUnreadCount(0)
    } catch (err) {
      console.error('markAllRead error', err)
    }
  }

  const refreshAlerts = async () => {
    setLoading(true)
    try {
      await cacheService.clear('alerts')
      const fresh = await alertsService.getActiveAlerts()
      const filtered = (fresh || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'stockout_risk')
      const products = (await cacheService.get('products')) || await productsService.getAll()
      const prodMap = new Map((products || []).map((p) => [p.id, p]))
      const enriched = (filtered || []).map((a) => ({ ...a, product_name: prodMap.get(a.product_id)?.name || null }))
      setAlerts(enriched)
      setUnreadCount(enriched.length)
      await cacheService.set('alerts', enriched)
    } catch (err) {
      console.error('refreshAlerts error', err)
    } finally {
      setLoading(false)
    }
  }

  return { alerts, loading, unreadCount, acknowledge, dismiss, resolve, markAllRead, refreshAlerts }
}

export default useAlerts