import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, Package } from 'lucide-react'
import { suppliersService } from '../services/suppliers.service'
import { supabase } from '../services/supabase'

export default function DeleteSupplierModal({ isOpen, onClose, supplier, onSuccess }) {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [productsCount, setProductsCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load suppliers and product count when modal opens
  useEffect(() => {
    if (isOpen && supplier) {
      loadData()
    }
  }, [isOpen, supplier])

  const loadData = async () => {
    try {
      // Load all suppliers except the one being deleted
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('*')
        .neq('id', supplier.id)
        .order('name', { ascending: true })
      
      setSuppliers(suppliersData || [])
      
      // Count products associated with this supplier
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('supplier', supplier.name)
      
      setProductsCount(count || 0)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // If reassigning products, update them first
      if (selectedSupplier) {
        const newSupplier = suppliers.find(s => s.id === selectedSupplier)
        if (newSupplier) {
          // Update all products that had the old supplier to the new supplier
          const { data: productsToUpdate } = await supabase
            .from('products')
            .select('id')
            .eq('supplier', supplier.name)
          
          // Update each product with the new supplier name
          for (const product of productsToUpdate) {
            await supabase
              .from('products')
              .update({ supplier: newSupplier.name })
              .eq('id', product.id)
          }
        }
      }
      
      // Now delete the supplier
      await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplier.id)
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error deleting supplier:', err)
      alert('Failed to delete supplier: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !supplier) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <AlertTriangle size={18} className="text-red-500" />
            <div>
              <h2 className="modal-title">Delete Supplier</h2>
              <p className="modal-subtitle">Permanently remove {supplier.name}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Confirm Deletion</h3>
                  <p className="text-red-700 text-sm mt-1">
                    This action cannot be undone. The supplier <strong>{supplier.name}</strong> will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {productsCount > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Package size={20} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Product Reassignment</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      This supplier has <strong>{productsCount} product{productsCount !== 1 ? 's' : ''}</strong> associated with it.
                      Select another supplier to reassign these products, or they will be orphaned.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reassign products to:
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Leave products orphaned</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Supplier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}