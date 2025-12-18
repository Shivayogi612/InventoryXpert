import { supabase } from './supabase'
import { productsService } from './products.service'
import { suppliersService } from './suppliers.service'
import { ordersService } from './orders.service'
import { advancedForecastingService } from './advancedForecasting.service'
import { cacheService } from './cache.service'

export const autoPoGenerationService = {
  /**
   * Generate purchase orders when predicted stock falls below safety stock
   * @param {Object} options - Configuration options
   * @param {number} options.forecastDays - Number of days to forecast ahead (default: 30)
   * @param {string} options.modelType - Forecasting model to use (default: 'sma')
   * @returns {Promise<Object>} Summary of generated purchase orders
   */
  async generatePurchaseOrders({ forecastDays = 30, modelType = 'sma' } = {}) {
    try {
      // Get all active products
      const products = await productsService.getAll()
      const activeProducts = (products || []).filter((p) => p.is_active !== false)
      
      // Get all suppliers
      const suppliers = await suppliersService.getAll()
      const supplierMap = new Map(suppliers.map(s => [s.name.toLowerCase(), s]))
      
      // Track generated orders
      const generatedOrders = []
      const skippedProducts = []
      
      // Process each product
      for (const product of activeProducts) {
        try {
          // Skip if product doesn't have a supplier
          if (!product.supplier) {
            skippedProducts.push({
              product_id: product.id,
              product_name: product.name,
              reason: 'No supplier assigned'
            })
            continue
          }
          
          // Get supplier
          const supplier = supplierMap.get(product.supplier.toLowerCase())
          if (!supplier) {
            skippedProducts.push({
              product_id: product.id,
              product_name: product.name,
              reason: `Supplier "${product.supplier}" not found`
            })
            continue
          }
          
          // Get current stock levels
          const currentStock = Number(product.quantity || 0)
          const safetyStock = Number(product.reorder_level || 0)
          
          // Generate forecast for the specified period
          const forecast = await advancedForecastingService.generateForecastByModel(
            product.id, 
            modelType, 
            { days: forecastDays }
          )
          
          // Calculate cumulative demand over the forecast period
          const totalForecastedDemand = forecast.reduce(
            (sum, day) => sum + (Number(day.forecasted_demand) || 0), 
            0
          )
          
          // Predicted stock level at the end of forecast period
          const predictedStock = currentStock - totalForecastedDemand
          
          // Check if we need to generate a PO
          if (predictedStock < safetyStock) {
            // Calculate how much to order to reach max stock level or a reasonable amount
            const maxStockLevel = Number(product.max_stock_level || 0)
            let orderQuantity = 0
            
            if (maxStockLevel > 0) {
              // Order enough to reach max stock level
              orderQuantity = Math.max(maxStockLevel - currentStock, 10) // Minimum 10 units
            } else {
              // Order enough to cover twice the forecasted demand plus safety stock
              orderQuantity = Math.max(
                totalForecastedDemand * 2 + safetyStock - currentStock,
                10 // Minimum 10 units
              )
            }
            
            // Create purchase order
            const orderData = {
              order_number: ordersService.generateOrderNumber(),
              supplier_id: supplier.id,
              status: 'pending',
              items_count: 1,
              total_value: orderQuantity * (product.cost || product.price || 0),
              order_date: new Date().toISOString().split('T')[0],
              notes: `Auto-generated PO for low predicted stock. Forecasted demand: ${totalForecastedDemand} units over ${forecastDays} days.`
            }
            
            // Create the order
            const order = await ordersService.create(orderData)
            
            // Add the item to the order
            await ordersService.addOrderItem(order.id, {
              product_id: product.id,
              product_name: product.name,
              quantity: orderQuantity,
              unit_price: product.cost || product.price || 0
            })
            
            generatedOrders.push({
              order_id: order.id,
              order_number: order.order_number,
              product_id: product.id,
              product_name: product.name,
              supplier_id: supplier.id,
              supplier_name: supplier.name,
              quantity_ordered: orderQuantity,
              total_value: order.total_value
            })
          }
        } catch (productError) {
          console.error(`Error processing product ${product.id}:`, productError)
          skippedProducts.push({
            product_id: product.id,
            product_name: product.name,
            reason: `Processing error: ${productError.message}`
          })
        }
      }
      
      // Clear relevant caches
      await cacheService.clear('orders')
      await cacheService.clear('products')
      
      return {
        generatedOrders,
        skippedProducts,
        summary: {
          ordersGenerated: generatedOrders.length,
          productsSkipped: skippedProducts.length,
          timestamp: new Date().toISOString()
        }
      }
    } catch (err) {
      console.error('Auto PO generation error:', err)
      throw err
    }
  },
  
  /**
   * Schedule automatic PO generation (to be called by a cron job or scheduler)
   * @param {Object} options - Configuration options
   */
  async scheduleAutoGeneration(options = {}) {
    try {
      // In a real implementation, this would be called by a scheduler
      // For now, we'll just execute it immediately
      const result = await this.generatePurchaseOrders(options)
      console.log('Auto PO Generation Results:', result)
      return result
    } catch (err) {
      console.error('Scheduled auto PO generation failed:', err)
      throw err
    }
  }
}

export default autoPoGenerationService