import { supabase } from './supabase'
import Papa from 'papaparse'

export const productsService = {
  async getAll() {
    try {
      console.time('productsService.getAll')
      console.log('Products service: Attempting to fetch all products')

      // For testing purposes, let's try to bypass RLS by using a different approach
      // Note: This is only for debugging and should not be used in production
      const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' }).order('name', { ascending: true })
      console.log('Products service response:', { data, error, count })
      console.timeEnd('productsService.getAll')
      if (error) {
        console.error('Products service error:', error)
        // Log additional error details
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        throw error
      }
      console.log(`Products service: Successfully fetched ${data.length} products`)
      return data
    } catch (err) {
      console.error('Error fetching products:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      return []
    }
  },

  async getById(id) {
    try {
      if (!id) return null
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching product by id:', err)
      return null
    }
  },

  async getBySku(sku) {
    try {
      const { data, error } = await supabase.from('products').select('*').ilike('sku', sku).limit(1)
      if (error) throw error
      return data && data.length ? data[0] : null
    } catch (err) {
      console.error('Error fetching product by SKU:', err)
      return null
    }
  },

  async getByBarcode(barcode) {
    try {
      if (!barcode) return null
      const { data, error } = await supabase.from('products').select('*').eq('barcode', barcode).limit(1)
      if (error) throw error
      return data && data.length ? data[0] : null
    } catch (err) {
      console.error('Error fetching product by barcode:', err)
      return null
    }
  },

  async create(payload) {
    try {
      // Normalize payload: trim strings and convert empty unique fields to null
      const norm = { ...payload }
      if (typeof norm.sku === 'string') norm.sku = norm.sku.trim() || null
      if (typeof norm.name === 'string') norm.name = norm.name.trim() || null
      if (typeof norm.barcode === 'string') norm.barcode = norm.barcode.trim() || null
      // ensure numeric fields are numbers
      if (norm.price !== undefined) norm.price = Number(norm.price) || 0
      if (norm.cost !== undefined) norm.cost = Number(norm.cost) || 0
      if (norm.quantity !== undefined) norm.quantity = Number(norm.quantity) || 0
      if (norm.reorder_level !== undefined) norm.reorder_level = Number(norm.reorder_level) || 0
      if (norm.max_stock_level !== undefined) norm.max_stock_level = Number(norm.max_stock_level) || 0

      const { data, error } = await supabase.from('products').insert([norm]).select().single()
      if (error) {
        // Map common DB constraint errors to friendly messages
        const msg = (error && (error.message || error.details || JSON.stringify(error))) || 'Unknown database error'
        // Postgres unique violation code is 23505; Supabase may return status 409 for conflict
        if ((error.code && String(error.code).includes('23505')) || (error.status === 409) || /duplicate|unique|already exists/i.test(msg)) {
          const friendly = 'A product with that SKU or unique field already exists.'
          console.error('Error creating product (conflict):', msg)
          throw new Error(friendly)
        }
        console.error('Error creating product:', msg)
        throw new Error(msg)
      }

      // Immediate Alert Check
      this._checkAndTriggerAlert(data);

      return data
    } catch (err) {
      console.error('Error creating product:', err)
      throw err
    }
  },

  async update(id, payload) {
    try {
      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
      if (error) throw error

      // Immediate Alert Check
      this._checkAndTriggerAlert(data);

      return data
    } catch (err) {
      console.error('Error updating product:', err)
      throw err
    }
  },

  /**
   * Internal helper to check stock levels and trigger alerts/SMS immediately
   * @private
   */
  async _checkAndTriggerAlert(product) {
    try {
      const { alertsService } = await import('./alerts.service');
      const { smsService } = await import('./sms.service');
      const { cacheService } = await import('./cache.service');

      const qty = Number(product.quantity || 0);
      const reorderLevel = Number(product.reorder_level);
      const threshold = reorderLevel > 0 ? reorderLevel : 5;

      if (qty <= threshold) {
        const existingAlerts = await alertsService.getActiveAlerts();
        const hasLow = (existingAlerts || []).find((a) => a.product_id === product.id && (a.type === 'low_stock' || a.type === 'out_of_stock') && a.status === 'active');

        if (!hasLow) {
          const isOutOfStock = qty === 0;
          const alertData = {
            product_id: product.id,
            type: isOutOfStock ? 'out_of_stock' : 'low_stock',
            severity: isOutOfStock ? 'critical' : 'high',
            title: isOutOfStock ? `${product.name} is out of stock` : `${product.name} is low on stock`,
            message: isOutOfStock ? `Product ${product.name} (SKU: ${product.sku}) is out of stock.` : `Product ${product.name} (SKU: ${product.sku}) has low inventory (${qty} left).`,
            metadata: {}
          };

          await alertsService.createAlert(alertData);
          await cacheService.clear('alerts');

          // Send SMS immediately
          const message = smsService.formatStockAlert(alertData, product);
          await smsService.sendSMS(message).catch(err => console.error('Failed to send SMS on manual update:', err));
        }
      }
    } catch (err) {
      console.error('Error in immediate alert check:', err);
    }
  },

  async remove(id) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  },

  // CSV export
  async exportCsv(products) {
    const headers = ['sku', 'name', 'description', 'category', 'brand', 'unit', 'price', 'cost', 'quantity', 'reorder_level', 'max_stock_level', 'supplier', 'location', 'barcode', 'image_url', 'is_active']
    const csv = Papa.unparse(products.map(p => {
      const row = {}
      headers.forEach(h => row[h] = p[h] ?? '')
      return row
    }), { columns: headers })
    return csv
  },

  // CSV import (returns array of parsed objects)
  async parseCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
      })
    })
  }
}