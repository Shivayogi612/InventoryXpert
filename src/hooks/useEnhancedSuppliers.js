import { useCallback, useState } from 'react'
import { suppliersService } from '../services/suppliers.service'
import { productsService } from '../services/products.service'
import { cacheService } from '../services/cache.service'
import { supabase } from '../services/supabase'
import { toast } from 'react-hot-toast'

export function useEnhancedSuppliers() {
  const [loading, setLoading] = useState(false)

  const createSupplier = useCallback(async (payload) => {
    setLoading(true)
    try {
      const created = await suppliersService.create(payload)
      await cacheService.clear('suppliers')
      toast.success('Supplier added successfully')
      return created
    } catch (err) {
      console.error('createSupplier', err)
      toast.error(err.message || 'Failed to add supplier')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSupplier = useCallback(async (id, payload) => {
    setLoading(true)
    try {
      const updated = await suppliersService.update(id, payload)
      await cacheService.clear('suppliers')
      toast.success('Supplier updated')
      return updated
    } catch (err) {
      console.error('updateSupplier', err)
      toast.error(err.message || 'Failed to update supplier')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSupplierWithReassignment = useCallback(async (supplierId, newSupplierId) => {
    setLoading(true)
    try {
      // First, reassign all products from the supplier being deleted to the new supplier
      if (newSupplierId) {
        // Get the supplier names
        const oldSupplier = await suppliersService.getById(supplierId)
        const newSupplier = await suppliersService.getById(newSupplierId)
        
        if (oldSupplier && newSupplier) {
          // Update all products that had the old supplier to the new supplier
          const { data: productsToUpdate, error: fetchError } = await supabase
            .from('products')
            .select('id')
            .eq('supplier', oldSupplier.name)
          
          if (fetchError) {
            throw new Error(`Failed to fetch products: ${fetchError.message}`)
          }
          
          // Update each product with the new supplier name
          let updatedCount = 0
          for (const product of productsToUpdate) {
            await productsService.update(product.id, { supplier: newSupplier.name })
            updatedCount++
          }
          
          toast.success(`Reassigned ${updatedCount} products to ${newSupplier.name}`)
        }
      }
      
      // Now delete the supplier
      await suppliersService.remove(supplierId)
      await cacheService.clear('suppliers')
      await cacheService.clear('products')
      toast.success('Supplier removed successfully')
    } catch (err) {
      console.error('deleteSupplierWithReassignment', err)
      toast.error(err.message || 'Failed to remove supplier')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createSupplier,
    updateSupplier,
    deleteSupplierWithReassignment,
    loading
  }
}