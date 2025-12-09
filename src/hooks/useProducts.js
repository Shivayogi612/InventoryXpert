import { useCallback, useState } from 'react'
import { productsService } from '../services/products.service'
import { cacheService } from '../services/cache.service'
import { toast } from 'react-hot-toast'

export function useProducts() {
  const [loading, setLoading] = useState(false)

  const createProduct = useCallback(async (payload) => {
    setLoading(true)
    try {
      const created = await productsService.create(payload)
      // invalidate cache
      await cacheService.clear('products')
      toast.success('Product created')
      return created
    } catch (err) {
      console.error('createProduct', err)
      toast.error(err.message || 'Failed to create product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProduct = useCallback(async (id, payload) => {
    setLoading(true)
    try {
      const updated = await productsService.update(id, payload)
      await cacheService.clear('products')
      toast.success('Product updated')
      return updated
    } catch (err) {
      console.error('updateProduct', err)
      toast.error(err.message || 'Failed to update product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    setLoading(true)
    try {
      await productsService.remove(id)
      await cacheService.clear('products')
      toast.success('Product deleted')
    } catch (err) {
      console.error('deleteProduct', err)
      toast.error(err.message || 'Failed to delete product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createProduct, updateProduct, deleteProduct, loading }
}
