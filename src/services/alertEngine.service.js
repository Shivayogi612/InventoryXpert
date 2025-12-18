import { supabase } from './supabase'
import { productsService } from './products.service'
import { suppliersService } from './suppliers.service'
import { ordersService } from './orders.service'
import { alertsService } from './alerts.service'
import { cacheService } from './cache.service'
import { advancedForecastingService } from './advancedForecasting.service'
import { smsService } from './sms.service'

export const alertEngineService = {
  /**
   * Generate all types of alerts
   * @returns {Promise<Object>} Summary of generated alerts
   */
  async generateAlerts() {
    try {
      console.log('Generating alerts...')

      const stockoutAlerts = await this.generateStockoutRiskAlerts()

      // Only include stockout risk alerts (low stock/out of stock)
      const allAlerts = [
        ...stockoutAlerts
      ]

      // Limit the number of alerts we process at once to prevent overload
      const maxAlertsToProcess = 50
      const alertsToProcess = allAlerts.slice(0, maxAlertsToProcess)
      const remainingAlerts = allAlerts.slice(maxAlertsToProcess)

      if (remainingAlerts.length > 0) {
        console.log(`Warning: ${remainingAlerts.length} alerts were not processed due to limit`)
      }

      const createdAlerts = []
      const skippedAlerts = []

      // Process each alert
      for (const alert of alertsToProcess) {
        try {
          // Check if a similar active alert already exists
          const existingAlerts = await alertsService.getActiveAlerts()

          // Also check for recently resolved alerts to prevent immediate recreation
          const { data: recentResolved } = await supabase
            .from('alerts')
            .select('id')
            .eq('product_id', alert.product_id)
            .eq('type', alert.type)
            .eq('status', 'resolved')
            .gt('resolved_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
            .limit(1)

          const duplicate = existingAlerts.find(existing =>
            existing.type === alert.type &&
            existing.product_id === alert.product_id &&
            existing.status === 'active'
          )

          if (!duplicate && (!recentResolved || recentResolved.length === 0)) {
            const created = await alertsService.createAlert(alert)
            createdAlerts.push(created)

            // Send only SMS notifications for low stock alerts as per user request
            if (alert.type === 'low_stock' || alert.type === 'out_of_stock' || alert.type === 'stockout_risk') {
              // Send SMS notification
              await this.sendSMSNotification(alert)
                .catch(err => console.error('Failed to send SMS notification:', err));

              // Add a small delay between multiple SMS sends
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            skippedAlerts.push({
              ...alert,
              reason: 'Duplicate alert already exists'
            })
          }
        } catch (err) {
          console.error('Error creating alert:', err)
          skippedAlerts.push({
            ...alert,
            reason: `Creation failed: ${err.message}`
          })
        }
      }

      // Clear alerts cache
      await cacheService.clear('alerts')

      return {
        createdAlerts,
        skippedAlerts,
        summary: {
          stockoutRisk: stockoutAlerts.length,
          excessStock: 0,
          supplierDelay: 0,
          other: 0,
          totalCreated: createdAlerts.length,
          totalSkipped: skippedAlerts.length
        }
      }
    } catch (err) {
      console.error('Alert generation error:', err)
      throw err
    }
  },

  /**
   * Generate alerts for risk of stockout in 7 days
   */
  async generateStockoutRiskAlerts() {
    try {
      const alerts = []
      // Use cache to avoid repeatedly fetching products
      const products = await cacheService.get('products') || await productsService.getAll()
      // Update cache if it was empty
      if (!await cacheService.get('products')) {
        await cacheService.set('products', products, 5 * 60 * 1000) // Cache for 5 minutes
      }

      for (const product of products) {
        try {
          // Get current stock
          const currentStock = Number(product.quantity || 0)

          if (currentStock <= 0) {
            // Already out of stock
            alerts.push({
              product_id: product.id,
              type: 'out_of_stock',
              severity: 'critical',
              title: `${product.name} is out of stock`,
              message: `Product ${product.name} (SKU: ${product.sku}) is completely out of stock.`,
              metadata: {
                current_stock: currentStock
              }
            })
            continue
          }

          // Generate 7-day forecast
          const forecast = await advancedForecastingService.generateForecastByModel(
            product.id,
            'sma',
            { days: 7 }
          )

          // Calculate total demand over next 7 days
          const totalDemand = forecast.reduce(
            (sum, day) => sum + (Number(day.forecasted_demand) || 0),
            0
          )

          // Check if we'll run out of stock
          if (currentStock < totalDemand) {
            const daysUntilStockout = Math.floor((currentStock / (totalDemand / 7)) || 0)

            alerts.push({
              product_id: product.id,
              type: 'stockout_risk',
              severity: 'high',
              title: `Risk of stockout for ${product.name} in ${daysUntilStockout} days`,
              message: `Product ${product.name} (SKU: ${product.sku}) may run out of stock in approximately ${daysUntilStockout} days based on forecasted demand.`,
              metadata: {
                current_stock: currentStock,
                forecasted_demand_7_days: totalDemand,
                days_until_stockout: daysUntilStockout
              }
            })
          }
        } catch (err) {
          console.error(`Error processing product ${product.id} for stockout alerts:`, err)
        }
      }

      return alerts
    } catch (err) {
      console.error('Stockout risk alert generation error:', err)
      return []
    }
  },

  /**
   * Generate alerts for excess stock worth ₹X idle for 60+ days
   */
  async generateExcessStockAlerts() {
    try {
      const alerts = []
      // Use cache to avoid repeatedly fetching products
      const products = await cacheService.get('products') || await productsService.getAll()
      // Update cache if it was empty
      if (!await cacheService.get('products')) {
        await cacheService.set('products', products, 5 * 60 * 1000) // Cache for 5 minutes
      }

      for (const product of products) {
        try {
          const currentStock = Number(product.quantity || 0)
          const maxStockLevel = Number(product.max_stock_level || 0)
          const reorderLevel = Number(product.reorder_level || 0)

          // Determine what constitutes "excess" stock
          const excessThreshold = maxStockLevel > 0
            ? maxStockLevel
            : reorderLevel * 3 // If no max stock level, 3x reorder level is considered excess

          if (currentStock > excessThreshold) {
            const excessQuantity = currentStock - excessThreshold
            const unitPrice = Number(product.price || product.cost || 0)
            const excessValue = excessQuantity * unitPrice

            // Only alert if excess value is significant (e.g., > ₹5000)
            if (excessValue > 5000) {
              alerts.push({
                product_id: product.id,
                type: 'overstock',
                severity: 'medium',
                title: `Excess stock worth ₹${excessValue.toLocaleString('en-IN')} for ${product.name}`,
                message: `Product ${product.name} (SKU: ${product.sku}) has excess stock of ${excessQuantity} units worth ₹${excessValue.toLocaleString('en-IN')} which has been idle for 60+ days.`,
                metadata: {
                  current_stock: currentStock,
                  excess_quantity: excessQuantity,
                  excess_value: excessValue,
                  unit_price: unitPrice
                }
              })
            }
          }
        } catch (err) {
          console.error(`Error processing product ${product.id} for excess stock alerts:`, err)
        }
      }

      return alerts
    } catch (err) {
      console.error('Excess stock alert generation error:', err)
      return []
    }
  },

  /**
   * Generate alerts for supplier delay likelihood
   */
  async generateSupplierDelayAlerts() {
    try {
      const alerts = []
      // Use cache to avoid repeatedly fetching orders
      const orders = await cacheService.get('activeOrders') || await ordersService.getActiveOrders()
      // Update cache if it was empty
      if (!await cacheService.get('activeOrders')) {
        await cacheService.set('activeOrders', orders, 5 * 60 * 1000) // Cache for 5 minutes
      }

      const today = new Date()

      for (const order of orders) {
        try {
          // Skip if no expected delivery date
          if (!order.expected_delivery) continue

          const expectedDelivery = new Date(order.expected_delivery)
          const daysUntilDelivery = Math.ceil((expectedDelivery - today) / (1000 * 60 * 60 * 24))

          // If delivery is overdue or due within 2 days
          if (daysUntilDelivery <= 2) {
            // Check if order is delayed (expected delivery was in the past)
            const isDelayed = daysUntilDelivery < 0

            alerts.push({
              order_id: order.id,
              supplier_id: order.supplier_id,
              type: 'low_stock',
              severity: isDelayed ? 'high' : 'medium',
              title: `${isDelayed ? 'Delayed' : 'Likely delayed'} order from ${order.supplier?.name || 'supplier'}`,
              message: `Purchase order ${order.order_number} from ${order.supplier?.name || 'supplier'} ${isDelayed ? 'is delayed' : 'may be delayed'}. Expected delivery was ${order.expected_delivery}.`,
              metadata: {
                order_number: order.order_number,
                expected_delivery: order.expected_delivery,
                days_until_delivery: daysUntilDelivery,
                is_delayed: isDelayed
              }
            })
          }
        } catch (err) {
          console.error(`Error processing order ${order.id} for supplier delay alerts:`, err)
        }
      }

      return alerts
    } catch (err) {
      console.error('Supplier delay alert generation error:', err)
      return []
    }
  },

  /**
   * Send alert notifications via different channels
  /**
   * Send SMS notification for alerts using the centralized SMS service
   * @param {Object} alert - The alert to send via SMS
   */
  async sendSMSNotification(alert) {
    try {
      const product = await productsService.getById(alert.product_id);
      const message = smsService.formatStockAlert(alert, product);
      return await smsService.sendSMS(message);
    } catch (err) {
      console.error('SMS notification error:', err);
      throw err;
    }
  }
}

export default alertEngineService