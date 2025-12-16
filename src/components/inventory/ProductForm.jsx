import React, { useEffect, useState } from 'react'
import { productsService } from '../../services/products.service'
import { useProducts } from '../../hooks/useProducts'
import { toast } from 'react-hot-toast'
import Dialog from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { X } from 'lucide-react'

export default function ProductForm({ product = null, onClose }) {
  const isEdit = !!product?.id
  const [form, setForm] = useState({
    sku: '', name: '', description: '', category: '', brand: '', unit: '', price: 0, cost: 0, quantity: 0, reorder_level: 0, max_stock_level: 0, supplier: '', location: '', barcode: '', image_url: '', is_active: true
  })
  const { createProduct, updateProduct } = useProducts()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) setForm({ ...form, ...product })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(product.id, form)
      } else {
        // Validate SKU uniqueness
        if (!form.sku || !form.name) throw new Error('SKU and Name are required')
        const existing = await productsService.getBySku(form.sku)
        if (existing) {
          throw new Error('SKU already exists. Please choose a unique SKU.')
        }
        // Validate barcode uniqueness if provided
        if (form.barcode && String(form.barcode).trim() !== '') {
          const existingBarcode = await productsService.getByBarcode(String(form.barcode).trim())
          if (existingBarcode) {
            throw new Error('Barcode already exists on another product. Please use a unique barcode or leave blank.')
          }
        }
        await createProduct(form)
      }
      toast.success(`${isEdit ? 'Updated' : 'Created'} product successfully!`)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={submit} className="space-y-5 sm:space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <Input 
                    required 
                    value={form.sku} 
                    onChange={handleChange('sku')} 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    disabled={isEdit}
                  />
                  <p className="mt-1 text-xs text-gray-500">Unique product identifier</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input 
                    required 
                    value={form.name} 
                    onChange={handleChange('name')} 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3} 
                    value={form.description} 
                    onChange={handleChange('description')} 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing & Inventory */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Pricing</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={form.price} 
                      onChange={handleChange('price')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cost</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={form.cost} 
                      onChange={handleChange('cost')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Inventory</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <Input 
                      type="number" 
                      value={form.quantity} 
                      onChange={handleChange('quantity')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                      <Input 
                        type="number" 
                        value={form.reorder_level} 
                        onChange={handleChange('reorder_level')} 
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                      <Input 
                        type="number" 
                        value={form.max_stock_level} 
                        onChange={handleChange('max_stock_level')} 
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Categorization */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Categorization</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input 
                    value={form.category} 
                    onChange={handleChange('category')} 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="e.g., Electronics, Clothing"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <Input 
                    value={form.brand} 
                    onChange={handleChange('brand')} 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="e.g., Nike, Apple"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <Input 
                    value={form.unit} 
                    onChange={handleChange('unit')} 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="e.g., piece, kg, liter"
                  />
                </div>
              </div>
            </div>
            
            {/* Supplier & Location */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Supplier Information</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <Input 
                      value={form.supplier} 
                      onChange={handleChange('supplier')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="e.g., ABC Supplies Co."
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <Input 
                      value={form.barcode} 
                      onChange={handleChange('barcode')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="e.g., 1234567890128"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Location</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                    <Input 
                      value={form.location} 
                      onChange={handleChange('location')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="e.g., Warehouse A, Shelf 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <Input 
                      value={form.image_url} 
                      onChange={handleChange('image_url')} 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Product'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}