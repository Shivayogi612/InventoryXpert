import { supabase } from './supabase'
import { productsService } from './products.service'
import { cacheService } from './cache.service'
import { alertsService } from './alerts.service'
import { smsService } from './sms.service'

export const transactionsService = {
  async getRecent(limit = 100) {
    try {
      console.time('transactionsService.getRecent')
      console.log('Transactions service: Attempting to fetch recent transactions')
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit)
      console.log('Transactions service response:', { data, error, count })
      console.timeEnd('transactionsService.getRecent')
      if (error) {
        console.error('Transactions service error:', error)
        throw error
      }
      console.log(`Transactions service: Successfully fetched ${data.length} transactions`)
      return data
    } catch (err) {
      console.error('Error fetching transactions:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      return []
    }
  },
  async getByProduct(productId, days = 90) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('product_id', productId)
        .gte('created_at', since)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching transactions by product:', err)
      return []
    }
  },
  async record(payload) {
    try {
      // Validate product_id is present and a non-empty string
      const productId = (payload && payload.product_id) ? String(payload.product_id).trim() : null
      if (!productId) throw new Error('product_id is required')

      const product = await productsService.getById(productId)
      if (!product) throw new Error('Product not found')
      const prevQty = Number(product.quantity || 0)
      const qty = Number(payload.quantity || 0)
      const type = String(payload.type || '').toLowerCase()
      let newQty = prevQty
      if (type === 'in' || type === 'return') newQty = prevQty + qty
      else if (type === 'out' || type === 'damaged') newQty = prevQty - qty
      else if (type === 'adjustment') newQty = prevQty + qty
      else if (type === 'transfer') newQty = prevQty
      else if (type === 'restock') newQty = prevQty + qty
      else throw new Error(`Invalid transaction type: ${type}`)
      if (newQty < 0) newQty = 0
      const unitPrice = Number(payload.unit_price ?? product.price ?? 0)
      const totalValue = unitPrice * qty
      const row = {
        product_id: productId,
        type,
        quantity: qty,
        previous_quantity: prevQty,
        new_quantity: newQty,
        unit_price: unitPrice,
        total_value: totalValue,
        reason: payload.reason || '',
        reference_number: payload.reference_number || '',
        notes: payload.notes || '',
        location_from: payload.location_from || '',
        location_to: payload.location_to || '',
        // performed_by is a UUID reference; convert empty values to null to avoid DB uuid parse errors
        performed_by: payload.performed_by ? String(payload.performed_by).trim() : null,
        created_at: new Date().toISOString(),
      }
      const insertRes = await supabase.from('transactions').insert([row]).select().single()
      if (insertRes.error) throw insertRes.error
      const updateRes = await supabase.from('products').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', product.id).select().single()
      if (updateRes.error) throw updateRes.error
      // If product quantity is at or below threshold, create a low-stock alert immediately
      try {
        const reorderLevel = Number(product.reorder_level)
        const threshold = reorderLevel > 0 ? reorderLevel : 5
        if (newQty <= threshold) {
          const existingAlerts = await alertsService.getActiveAlerts()
          const hasLow = (existingAlerts || []).find((a) => a.product_id === product.id && a.type === 'low_stock' && a.status === 'active')
          if (!hasLow) {
            const alertData = { product_id: product.id, type: 'low_stock', severity: 'high', title: `${product.name} is low on stock`, message: `Product ${product.name} (SKU: ${product.sku}) has low inventory (${newQty} left).`, metadata: {} };
            await alertsService.createAlert(alertData)
            await cacheService.clear('alerts')

            // Send SMS immediately
            const message = smsService.formatStockAlert(alertData, product);
            console.log(`Transaction triggered alert. Attempting to send SMS for ${product.name}...`);
            const smsResult = await smsService.sendSMS(message);
            console.log(`SMS result for ${product.name}:`, smsResult);
          } else {
            console.log(`Alert already active for ${product.name}, skipping duplicate SMS.`);
          }
        }
      } catch (e) {
        // non-fatal: log and continue
        console.error('failed to create low-stock alert', e)
      }
      await cacheService.clear('products')
      await cacheService.clear('transactions_recent')
      await cacheService.clear('alerts')
      return insertRes.data
    } catch (err) {
      console.error('record transaction error', err)
      throw err
    }
  }
}