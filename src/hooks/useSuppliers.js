import { useCallback, useState } from 'react'
import { suppliersService } from '../services/suppliers.service'
import { cacheService } from '../services/cache.service'
import { toast } from 'react-hot-toast'

export function useSuppliers() {
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

  const deleteSupplier = useCallback(async (id) => {
    setLoading(true)
    try {
      await suppliersService.remove(id)
      await cacheService.clear('suppliers')
      toast.success('Supplier removed')
    } catch (err) {
      console.error('deleteSupplier', err)
      toast.error(err.message || 'Failed to remove supplier')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    loading
  }
}
