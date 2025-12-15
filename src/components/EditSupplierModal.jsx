import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Star, StickyNote, Plus, Package, Trash2, Info } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'
import { useEnhancedSuppliers } from '../hooks/useEnhancedSuppliers'
import { productsService } from '../services/products.service'

export default function EditSupplierModal({ isOpen, onClose, supplier, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    rating: '',
    notes: ''
  })
  
  const [tempProducts, setTempProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: ''
  })
  
  const [errors, setErrors] = useState({})
  const { updateSupplier, loading } = useEnhancedSuppliers()

  // Initialize form with supplier data
  useEffect(() => {
    if (supplier && isOpen) {
      setForm({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        rating: supplier.rating || '',
        notes: supplier.notes || ''
      })
      
      // Load temporary products for this supplier
      loadTempProducts()
    }
  }, [supplier, isOpen])

  const loadTempProducts = async () => {
    try {
      // Load temporary products from localStorage for this supplier
      const storedTempProducts = localStorage.getItem(`tempProducts_${supplier.id}`)
      if (storedTempProducts) {
        setTempProducts(JSON.parse(storedTempProducts))
      } else {
        setTempProducts([])
      }
    } catch (err) {
      console.error('Error loading temp products:', err)
      setTempProducts([])
    }
  }

  const saveTempProducts = (products) => {
    try {
      // Save temporary products to localStorage for this supplier
      localStorage.setItem(`tempProducts_${supplier.id}`, JSON.stringify(products))
    } catch (err) {
      console.error('Error saving temp products:', err)
    }
  }

  const handleClose = () => {
    setForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      rating: '',
      notes: ''
    })
    setTempProducts([])
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      price: '',
      cost: ''
    })
    setErrors({})
    onClose?.()
  }

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const handleNewProductChange = (field) => (event) => {
    setNewProduct({ ...newProduct, [field]: event.target.value })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Supplier name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddTempProduct = () => {
    if (!newProduct.name.trim()) {
      alert('Product name is required')
      return
    }
    
    const tempProduct = {
      id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim() || null,
      description: newProduct.description.trim() || '',
      price: Number(newProduct.price) || 0,
      cost: Number(newProduct.cost) || 0
    }
    
    const updatedTempProducts = [...tempProducts, tempProduct]
    setTempProducts(updatedTempProducts)
    saveTempProducts(updatedTempProducts)
    
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      price: '',
      cost: ''
    })
  }

  const handleRemoveTempProduct = (id) => {
    const updatedTempProducts = tempProducts.filter(p => p.id !== id)
    setTempProducts(updatedTempProducts)
    saveTempProducts(updatedTempProducts)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      contact_person: form.contact_person.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      rating: form.rating === '' ? null : Number(form.rating)
    }

    try {
      await updateSupplier(supplier.id, payload)
      onSuccess?.()
      handleClose()
    } catch (err) {
      // toast handled in hook
    }
  }

  if (!isOpen || !supplier) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content edit-supplier-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className="icon-badge">
              <User size={18} />
            </span>
            <div>
              <h2 className="modal-title">Edit Supplier</h2>
              <p className="modal-subtitle">Update supplier information and manage products</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <form className="supplier-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Supplier Name *</span>
                <Input
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="E.g. Atlas Components Inc."
                  required
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </label>

              <label className="form-field">
                <span>Primary Contact</span>
                <Input
                  value={form.contact_person}
                  onChange={handleChange('contact_person')}
                  placeholder="John Smith"
                />
              </label>

              <label className="form-field">
                <span>Email</span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="john@atlascomponents.com"
                />
              </label>

              <label className="form-field">
                <span>Phone</span>
                <Input
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </label>

              <label className="form-field md:col-span-2">
                <span>Address</span>
                <Input
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="123 Industrial Blvd, Suite 100, City, State 12345"
                />
              </label>

              <label className="form-field">
                <span>Rating</span>
                <div className="relative">
                  <select
                    value={form.rating}
                    onChange={handleChange('rating')}
                    className="form-select"
                  >
                    <option value="">No rating</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <Star className="absolute right-3 top-3 w-4 h-4 text-yellow-500" />
                </div>
              </label>
            </div>

            <label className="form-field">
              <span>Notes</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={handleChange('notes')}
                placeholder="Additional notes about this supplier..."
                className="form-textarea"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>

          {/* Temporary Products Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Supplier Products</h3>
            
            {/* Info box explaining how this works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-blue-800">How Product Creation Works</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Add products here that this supplier offers. When you create a purchase order for these products, 
                    they will be automatically added to your inventory. This ensures all your products are linked to suppliers.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Add New Product Form */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">Add New Product</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Product Name *"
                  value={newProduct.name}
                  onChange={handleNewProductChange('name')}
                />
                <Input
                  placeholder="SKU"
                  value={newProduct.sku}
                  onChange={handleNewProductChange('sku')}
                />
                <Input
                  placeholder="Selling Price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleNewProductChange('price')}
                />
                <Input
                  placeholder="Cost Price"
                  type="number"
                  value={newProduct.cost}
                  onChange={handleNewProductChange('cost')}
                />
              </div>
              <Input
                placeholder="Description"
                className="mt-3"
                value={newProduct.description}
                onChange={handleNewProductChange('description')}
              />
              <Button 
                type="button" 
                className="mt-3 w-full md:w-auto"
                onClick={handleAddTempProduct}
              >
                <Plus size={16} className="mr-1" />
                Add Product
              </Button>
            </div>
            
            {/* Temporary Products List */}
            {tempProducts.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Supplier Products ({tempProducts.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tempProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {product.sku && `SKU: ${product.sku} | `}
                          Price: ₹{product.price.toFixed(2)} | Cost: ₹{product.cost.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1"
                        onClick={() => handleRemoveTempProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}