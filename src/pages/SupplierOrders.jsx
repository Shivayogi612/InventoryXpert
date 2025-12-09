import React, { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { suppliersService } from '../services/suppliers.service'
import { ordersService } from '../services/orders.service'
import { Package, Truck, AlertCircle, Plus, Phone, Mail, MapPin, Calendar, CheckCircle } from 'lucide-react'
import CreateOrderModal from '../components/CreateOrderModal'
import AddSupplierModal from '../components/AddSupplierModal'
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

function SupplierCard({ supplier }) {
    return (
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
            <div className="mt-4 flex gap-2">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">View Orders</button>
            </div>
        </div>
    )
}

function OrderRow({ order, onMarkDelivered, onDownloadPdf }) {
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const statusColors = {
        pending: 'status-pending',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        delayed: 'status-delayed',
        cancelled: 'status-delayed'
    }

    const handleDownloadPdf = async () => {
        if (!onDownloadPdf) return
        setDownloading(true)
        try {
            await onDownloadPdf(order.id)
        } catch (err) {
            console.error('Error downloading PDF:', err)
        } finally {
            setDownloading(false)
        }
    }

    const statusIcons = {
        pending: AlertCircle,
        shipped: Truck,
        delivered: CheckCircle,
        delayed: AlertCircle,
        cancelled: AlertCircle
    }

    const StatusIcon = statusIcons[order.status] || AlertCircle
    const isDelayed = order.status === 'delayed' || (order.expected_delivery && new Date(order.expected_delivery) < new Date() && order.status !== 'delivered')

    const handleMarkDelivered = async () => {
        if (window.confirm(`Mark order ${order.order_number} as delivered? This will add all items to inventory and create transactions.`)) {
            setLoading(true)
            try {
                await onMarkDelivered(order.id)
            } catch (err) {
                console.error('Error marking as delivered:', err)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <tr className="order-row">
            <td className="order-cell">
                <div className="order-number">{order.order_number}</div>
                <div className="order-date">{new Date(order.order_date || order.created_at).toLocaleDateString()}</div>
            </td>
            <td className="order-cell">{order.supplier?.name || 'Unknown'}</td>
            <td className="order-cell">{order.items_count || 0} items</td>
            <td className="order-cell">{formatCurrency(order.total_value || 0, { maximumFractionDigits: 0 })}</td>
            <td className="order-cell">
                <span className={`status-badge ${statusColors[order.status]}`}>
                    <StatusIcon size={14} />
                    {order.status}
                </span>
            </td>
            <td className="order-cell">
                <div className="delivery-info">
                    <Calendar size={14} />
                    <span className={isDelayed ? 'text-red-600' : ''}>
                        {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            </td>
            <td className="order-cell">
                <div className="flex gap-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                            className="btn-action"
                            onClick={handleMarkDelivered}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Mark Delivered'}
                        </button>
                    )}
                    {order.status === 'delivered' && (
                        <span className="text-green-600 text-sm">✓ Delivered</span>
                    )}
                    <button
                        className="btn-secondary"
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                    >
                        {downloading ? 'Preparing...' : 'Download PDF'}
                    </button>
                </div>
            </td>
        </tr>
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
    }, [suppliersList, ordersList, lowStockItems])

    const calculateAutoQuantity = (product) => {
        const reorder = Number(product?.reorder_level) || 5
        const current = Number(product?.quantity) || 0
        const target = Math.max(reorder * 2, reorder + 5)
        const qty = Math.max(target - current, reorder || 5)
        return qty
    }

    const handleAutoGenerateOrders = async () => {
        if (autoGenerating) return

        const unmatchedProducts = []
        const grouped = actionableLowStock.reduce((acc, product) => {
            const key = (product.supplier || '').trim().toLowerCase()
            const supplier = supplierLookup[key]
            if (!supplier) {
                unmatchedProducts.push(product)
                return acc
            }

            const quantity = calculateAutoQuantity(product)
            const unitPrice = Number(product.cost || product.price || 0)

            if (!acc[supplier.id]) {
                acc[supplier.id] = {
                    supplier,
                    items: []
                }
            }

            acc[supplier.id].items.push({
                product_id: product.id,
                product_name: product.name,
                quantity,
                unit_price: unitPrice
            })

            return acc
        }, {})

        const supplierIds = Object.keys(grouped)
        if (supplierIds.length === 0) {
            toast.error('No low-stock items have a matching supplier. Set supplier name on products first.')
            return
        }

        setAutoGenerating(true)
        setAutoSummary(null)

        try {
            const createdOrders = []
            const defaultLeadTimeDays = 7

            for (const supplierId of supplierIds) {
                const group = grouped[supplierId]
                const expectedDeliveryDate = new Date()
                expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + defaultLeadTimeDays)

                const orderPayload = {
                    order_number: ordersService.generateOrderNumber(),
                    supplier_id: supplierId,
                    status: 'pending',
                    items_count: group.items.length,
                    total_value: 0,
                    order_date: new Date().toISOString().split('T')[0],
                    expected_delivery: expectedDeliveryDate.toISOString().split('T')[0],
                    notes: 'Auto-generated from low stock automation'
                }

                const order = await ordersService.create(orderPayload)
                for (const item of group.items) {
                    await ordersService.addOrderItem(order.id, item)
                }

                createdOrders.push({
                    supplier: group.supplier.name,
                    orderNumber: order.order_number,
                    items: group.items.length
                })
            }

            toast.success(`Generated ${createdOrders.length} purchase order${createdOrders.length > 1 ? 's' : ''}`)
            setAutoSummary({
                createdOrders,
                skipped: lowStockItems.length - actionableLowStock.length + unmatchedProducts.length
            })

            await refreshOrders?.()
        } catch (err) {
            console.error('Auto-generate orders failed', err)
            toast.error(err.message || 'Failed to auto-generate orders')
        } finally {
            setAutoGenerating(false)
        }
    }

    // Handle marking order as delivered
    const handleMarkDelivered = async (orderId) => {
        try {
            const result = await ordersService.markAsDelivered(orderId)
            alert(result.message || 'Order marked as delivered successfully!')

            // Refresh data
            window.location.reload() // Simple refresh - you can use cache.clear() for better UX
        } catch (err) {
            alert(`Error: ${err.message}`)
            throw err
        }
    }

    const handleDownloadPdf = async (orderId) => {
        try {
            const order = await ordersService.getById(orderId)
            if (!order) {
                toast.error('Unable to find that purchase order')
                return
            }
            downloadPurchaseOrderPdf(order)
        } catch (err) {
            console.error('Download PDF failed', err)
            toast.error(err.message || 'Failed to download purchase order PDF')
        }
    }

    return (
        <Layout>
            <div className="dashboard-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Supplier & Order Management</h1>
                        <p className="page-subtitle">Manage suppliers, track orders, and automate purchase orders</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <button className="btn-secondary" onClick={() => refreshOrders?.()}>
                            Refresh Orders
                        </button>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            New Purchase Order
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="metrics-grid">
                    <StatCard icon={Package} label="Total Suppliers" value={stats.totalSuppliers} color="icon-purple" />
                    <StatCard icon={Truck} label="Active Orders" value={stats.activeOrders} color="icon-green" />
                    <StatCard icon={AlertCircle} label="Low Stock Items" value={stats.lowStockItems} color="icon-orange" />
                    <StatCard icon={AlertCircle} label="Delayed Orders" value={stats.delayedOrders} color="icon-red" />
                </div>

                {/* Tabs */}
                <div className="tabs-container">
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

                {/* Content */}
                {activeTab === 'orders' && (
                    <div className="chart-card">
                        <h3 className="chart-title mb-4">Purchase Orders</h3>
                        {ordersList.length === 0 ? (
                            <div className="empty-state">
                                <Package size={48} className="text-gray-400 mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                                <p className="text-gray-600">Create your first purchase order to get started.</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Supplier</th>
                                            <th>Items</th>
                                            <th>Total Value</th>
                                            <th>Status</th>
                                            <th>Expected Delivery</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordersList.map(order => (
                                            <OrderRow
                                                key={order.id}
                                                order={order}
                                                onMarkDelivered={handleMarkDelivered}
                                                onDownloadPdf={handleDownloadPdf}
                                            />
                                        ))}
                                    </tbody>
                                </table>
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
                            <SupplierCard key={supplier.id} supplier={supplier} />
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
                                <div className="low-stock-list">
                                    {lowStockItems.map(product => {
                                        const supplierKey = (product.supplier || '').trim().toLowerCase()
                                        const supplierMatch = supplierKey && supplierLookup[supplierKey]
                                        return (
                                            <div key={product.id} className="low-stock-item">
                                                <div className="flex-1">
                                                    <div className="product-name">{product.name}</div>
                                                    <div className="product-details">
                                                        Current: {product.quantity} | Reorder Level: {product.reorder_level || 5}
                                                        {product.supplier && ` | Supplier: ${product.supplier}`}
                                                    </div>
                                                </div>
                                                <div className="stock-status">
                                                    <span className="stock-badge low">Low Stock</span>
                                                    {!supplierMatch && (
                                                        <span className="stock-badge warning">Set supplier name</span>
                                                    )}
                                                </div>
                                                <button className="btn-action" onClick={() => setShowCreateModal(true)}>
                                                    Add to Order
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-6 space-y-4">
                                    {autoSummary && (
                                        <div className="auto-summary-card">
                                            <div className="auto-summary-header">
                                                <h4>Automation Summary</h4>
                                                <span className="text-sm text-gray-500">
                                                    {autoSummary.createdOrders.length} order{autoSummary.createdOrders.length !== 1 && 's'} created
                                                </span>
                                            </div>
                                            <div className="auto-summary-body">
                                                {autoSummary.createdOrders.map((entry) => (
                                                    <div key={entry.orderNumber} className="auto-summary-row">
                                                        <div>
                                                            <div className="font-medium">{entry.supplier}</div>
                                                            <div className="text-xs text-gray-500">{entry.items} items</div>
                                                        </div>
                                                        <span className="auto-po-chip">{entry.orderNumber}</span>
                                                    </div>
                                                ))}
                                                {autoSummary.skipped > 0 && (
                                                    <p className="text-xs text-amber-600 mt-2">
                                                        {autoSummary.skipped} item(s) skipped due to missing supplier mapping.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
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
