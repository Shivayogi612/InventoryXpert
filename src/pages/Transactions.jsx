import React, { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dialog from '../components/ui/Dialog'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { transactionsService } from '../services/transactions.service'
import { toast } from 'react-hot-toast'

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
      await refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to record transaction')
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <div className="text-xs text-gray-500">Last synced: {lastSync ? Math.round((Date.now() - lastSync)/60000) + 'm ago' : 'never'} {syncing && '(syncing...)'}</div>
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => setOpen(true)}>Record Transaction</Button>
          </div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Before</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">After</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {(recent || []).map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{prodMap.get(t.product_id)?.name || t.product_id}</td>
                    <td className="px-4 py-3">{t.type}</td>
                    <td className="px-4 py-3">{t.quantity}</td>
                    <td className="px-4 py-3">{t.previous_quantity}</td>
                    <td className="px-4 py-3">{t.new_quantity}</td>
                    <td className="px-4 py-3">{t.performed_by ? `${t.performed_by} by manager` : 'by manager'}</td>
                  </tr>
                ))}
                {!recent?.length && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Record Transaction</h3>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
              <Input className="mt-1" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <Input className="mt-1" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Input className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      </Dialog>
    </Layout>
  )
}

