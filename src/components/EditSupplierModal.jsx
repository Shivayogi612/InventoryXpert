import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Star, StickyNote, Plus, Package, Trash2 } from 'lucide-react'
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
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleNewProductChange = (field) => (event) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Supplier name is required'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (form.rating) {
      const ratingValue = Number(form.rating)
      if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        nextErrors.rating = 'Rating must be between 0 and 5'
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleAddTempProduct = () => {
    if (!newProduct.name.trim()) {
      alert('Product name is required')
      return
    }
    
    const tempProduct = {
      id: `temp-${Date.now()}`,
      ...newProduct,
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
                  placeholder="Full name"
                />
              </label>

              <label className="form-field">
                <span>Email Address</span>
                <div className="with-icon">
                  <Mail size={16} />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="contact@supplier.com"
                  />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </label>

              <label className="form-field">
                <span>Phone Number</span>
                <div className="with-icon">
                  <Phone size={16} />
                  <Input
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </label>

              <label className="form-field form-full">
                <span>Address</span>
                <div className="with-icon">
                  <MapPin size={16} />
                  <Input
                    value={form.address}
                    onChange={handleChange('address')}
                    placeholder="Street, City, State"
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Rating</span>
                <div className="with-icon">
                  <Star size={16} />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange('rating')}
                    placeholder="4.5"
                  />
                </div>
                {errors.rating && <p className="field-error">{errors.rating}</p>}
              </label>

              <label className="form-field form-full">
                <span>Notes</span>
                <div className="textarea-wrapper">
                  <StickyNote size={16} />
                  <textarea
                    value={form.notes}
                    onChange={handleChange('notes')}
                    placeholder="Payment terms, preferred products, delivery windows..."
                  />
                </div>
              </label>
            </div>

            {/* Temporary Products Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Temporary Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add new products for this supplier. These will only be saved to inventory when you create a purchase order.
              </p>
              
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
                  <h4 className="font-medium mb-3">Temporary Products ({tempProducts.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tempProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.sku && `SKU: ${product.sku} | `}
                            Price: ₹{Number(product.price || 0).toFixed(2)} | 
                            Cost: ₹{Number(product.cost || 0).toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
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

            <div className="modal-actions">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}