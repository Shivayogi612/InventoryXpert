import React, { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dialog from '../components/ui/Dialog'
import Badge from '../components/ui/Badge'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { transactionsService } from '../services/transactions.service'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

// Compact Transaction Item Component
const TransactionItem = ({ transaction, product }) => {
  const getTypeVariant = (type) => {
    switch (type) {
      case 'in': return 'success'
      case 'out': return 'danger'
      case 'adjustment': return 'warning'
      case 'return': return 'default'
      case 'damaged': return 'danger'
      default: return 'default'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'in': return 'IN'
      case 'out': return 'OUT'
      case 'adjustment': return 'ADJ'
      case 'return': return 'RET'
      case 'damaged': return 'DMG'
      default: return type.toUpperCase()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <Badge variant={getTypeVariant(transaction.type)} className="text-xs">
            {getTypeLabel(transaction.type)}
          </Badge>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div>
          <div className="font-medium text-sm">{product?.name || 'Unknown Product'}</div>
          <div className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">{transaction.quantity}</div>
          <div className="text-xs text-gray-500">
            {transaction.previous_quantity} → {transaction.new_quantity}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {transaction.performed_by ? transaction.performed_by.split(' ')[0] : 'Manager'}
        </div>
      </div>
    </motion.div>
  )
}

// River Chart Visualization
const RiverChart = ({ transactions }) => {
  // Group transactions by day
  const dailyData = useMemo(() => {
    const groups = {}
    transactions.forEach(t => {
      const date = new Date(t.created_at).toDateString()
      if (!groups[date]) groups[date] = { date, in: 0, out: 0 }
      if (t.type === 'in') groups[date].in += t.quantity
      if (t.type === 'out') groups[date].out += t.quantity
    })
    return Object.values(groups).slice(-7) // Last 7 days
  }, [transactions])

  const maxValue = Math.max(...dailyData.map(d => Math.max(d.in, d.out)), 1)

  return (
    <div className="p-4">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Last 7 Days</span>
        <span>Activity</span>
      </div>
      <div className="space-y-3">
        {dailyData.map((day, index) => (
          <motion.div 
            key={day.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div className="text-xs text-gray-500 w-16">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="flex-1 flex items-center gap-1">
              <div 
                className="h-6 bg-green-100 rounded-l flex items-center justify-end pr-2 text-green-800 text-xs font-medium"
                style={{ width: `${(day.in / maxValue) * 50}%` }}
              >
                {day.in > 0 && day.in}
              </div>
              <div 
                className="h-6 bg-red-100 rounded-r flex items-center pl-2 text-red-800 text-xs font-medium"
                style={{ width: `${(day.out / maxValue) * 50}%` }}
              >
                {day.out > 0 && day.out}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Compact Stat Card
const CompactStatCard = ({ title, value, change, changeType = 'positive' }) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        {change && (
          <div className={`flex items-center text-xs ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </div>
        )}
      </div>
    </Card>
  )
}

export default function Transactions() {
  const { data: recent = [], syncing, lastSync, refresh } = useCache('transactions_recent', () => transactionsService.getRecent(), { staleTime: 5 * 60 * 1000 })
  const { data: products = [] } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
  const prodMap = useMemo(() => new Map((products || []).map((p) => [p.id, p])), [products])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ product_id: '', type: 'in', quantity: 1, reason: '', reference_number: '', notes: '' })

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (!form.product_id || !form.type || !form.quantity) throw new Error('All fields are required')
      await transactionsService.record({ ...form, quantity: Number(form.quantity) })
      toast.success('Transaction recorded')
      setOpen(false)
      setForm({ product_id: '', type: 'in', quantity: 1, reason: '', reference_number: '', notes: '' })
      await refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to record transaction')
    }
  }

  // Calculate statistics
  const stockInTotal = recent.filter(t => t.type === 'in').reduce((sum, t) => sum + t.quantity, 0)
  const stockOutTotal = recent.filter(t => t.type === 'out').reduce((sum, t) => sum + t.quantity, 0)
  const adjustmentCount = recent.filter(t => t.type === 'adjustment').length

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-sm text-gray-500">Monitor inventory movements in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              Synced {lastSync ? Math.round((Date.now() - lastSync)/60000) + 'm ago' : 'never'} {syncing && '(syncing...)'}
            </div>
            <Button onClick={() => setOpen(true)} size="sm">
              Record Transaction
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CompactStatCard title="Stock In" value={stockInTotal} />
          <CompactStatCard title="Stock Out" value={stockOutTotal} />
          <CompactStatCard title="Adjustments" value={adjustmentCount} />
          <CompactStatCard title="Total" value={recent.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* River Chart */}
          <Card className="lg:col-span-1">
            <h3 className="font-semibold p-4 pb-2">Activity Overview</h3>
            <RiverChart transactions={recent} />
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center p-4 pb-2">
              <h3 className="font-semibold">Recent Transactions</h3>
              <Button variant="outline" size="sm" onClick={refresh}>
                Refresh
              </Button>
            </div>
            <div className="divide-y">
              {recent.length > 0 ? (
                recent.slice(0, 10).map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction} 
                    product={prodMap.get(transaction.product_id)} 
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No transactions found</p>
                  <Button variant="outline" className="mt-2" onClick={() => setOpen(true)}>
                    Record First Transaction
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Record Transaction Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4">Record Transaction</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
              >
                <option value="">Select product</option>
                {(products || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <Input 
                  className="mt-1" 
                  type="number" 
                  min="1" 
                  value={form.quantity} 
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <Input 
                className="mt-1" 
                value={form.reason} 
                onChange={(e) => setForm({ ...form, reason: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reference Number</label>
              <Input 
                className="mt-1" 
                value={form.reference_number} 
                onChange={(e) => setForm({ ...form, reference_number: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Input 
                className="mt-1" 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} size="sm">
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Transaction
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </Layout>
  )
}