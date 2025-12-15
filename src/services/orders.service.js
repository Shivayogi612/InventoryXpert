import { supabase } from './supabase'
import { transactionsService } from './transactions.service'
import { cacheService } from './cache.service'

export const ordersService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(id, name, contact_person, email, phone),
          items:purchase_order_items(*)
        `)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data || []
        } catch (err) {
            console.error('Error fetching orders:', err)
            return []
        }
    },

    async getById(id) {
        try {
            if (!id) return null
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(*)
        `)
                .eq('id', id)
                .single()
            if (error) throw error
            return data
        } catch (err) {
            console.error('Error fetching order by id:', err)
            return null
        }
    },

    async getByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(id, name, contact_person, email, phone),
          items:purchase_order_items(*)
        `)
                .eq('status', status)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data || []
        } catch (err) {
            console.error('Error fetching orders by status:', err)
            return []
        }
    },

    async getActiveOrders() {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(id, name, contact_person, email, phone),
          items:purchase_order_items(*)
        `)
                .in('status', ['pending', 'shipped'])
                .order('expected_delivery', { ascending: true })
            if (error) throw error
            return data || []
        } catch (err) {
            console.error('Error fetching active orders:', err)
            return []
        }
    },

    async getDelayedOrders() {
        try {
            const today = new Date().toISOString().split('T')[0]
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(id, name, contact_person, email, phone),
          items:purchase_order_items(*)
        `)
                .or(`status.eq.delayed,and(status.neq.delivered,expected_delivery.lt.${today})`)
                .order('expected_delivery', { ascending: true })
            if (error) throw error
            return data || []
        } catch (err) {
            console.error('Error fetching delayed orders:', err)
            return []
        }
    },

    async create(payload) {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .insert([payload])
                .select()
                .single()
            if (error) throw error

            // Clear cache
            await cacheService.clear('orders')

            return data
        } catch (err) {
            console.error('Error creating order:', err)
            throw err
        }
    },

    async update(id, payload) {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .update(payload)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error

            // Clear cache
            await cacheService.clear('orders')

            return data
        } catch (err) {
            console.error('Error updating order:', err)
            throw err
        }
    },

    async updateStatus(id, status) {
        try {
            const payload = { status }

            // If marking as delivered, set actual delivery date
            if (status === 'delivered') {
                payload.actual_delivery = new Date().toISOString().split('T')[0]
            }

            const { data, error } = await supabase
                .from('purchase_orders')
                .update(payload)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error

            // Clear cache
            await cacheService.clear('orders')

            return data
        } catch (err) {
            console.error('Error updating order status:', err)
            throw err
        }
    },

    /**
     * Mark order as delivered and create a transaction record
     * This syncs the purchase order with the transactions/inventory system
     * 
     * Note: This creates a general transaction record for the order.
     * For detailed item-level tracking, use purchase_order_items table.
     */
    async markAsDelivered(orderId, userId = null) {
        try {
            // Get order
            const order = await this.getById(orderId)
            if (!order) throw new Error('Order not found')

            if (order.status === 'delivered') {
                throw new Error('Order is already marked as delivered')
            }

            // Check if order has items in purchase_order_items table
            const { data: items, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('order_id', orderId)

            if (itemsError) console.warn('Error fetching order items:', itemsError)

            let transactionsCreated = 0

            // If items exist in purchase_order_items, create transactions for each
            if (items && items.length > 0) {
                console.log(`Processing ${items.length} items from purchase_order_items`)

                const transactionPromises = items.map(async (item) => {
                    if (!item.product_id) {
                        console.warn(`Skipping item ${item.product_name} - no product_id linked`)
                        return null
                    }

                    try {
                        await transactionsService.record({
                            product_id: item.product_id,
                            type: 'in',
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            reason: 'Purchase Order Received',
                            reference_number: order.order_number,
                            notes: `Received from ${order.supplier?.name || 'supplier'} - PO ${order.order_number}`,
                            performed_by: userId
                        })
                        return true
                    } catch (err) {
                        console.error(`Failed to create transaction for item ${item.product_name}:`, err)
                        throw new Error(`Failed to update inventory for ${item.product_name}: ${err.message}`)
                    }
                })

                const results = await Promise.all(transactionPromises)
                transactionsCreated = results.filter(r => r !== null).length
            } else {
                // No items in purchase_order_items table
                // Just update the order status - user will manually update inventory
                console.log('No items found in purchase_order_items table - marking order as delivered without creating transactions')
                transactionsCreated = 0
            }

            // Update order status to delivered
            const updatedOrder = await this.updateStatus(orderId, 'delivered')

            // Clear all relevant caches
            await cacheService.clear('orders')
            await cacheService.clear('transactions')
            await cacheService.clear('products')
            await cacheService.clear('alerts')

            const message = transactionsCreated > 0
                ? `Order ${order.order_number} marked as delivered. ${transactionsCreated} items added to inventory.`
                : `Order ${order.order_number} marked as delivered. Note: No items were found to add to inventory. Please manually update inventory if needed.`

            return {
                order: updatedOrder,
                transactionsCreated,
                message
            }
        } catch (err) {
            console.error('Error marking order as delivered:', err)
            throw err
        }
    },

    async remove(id) {
        try {
            const { error } = await supabase
                .from('purchase_orders')
                .delete()
                .eq('id', id)
            if (error) throw error

            // Clear cache
            await cacheService.clear('orders')

            return true
        } catch (err) {
            console.error('Error deleting order:', err)
            throw err
        }
    },

    // Generate order number
    generateOrderNumber() {
        const year = new Date().getFullYear()
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        return `PO-${year}-${random}`
    },

    /**
     * Add item to purchase order
     */
    async addOrderItem(orderId, item) {
        try {
            const { data, error } = await supabase
                .from('purchase_order_items')
                .insert([{
                    order_id: orderId,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }])
                .select()
                .single()

            if (error) throw error

            // Update order totals
            await this.updateOrderTotals(orderId)

            return data
        } catch (err) {
            console.error('Error adding order item:', err)
            throw err
        }
    },

    /**
     * Update order totals based on items
     */
    async updateOrderTotals(orderId) {
        try {
            const { data: items, error } = await supabase
                .from('purchase_order_items')
                .select('quantity, unit_price')
                .eq('order_id', orderId)

            if (error) throw error

            const itemsCount = items.length
            const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

            await this.update(orderId, {
                items_count: itemsCount,
                total_value: totalValue
            })
        } catch (err) {
            console.error('Error updating order totals:', err)
            throw err
        }
    }
}