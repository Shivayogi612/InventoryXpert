import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Package } from 'lucide-react'
import { suppliersService } from '../services/suppliers.service'
import { productsService } from '../services/products.service'
import { ordersService } from '../services/orders.service'

export default function CreateOrderModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1) // 1: Select Supplier, 2: Add Items, 3: Review
    const [suppliers, setSuppliers] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)

    // Order data
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [orderItems, setOrderItems] = useState([])
    const [expectedDelivery, setExpectedDelivery] = useState('')
    const [notes, setNotes] = useState('')
    
    // Temporary products that will be added to inventory when order is created
    const [tempProducts, setTempProducts] = useState([])
    const [supplierTempProducts, setSupplierTempProducts] = useState([])

    // Load suppliers and products
    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const loadData = async () => {
        try {
            const [suppliersData, productsData] = await Promise.all([
                suppliersService.getAll(),
                productsService.getAll()
            ])
            setSuppliers(suppliersData || [])
            setProducts(productsData || [])
        } catch (err) {
            console.error('Error loading data:', err)
        }
    }

    // Load temporary products for selected supplier
    useEffect(() => {
        if (selectedSupplier) {
            try {
                // Load temporary products from localStorage for this supplier
                const storedTempProducts = localStorage.getItem(`tempProducts_${selectedSupplier.id}`)
                if (storedTempProducts) {
                    setSupplierTempProducts(JSON.parse(storedTempProducts))
                } else {
                    setSupplierTempProducts([])
                }
            } catch (err) {
                console.error('Error loading supplier temp products:', err)
                setSupplierTempProducts([])
            }
        } else {
            setSupplierTempProducts([])
        }
    }, [selectedSupplier])

    // Filter products by selected supplier - only show products from this supplier
    const availableProducts = products.filter(p =>
        p.supplier && selectedSupplier && p.supplier.toLowerCase().includes(selectedSupplier.name.toLowerCase())
    )

    const addItem = (product) => {
        const existing = orderItems.find(item => item.product_id === product.id)
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setOrderItems([...orderItems, {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                unit_price: product.price || 0
            }])
        }
    }

    const addTempProduct = () => {
        const newTempProduct = {
            id: `temp-${Date.now()}`,
            product_name: `New Product ${tempProducts.length + 1}`,
            quantity: 1,
            unit_price: 0
        }
        setTempProducts([...tempProducts, newTempProduct])
    }

    const addSupplierTempProduct = (tempProduct) => {
        // Convert supplier temp product to order temp product
        const orderTempProduct = {
            id: `order-${tempProduct.id}`,
            product_name: tempProduct.name,
            quantity: 1,
            unit_price: Number(tempProduct.price) || 0
        }
        setTempProducts([...tempProducts, orderTempProduct])
    }

    const updateTempProduct = (id, field, value) => {
        setTempProducts(tempProducts.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const removeTempProduct = (id) => {
        setTempProducts(tempProducts.filter(item => item.id !== id))
    }

    const updateItemQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId)
        } else {
            setOrderItems(orderItems.map(item =>
                item.product_id === productId
                    ? { ...item, quantity: parseInt(quantity) || 0 }
                    : item
            ))
        }
    }

    const updateItemPrice = (productId, price) => {
        setOrderItems(orderItems.map(item =>
            item.product_id === productId
                ? { ...item, unit_price: parseFloat(price) || 0 }
                : item
        ))
    }

    const removeItem = (productId) => {
        setOrderItems(orderItems.filter(item => item.product_id !== productId))
    }

    const calculateTotal = () => {
        const regularItemsTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const tempItemsTotal = tempProducts.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        return regularItemsTotal + tempItemsTotal
    }

    const handleCreateOrder = async () => {
        if (!selectedSupplier) {
            alert('Please select a supplier')
            return
        }
        if (orderItems.length === 0 && tempProducts.length === 0) {
            alert('Please add at least one item')
            return
        }

        setLoading(true)
        try {
            // Create purchase order
            const orderData = {
                order_number: ordersService.generateOrderNumber(),
                supplier_id: selectedSupplier.id,
                status: 'pending',
                items_count: orderItems.length + tempProducts.length,
                total_value: calculateTotal(),
                order_date: new Date().toISOString().split('T')[0],
                expected_delivery: expectedDelivery || null,
                notes: notes
            }

            const order = await ordersService.create(orderData)

            // Add regular items to the order
            for (const item of orderItems) {
                await ordersService.addOrderItem(order.id, item)
            }

            // Add temporary products to the order and save them to inventory
            for (const tempItem of tempProducts) {
                // Check if this is a supplier temp product (has more details)
                const isSupplierTempProduct = tempItem.product_name && !tempItem.id.toString().startsWith('temp-') && tempItem.id.toString().startsWith('order-temp-')
                
                // Create the product in inventory first
                const productPayload = {
                    name: tempItem.product_name,
                    sku: `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    supplier: selectedSupplier.name,
                    price: tempItem.unit_price,
                    cost: tempItem.unit_price, // Using same value for cost as price
                    quantity: 0, // Will be updated when order is delivered
                    is_active: true
                }

                try {
                    const createdProduct = await productsService.create(productPayload)
                    
                    // Add the newly created product to the order
                    await ordersService.addOrderItem(order.id, {
                        product_id: createdProduct.id,
                        product_name: tempItem.product_name,
                        quantity: tempItem.quantity,
                        unit_price: tempItem.unit_price
                    })
                } catch (err) {
                    console.error('Error creating temporary product:', err)
                    // Continue with other items even if one fails
                }
            }

            // Clear the supplier's temporary products from localStorage since they've been ordered
            localStorage.removeItem(`tempProducts_${selectedSupplier.id}`)

            alert(`Purchase Order ${orderData.order_number} created successfully!`)
            onSuccess()
            handleClose()
        } catch (err) {
            console.error('Error creating order:', err)
            alert(`Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setStep(1)
        setSelectedSupplier(null)
        setOrderItems([])
        setTempProducts([])
        setSupplierTempProducts([])
        setExpectedDelivery('')
        setNotes('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-backdrop" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create Purchase Order</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Step Indicator */}
                    <div className="steps-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Select Supplier</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Add Items</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Review & Create</div>
                        </div>
                    </div>

                    {/* Step 1: Select Supplier */}
                    {step === 1 && (
                        <div className="step-content">
                            <h3 className="step-title">Select a Supplier</h3>
                            <div className="suppliers-list">
                                {suppliers.map(supplier => (
                                    <div
                                        key={supplier.id}
                                        className={`supplier-option ${selectedSupplier?.id === supplier.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSupplier(supplier)}
                                    >
                                        <div className="supplier-info">
                                            <div className="supplier-name">{supplier.name}</div>
                                            <div className="supplier-contact">{supplier.contact_person}</div>
                                            <div className="supplier-email">{supplier.email}</div>
                                        </div>
                                        {selectedSupplier?.id === supplier.id && (
                                            <div className="check-icon">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={handleClose}>Cancel</button>
                                <button
                                    className="btn-primary"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedSupplier}
                                >
                                    Next: Add Items
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Add Items */}
                    {step === 2 && (
                        <div className="step-content">
                            <h3 className="step-title">Add Items from {selectedSupplier?.name}</h3>

                            {/* Available Products */}
                            <div className="products-section">
                                <h4 className="section-label">Available Products</h4>
                                {availableProducts.length === 0 ? (
                                    <div className="empty-state-small">
                                        <Package size={32} className="text-gray-400" />
                                        <p>No products found for {selectedSupplier?.name}.</p>
                                        <p className="text-sm text-gray-500">
                                            Make sure products have the supplier field set to "{selectedSupplier?.name}".
                                        </p>
                                    </div>
                                ) : (
                                    <div className="products-grid">
                                        {availableProducts.map(product => (
                                            <div key={product.id} className="product-card">
                                                <div className="product-info">
                                                    <div className="product-name">{product.name}</div>
                                                    <div className="product-details">
                                                        SKU: {product.sku} | Stock: {product.quantity}
                                                    </div>
                                                    <div className="product-price">₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </div>
                                                <button
                                                    className="btn-add-item"
                                                    onClick={() => addItem(product)}
                                                >
                                                    <Plus size={16} />
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Supplier Temporary Products Section */}
                            {supplierTempProducts.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="section-label">Supplier Predefined Products</h4>
                                    <div className="border border-gray-200 rounded-lg p-3 mb-4">
                                        {supplierTempProducts.map((tempProduct) => (
                                            <div key={tempProduct.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 mb-2 bg-blue-50 rounded">
                                                <div className="flex-1">
                                                    <div className="font-medium">{tempProduct.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {tempProduct.sku && `SKU: ${tempProduct.sku} | `}
                                                        Price: ₹{Number(tempProduct.price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => addSupplierTempProduct(tempProduct)}
                                                >
                                                    Add to Order
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Temporary Products Section */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="section-label">New Products</h4>
                                    <button 
                                        type="button" 
                                        className="btn-secondary flex items-center gap-1"
                                        onClick={addTempProduct}
                                    >
                                        <Plus size={16} />
                                        Add New Product
                                    </button>
                                </div>
                                
                                {tempProducts.length > 0 && (
                                    <div className="border border-gray-200 rounded-lg p-3 mb-4">
                                        {tempProducts.map((item) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 mb-2 bg-gray-50 rounded">
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    value={item.product_name}
                                                    onChange={(e) => updateTempProduct(item.id, 'product_name', e.target.value)}
                                                    placeholder="Product name"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="form-input w-20"
                                                        value={item.quantity}
                                                        onChange={(e) => updateTempProduct(item.id, 'quantity', e.target.value)}
                                                        min="1"
                                                    />
                                                    <span className="text-gray-500">×</span>
                                                    <input
                                                        type="number"
                                                        className="form-input w-24"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateTempProduct(item.id, 'unit_price', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    onClick={() => removeTempProduct(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Items */}
                            {(orderItems.length > 0 || tempProducts.length > 0) && (
                                <div className="selected-items-section">
                                    <h4 className="section-label">Order Items ({orderItems.length + tempProducts.length})</h4>
                                    <div className="items-list">
                                        {orderItems.map(item => (
                                            <div key={item.product_id} className="order-item">
                                                <div className="item-name">{item.product_name}</div>
                                                <div className="item-controls">
                                                    <input
                                                        type="number"
                                                        className="item-input"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQuantity(item.product_id, e.target.value)}
                                                        min="1"
                                                    />
                                                    <span className="item-label">×</span>
                                                    <input
                                                        type="number"
                                                        className="item-input"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItemPrice(item.product_id, e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    <span className="item-total">₹{(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => removeItem(item.product_id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {tempProducts.map(item => (
                                            <div key={item.id} className="order-item bg-blue-50">
                                                <div className="item-name">{item.product_name} (New)</div>
                                                <div className="item-controls">
                                                    <input
                                                        type="number"
                                                        className="item-input"
                                                        value={item.quantity}
                                                        onChange={(e) => updateTempProduct(item.id, 'quantity', e.target.value)}
                                                        min="1"
                                                    />
                                                    <span className="item-label">×</span>
                                                    <input
                                                        type="number"
                                                        className="item-input"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateTempProduct(item.id, 'unit_price', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    <span className="item-total">₹{(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => removeTempProduct(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <span className="total-amount">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                                <button
                                    className="btn-primary"
                                    onClick={() => setStep(3)}
                                    disabled={(orderItems.length === 0 && tempProducts.length === 0)}
                                >
                                    Next: Review
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Create */}
                    {step === 3 && (
                        <div className="step-content">
                            <h3 className="step-title">Review Purchase Order</h3>

                            <div className="review-section">
                                <div className="review-item">
                                    <label>Supplier:</label>
                                    <span>{selectedSupplier?.name}</span>
                                </div>
                                <div className="review-item">
                                    <label>Items:</label>
                                    <span>{orderItems.length + tempProducts.length} items</span>
                                </div>
                                <div className="review-item">
                                    <label>Total Value:</label>
                                    <span className="total-value">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="review-item">
                                    <label>Expected Delivery:</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={expectedDelivery}
                                        onChange={(e) => setExpectedDelivery(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="review-item">
                                    <label>Notes:</label>
                                    <textarea
                                        className="form-textarea"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes or special instructions..."
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="items-summary">
                                <h4 className="section-label">Order Items</h4>
                                {orderItems.map(item => (
                                    <div key={item.product_id} className="summary-item">
                                        <span>{item.product_name}</span>
                                        <span>{item.quantity} × ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ₹{(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                                
                                {tempProducts.map(item => (
                                    <div key={item.id} className="summary-item bg-blue-50">
                                        <span>{item.product_name} (New Product)</span>
                                        <span>{item.quantity} × ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ₹{(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleCreateOrder}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Purchase Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}