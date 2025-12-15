import React, { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { suppliersService } from '../services/suppliers.service'
import { ordersService } from '../services/orders.service'
import { Package, Truck, AlertCircle, Plus, Phone, Mail, MapPin, Calendar, CheckCircle, Trash2, Edit } from 'lucide-react'
import CreateOrderModal from '../components/CreateOrderModal'
import AddSupplierModal from '../components/AddSupplierModal'
import EditSupplierModal from '../components/EditSupplierModal'
import DeleteSupplierModal from '../components/DeleteSupplierModal'
import { toast } from 'react-hot-toast'
import { downloadPurchaseOrderPdf } from '../utils/purchaseOrderPdf'
import { formatCurrency } from '../utils/currency'

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="metric-card">
            <div className="flex items-center justify-between">
                <div>
                    <div className="metric-label">{label}</div>
                    <div className="metric-value">{value}</div>
                </div>
                <div className={`metric-icon ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    )
}

function SupplierCard({ supplier, onRefresh }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    
    return (
        <>
            <div className="supplier-card">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="supplier-name">{supplier.name}</h3>
                        <p className="supplier-contact">{supplier.contact_person || 'No contact'}</p>
                    </div>
                    <div className="supplier-rating">
                        ⭐ {supplier.rating || 0}
                    </div>
                </div>
                <div className="supplier-details">
                    <div className="detail-item">
                        <Mail size={14} />
                        <span>{supplier.email || 'No email'}</span>
                    </div>
                    <div className="detail-item">
                        <Phone size={14} />
                        <span>{supplier.phone || 'No phone'}</span>
                    </div>
                    <div className="detail-item">
                        <MapPin size={14} />
                        <span>{supplier.address || 'No address'}</span>
                    </div>
                </div>
                <div className="supplier-actions">
                    <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
                        <Edit size={16} />
                        Manage
                    </button>
                    <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {showEditModal && (
                <EditSupplierModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    supplier={supplier}
                    onSuccess={() => {
                        onRefresh?.()
                        setShowEditModal(false)
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteSupplierModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    supplier={supplier}
                    onSuccess={() => {
                        onRefresh?.()
                        setShowDeleteModal(false)
                    }}
                />
            )}
        </>
    )
}

// Order Item Row Component
function OrderItemRow({ order, onMarkDelivered, onDownloadPdf }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        delayed: 'bg-orange-100 text-orange-800'
    }

    return (
        <>
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                    <div className="font-medium">{order.order_number}</div>
                    <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-3">
                    <div className="font-medium">{order.supplier?.name || 'Unknown Supplier'}</div>
                    <div className="text-sm text-gray-500">{order.supplier?.contact_person || ''}</div>
                </td>
                <td className="px-4 py-3">
                    <div className="text-sm">
                        {order.items_count} items
                    </div>
                    <div className="text-sm text-gray-500">
                        {formatCurrency(order.total_value || 0)}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.expected_delivery && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(order.expected_delivery).toLocaleDateString()}
                        </div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onDownloadPdf(order)}
                            className="btn-secondary text-sm px-3 py-1"
                        >
                            PDF
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                                onClick={() => onMarkDelivered(order.id)}
                                className="btn-primary text-sm px-3 py-1"
                            >
                                Mark Delivered
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        </>
    )
}

export default function SupplierOrders() {
    const [activeTab, setActiveTab] = useState('orders')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showAddSupplier, setShowAddSupplier] = useState(false)
    const [autoGenerating, setAutoGenerating] = useState(false)
    const [autoSummary, setAutoSummary] = useState(null)

    // Fetch data from Supabase
    const { data: products = [] } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
    const {
        data: suppliers = [],
        refresh: refreshSuppliers
    } = useCache('suppliers', () => suppliersService.getAll(), { staleTime: 5 * 60 * 1000 })
    const {
        data: orders = [],
        refresh: refreshOrders
    } = useCache('orders', () => ordersService.getAll(), { staleTime: 2 * 60 * 1000 })

    const productsList = products || []
    const suppliersList = suppliers || []
    const ordersList = orders || []

    // Calculate low stock items that need ordering
    const lowStockItems = useMemo(() => {
        return productsList.filter((p) => {
            const qty = Number(p?.quantity || 0)
            const reorder = Number(p?.reorder_level)
            const threshold = reorder > 0 ? reorder : 5
            return qty <= threshold
        })
    }, [productsList])

    const supplierLookup = useMemo(() => {
        return suppliersList.reduce((acc, supplier) => {
            if (supplier?.name) {
                acc[supplier.name.trim().toLowerCase()] = supplier
            }
            return acc
        }, {})
    }, [suppliersList])

    const actionableLowStock = useMemo(() => {
        return lowStockItems.filter((product) => {
            const key = (product.supplier || '').trim().toLowerCase()
            return key && supplierLookup[key]
        })
    }, [lowStockItems, supplierLookup])

    // Calculate stats
    const stats = useMemo(() => {
        const activeOrders = ordersList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length
        const delayedOrders = ordersList.filter(o => {
            if (o.status === 'delayed') return true
            if (o.status === 'delivered' || o.status === 'cancelled') return false
            if (o.expected_delivery) {
                return new Date(o.expected_delivery) < new Date()
            }
            return false
        }).length

        return {
            totalSuppliers: suppliersList.length,
            activeOrders,
            lowStockItems: lowStockItems.length,
            delayedOrders
        }
    }, [suppliersList.length, ordersList, lowStockItems.length])

    const handleMarkAsDelivered = async (orderId) => {
        if (!window.confirm('This will add all items to inventory and create transactions. Are you sure?')) return
        
        try {
            const result = await ordersService.markAsDelivered(orderId)
            toast.success(result.message)
            await refreshOrders?.()
        } catch (err) {
            console.error('Error marking order as delivered:', err)
            toast.error(err.message || 'Failed to mark order as delivered')
        }
    }

    const handleDownloadPdf = async (order) => {
        try {
            await downloadPurchaseOrderPdf(order)
            toast.success('Purchase order downloaded')
        } catch (err) {
            console.error('Error downloading PDF:', err)
            toast.error('Failed to download purchase order')
        }
    }

    const handleAutoGenerateOrders = async () => {
        if (actionableLowStock.length === 0) return
        
        if (!window.confirm(`This will generate ${actionableLowStock.length} purchase order(s). Continue?`)) return
        
        setAutoGenerating(true)
        try {
            // Group items by supplier
            const supplierGroups = actionableLowStock.reduce((acc, product) => {
                const supplierKey = (product.supplier || '').trim().toLowerCase()
                const supplier = supplierLookup[supplierKey]
                
                if (!supplier) return acc
                
                if (!acc[supplier.id]) {
                    acc[supplier.id] = {
                        supplier,
                        items: []
                    }
                }
                
                acc[supplier.id].items.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: Math.max(
                        (product.max_stock_level || 0) - (product.quantity || 0),
                        10 // Minimum order quantity
                    ),
                    unit_price: product.cost || product.price || 0
                })
                
                return acc
            }, {})

            // Create purchase orders for each supplier
            const createdOrders = []
            for (const [supplierId, group] of Object.entries(supplierGroups)) {
                const orderData = {
                    order_number: ordersService.generateOrderNumber(),
                    supplier_id: group.supplier.id,
                    status: 'pending',
                    items_count: group.items.length,
                    total_value: group.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
                    order_date: new Date().toISOString().split('T')[0],
                    notes: 'Auto-generated order for low stock items'
                }

                const order = await ordersService.create(orderData)
                
                // Create order items
                for (const item of group.items) {
                    await ordersService.createOrderItem({
                        order_id: order.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit_price: item.unit_price
                    })
                }

                createdOrders.push({
                    ...order,
                    supplier: group.supplier
                })
            }

            setAutoSummary(createdOrders)
            await refreshOrders?.()
            toast.success(`Successfully generated ${createdOrders.length} purchase order(s)`)
        } catch (err) {
            console.error('Error auto-generating orders:', err)
            toast.error('Failed to generate purchase orders')
        } finally {
            setAutoGenerating(false)
        }
    }

    return (
        <Layout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Supplier Orders</h1>
                        <p className="page-subtitle">Manage suppliers and purchase orders</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => refreshOrders?.()}>
                            Refresh Orders
                        </button>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            <span className="hidden sm:inline ml-1">New Purchase Order</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>
                </div>

                {/* Stats - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={Package} label="Total Suppliers" value={stats.totalSuppliers} color="icon-purple" />
                    <StatCard icon={Truck} label="Active Orders" value={stats.activeOrders} color="icon-green" />
                    <StatCard icon={AlertCircle} label="Low Stock Items" value={stats.lowStockItems} color="icon-orange" />
                    <StatCard icon={AlertCircle} label="Delayed Orders" value={stats.delayedOrders} color="icon-red" />
                </div>

                {/* Tabs - Scrollable on mobile */}
                <div className="tabs-container overflow-x-auto pb-2 mb-4">
                    <div className="flex min-w-max">
                        <button
                            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Purchase Orders
                        </button>
                        <button
                            className={`tab ${activeTab === 'suppliers' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('suppliers')}
                        >
                            Suppliers
                        </button>
                        <button
                            className={`tab ${activeTab === 'auto-orders' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('auto-orders')}
                        >
                            Auto-Generate Orders
                        </button>
                    </div>
                </div>

                {activeTab === 'orders' && (
                    <div className="card">
                        {ordersList.length === 0 ? (
                            <div className="empty-state">
                                <Package size={48} className="text-gray-300 mb-3" />
                                <h3>No purchase orders yet</h3>
                                <p>Create your first purchase order to get started.</p>
                                <button className="btn-primary mt-3" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} />
                                    Create Purchase Order
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {ordersList.map(order => (
                                                <OrderItemRow
                                                    key={order.id}
                                                    order={order}
                                                    onMarkDelivered={handleMarkAsDelivered}
                                                    onDownloadPdf={handleDownloadPdf}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'suppliers' && (
                    <div className="suppliers-grid">
                        {suppliersList.length === 0 && (
                            <div className="supplier-card empty-suppliers-card">
                                <Package size={36} className="text-gray-300" />
                                <h3>No suppliers yet</h3>
                                <p>Add your first supplier to start creating purchase orders.</p>
                                <button className="btn-primary mt-2" onClick={() => setShowAddSupplier(true)}>
                                    <Plus size={18} />
                                    Add Supplier
                                </button>
                            </div>
                        )}
                        {suppliersList.map(supplier => (
                            <SupplierCard 
                                key={supplier.id} 
                                supplier={supplier} 
                                onRefresh={refreshSuppliers}
                            />
                        ))}
                        <button
                            type="button"
                            className="supplier-card add-supplier-card"
                            onClick={() => setShowAddSupplier(true)}
                        >
                            <div className="add-supplier-content">
                                <Plus size={48} className="add-icon" />
                                <h3>Add New Supplier</h3>
                                <p>Register a new supplier to your network</p>
                            </div>
                        </button>
                    </div>
                )}

                {activeTab === 'auto-orders' && (
                    <div className="chart-card">
                        <h3 className="chart-title mb-4">Auto-Generate Purchase Orders</h3>
                        <p className="mb-4 text-gray-600">The following items are below reorder level and need restocking:</p>

                        {lowStockItems.length === 0 ? (
                            <div className="empty-state">
                                <CheckCircle size={48} className="text-green-500 mb-3" />
                                <h3 className="text-lg font-semibold mb-2">All Stock Levels Good!</h3>
                                <p className="text-gray-600">No items currently need reordering.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Current Stock</th>
                                                    <th>Reorder Level</th>
                                                    <th>Max Stock</th>
                                                    <th>Supplier</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lowStockItems.map((product) => {
                                                    const currentQty = Number(product.quantity || 0)
                                                    const reorderLevel = Number(product.reorder_level || 0)
                                                    const maxStock = Number(product.max_stock_level || 0)
                                                    const supplierKey = (product.supplier || '').trim().toLowerCase()
                                                    const supplierMatch = supplierLookup[supplierKey]

                                                    return (
                                                        <tr key={product.id}>
                                                            <td>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-sm text-gray-500">{product.sku}</div>
                                                            </td>
                                                            <td>
                                                                <span className={`${currentQty <= reorderLevel ? 'text-red-600 font-medium' : ''}`}>
                                                                    {currentQty}
                                                                </span>
                                                            </td>
                                                            <td>{reorderLevel}</td>
                                                            <td>{maxStock}</td>
                                                            <td>
                                                                {supplierMatch ? (
                                                                    <span className="text-green-600">{supplierMatch.name}</span>
                                                                ) : (
                                                                    <span className="text-orange-600">Not linked</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {actionableLowStock.length === 0 && (
                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex">
                                                <AlertCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
                                                <div>
                                                    <h4 className="font-medium text-yellow-800">No Actionable Items</h4>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        Some items are low stock, but they don't have a matching supplier in your supplier list.
                                                        Add suppliers or update product supplier names to enable auto-generation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <button
                                            className="btn-primary w-full md:w-auto"
                                            disabled={autoGenerating || actionableLowStock.length === 0}
                                            onClick={handleAutoGenerateOrders}
                                        >
                                            {autoGenerating
                                                ? 'Generating purchase orders...'
                                                : `Generate Purchase Orders for All (${actionableLowStock.length} items)`}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => window.location.reload()}
            />
            <AddSupplierModal
                isOpen={showAddSupplier}
                onClose={() => setShowAddSupplier(false)}
                onSuccess={() => {
                    refreshSuppliers?.()
                }}
            />
        </Layout>
    )
}