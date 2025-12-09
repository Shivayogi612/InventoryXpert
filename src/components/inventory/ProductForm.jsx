import React, { useEffect, useState } from 'react'
import { productsService } from '../../services/products.service'
import { useProducts } from '../../hooks/useProducts'
import { toast } from 'react-hot-toast'
import Dialog from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'

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
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="p-3">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">SKU</label>
            <Input required value={form.sku} onChange={handleChange('sku')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <Input required value={form.name} onChange={handleChange('name')} />
          </div>
          <div className="md:col-span-3">
            <label className="text-sm text-gray-600">Description</label>
            <textarea rows={3} value={form.description} onChange={handleChange('description')} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <Input value={form.category} onChange={handleChange('category')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Brand</label>
            <Input value={form.brand} onChange={handleChange('brand')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Price</label>
            <Input type="number" step="0.01" value={form.price} onChange={handleChange('price')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Cost</label>
            <Input type="number" step="0.01" value={form.cost} onChange={handleChange('cost')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Quantity</label>
            <Input type="number" value={form.quantity} onChange={handleChange('quantity')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Reorder Level</label>
            <Input type="number" value={form.reorder_level} onChange={handleChange('reorder_level')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Stock Level</label>
            <Input type="number" value={form.max_stock_level} onChange={handleChange('max_stock_level')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Supplier</label>
            <Input value={form.supplier} onChange={handleChange('supplier')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <Input value={form.location} onChange={handleChange('location')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Barcode</label>
            <Input value={form.barcode} onChange={handleChange('barcode')} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Image URL</label>
            <Input value={form.image_url} onChange={handleChange('image_url')} />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 mt-1">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
