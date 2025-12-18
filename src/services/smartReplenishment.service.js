import { supabase } from './supabase'
import { productsService } from './products.service'
import { cacheService } from './cache.service'

export const smartReplenishmentService = {
  /**
   * Analyze inventory across locations and suggest internal transfers
   * @param {Object} options - Configuration options
   * @returns {Promise<Array>} List of suggested transfers
   */
  async analyzeAndSuggestTransfers(options = {}) {
    try {
      // Get all products
      const products = await productsService.getAll()
      
      // For demo purposes, we'll simulate multiple locations
      // In a real implementation, this would come from a locations/branches table
      const locations = [
        { id: 'loc-1', name: 'Main Warehouse' },
        { id: 'loc-2', name: 'Store Branch A' },
        { id: 'loc-3', name: 'Store Branch B' }
      ]
      
      // Simulate inventory data per location (in a real app, this would come from DB)
      // For now, we'll distribute the existing inventory randomly
      const locationInventories = this.simulateLocationInventories(products, locations)
      
      // Track suggested transfers
      const suggestedTransfers = []
      
      // Analyze each product
      for (const product of products) {
        try {
          // Get inventory data for this product across all locations
          const productInventories = locations.map(location => {
            const inventory = locationInventories[location.id]?.find(inv => inv.product_id === product.id)
            return {
              location_id: location.id,
              location_name: location.name,
              quantity: inventory ? inventory.quantity : 0,
              reorder_level: inventory ? inventory.reorder_level : (product.reorder_level || 0),
              max_stock_level: inventory ? inventory.max_stock_level : (product.max_stock_level || 0)
            }
          })
          
          // Find locations with excess stock
          const excessLocations = productInventories.filter(loc => {
            return loc.quantity > (loc.max_stock_level || loc.reorder_level * 2)
          })
          
          // Find locations with low stock
          const lowStockLocations = productInventories.filter(loc => {
            return loc.quantity <= loc.reorder_level
          })
          
          // Suggest transfers from excess to low stock locations
          for (const lowLoc of lowStockLocations) {
            const neededQuantity = Math.max(
              (lowLoc.reorder_level * 2) - lowLoc.quantity, 
              10 // Minimum transfer quantity
            )
            
            // Try to find a source location with excess stock
            for (const excessLoc of excessLocations) {
              // Don't transfer from the same location
              if (excessLoc.location_id === lowLoc.location_id) continue
              
              // Calculate available excess quantity
              const excessQuantity = excessLoc.quantity - (excessLoc.max_stock_level || excessLoc.reorder_level * 2)
              
              if (excessQuantity > 0) {
                // Transfer what we can (up to what's needed or what's available)
                const transferQuantity = Math.min(neededQuantity, excessQuantity, 50) // Cap at 50 units
                
                if (transferQuantity > 0) {
                  suggestedTransfers.push({
                    product_id: product.id,
                    product_name: product.name,
                    product_sku: product.sku,
                    from_location_id: excessLoc.location_id,
                    from_location_name: excessLoc.location_name,
                    to_location_id: lowLoc.location_id,
                    to_location_name: lowLoc.location_name,
                    quantity: transferQuantity,
                    urgency: this.calculateTransferUrgency(lowLoc, transferQuantity),
                    estimated_value: transferQuantity * (product.price || product.cost || 0)
                  })
                  
                  // Update simulated inventories
                  const fromInventory = locationInventories[excessLoc.location_id]?.find(inv => inv.product_id === product.id)
                  const toInventory = locationInventories[lowLoc.location_id]?.find(inv => inv.product_id === product.id)
                  
                  if (fromInventory) fromInventory.quantity -= transferQuantity
                  if (toInventory) toInventory.quantity += transferQuantity
                  
                  // Break after first transfer suggestion for this low stock location
                  break
                }
              }
            }
          }
        } catch (productError) {
          console.error(`Error analyzing product ${product.id}:`, productError)
        }
      }
      
      return suggestedTransfers
    } catch (err) {
      console.error('Smart replenishment analysis error:', err)
      throw err
    }
  },
  
  /**
   * Simulate inventory distribution across multiple locations
   * In a real implementation, this would query actual location inventory data
   */
  simulateLocationInventories(products, locations) {
    const locationInventories = {}
    
    // Distribute inventory across locations
    for (const location of locations) {
      locationInventories[location.id] = products.map(product => {
        // Randomly distribute inventory (for demo purposes)
        const totalQuantity = Number(product.quantity || 0)
        const locationShare = Math.random()
        const locationQuantity = Math.floor(totalQuantity * locationShare)
        
        return {
          product_id: product.id,
          quantity: locationQuantity,
          reorder_level: Number(product.reorder_level || 0),
          max_stock_level: Number(product.max_stock_level || 0)
        }
      })
    }
    
    return locationInventories
  },
  
  /**
   * Calculate transfer urgency based on stock levels
   */
  calculateTransferUrgency(location, transferQuantity) {
    const currentStock = location.quantity
    const reorderLevel = location.reorder_level
    
    if (currentStock === 0) return 'critical'
    if (currentStock <= reorderLevel * 0.5) return 'high'
    if (currentStock <= reorderLevel) return 'medium'
    return 'low'
  },
  
  /**
   * Execute a transfer between locations
   */
  async executeTransfer(transferData) {
    try {
      // In a real implementation, this would:
      // 1. Create a transfer record in the database
      // 2. Update inventory levels at both locations
      // 3. Create transaction records
      
      // For now, we'll just simulate the process
      console.log('Executing transfer:', transferData)
      
      // Create transfer record
      const transferRecord = {
        id: `transfer-${Date.now()}`,
        product_id: transferData.product_id,
        from_location_id: transferData.from_location_id,
        to_location_id: transferData.to_location_id,
        quantity: transferData.quantity,
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }
      
      // Clear relevant caches
      await cacheService.clear('products')
      await cacheService.clear('transactions')
      
      return transferRecord
    } catch (err) {
      console.error('Transfer execution error:', err)
      throw err
    }
  }
}

export default smartReplenishmentService