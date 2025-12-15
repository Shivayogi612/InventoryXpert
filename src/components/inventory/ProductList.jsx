import React, { useMemo, useState } from 'react'
import { useCache } from '../../hooks/useCache'
import { productsService } from '../../services/products.service'
import { useProducts } from '../../hooks/useProducts'
import { Search, Upload, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ProductForm from './ProductForm'
import ProductDetails from './ProductDetails'
import BarcodeGenerator from './BarcodeGenerator'
import BarcodeScanner from './BarcodeScanner'
import { FixedSizeList as List } from 'react-window'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/currency'

export default function ProductList() {
  const { data: products = [], syncing, lastSync, refresh } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
  // normalize possible `null` returned by cache to an array
  const productsList = products || []
  const { deleteProduct } = useProducts()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showBarcode, setShowBarcode] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const fileInputRef = React.useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return productsList
    return productsList.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q))
  }, [productsList, query])

  const handleExport = async () => {
    try {
      const csv = await productsService.exportCsv(filtered)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products_export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  const handleImportFile = async (file) => {
    try {
      const parsed = await productsService.parseCsv(file)
      if (!parsed || !parsed.length) {
        toast.error('No rows found in CSV')
        return
      }
      let created = 0
      const skipped = []
      for (const row of parsed) {
        // basic validation
        if (!row.sku || !row.name) {
          skipped.push({ row, reason: 'Missing SKU or name' })
          continue
        }
        const exists = await productsService.getBySku(row.sku)
        if (exists) {
          skipped.push({ row, reason: 'Duplicate SKU' })
          continue
        }
        try {
          await productsService.create({
            sku: row.sku,
            name: row.name,
            description: row.description || '',
            category: row.category || '',
            brand: row.brand || '',
            unit: row.unit || '',
            price: parseFloat(row.price) || 0,
            cost: parseFloat(row.cost) || 0,
            quantity: parseInt(row.quantity) || 0,
            reorder_level: parseInt(row.reorder_level) || 0,
            max_stock_level: parseInt(row.max_stock_level) || 0,
            supplier: row.supplier || '',
            location: row.location || '',
            barcode: row.barcode || '',
            image_url: row.image_url || '',
            is_active: row.is_active === 'true' || row.is_active === '1' || row.is_active === true
          })
          created++
        } catch (err) {
          skipped.push({ row, reason: err.message || 'Create failed' })
        }
      }
      await refresh()
      toast.success(`Imported ${created} rows. Skipped ${skipped.length}.`)
    } catch (err) {
      console.error('Import failed', err)
      toast.error('Failed to import CSV')
    }
  }

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleImportFile(file)
    e.target.value = null
  }

  const handleScanFound = (value) => {
    setShowScanner(false)
    const found = products.find((p) => (p.barcode || '').toString() === value.toString() || (p.sku || '').toString() === value.toString())
    if (found) setSelected(found)
    else toast.error('No product found for scanned barcode')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, SKU or barcode" className="pl-9" />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          {/* Removed Add Product button - product creation moved to suppliers section */}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
          <input ref={fileInputRef} onChange={onFileInputChange} type="file" accept="text/csv" className="hidden" />
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>Scan</Button>
        </div>
        <div className="text-xs text-gray-500">Last synced: {lastSync ? Math.round((Date.now() - lastSync)/60000) + 'm ago' : 'never'} {syncing && '(syncing...)'}</div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length > 100 ? (
          <div style={{ height: 400 }}>
            <List
              height={400}
              itemCount={filtered.length}
              itemSize={60}
              width="100%"
            >
              {({ index, style }) => {
                const p = filtered[index]
                return (
                  <div key={p.id} style={style} className="flex items-center justify-between px-4 border-b hover:bg-gray-50">
                    <div className="w-1/4 truncate">{p.sku}</div>
                    <div className="w-1/3 cursor-pointer text-primary-600 truncate" onClick={() => setSelected(p)}>{p.name}</div>
                    <div className="w-1/6 text-right">{p.quantity}</div>
                    <div className="w-1/6 text-right">{formatCurrency(p.price || 0)}</div>
                    <div className="w-1/6 flex space-x-2 justify-end">
                      <button onClick={() => setShowBarcode(p)} className="px-2 py-1 bg-gray-100 rounded text-xs">Barcode</button>
                      <button onClick={() => setEditing(p)} className="px-2 py-1 bg-gray-100 rounded text-xs">Edit</button>
                    </div>
                  </div>
                )
              }}
            </List>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 truncate max-w-[100px]">{p.sku}</td>
                    <td className="px-4 py-3 cursor-pointer text-primary-600 truncate max-w-[150px]" onClick={() => setSelected(p)}>{p.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3">{p.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(p.price || 0)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {p.quantity === 0 ? (
                        <Badge variant="danger">Out of Stock</Badge>
                      ) : p.quantity <= p.reorder_level ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowBarcode(p)} className="text-xs px-2 py-1">Barcode</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(p)} className="text-xs px-2 py-1">Edit</Button>
                      <Button variant="destructive" size="sm" onClick={async () => { if (confirm('Delete this product?')) await deleteProduct(p.id) }} className="text-xs px-2 py-1">Delete</Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <ProductForm product={editing} onClose={() => { setEditing(null); refresh() }} />}
      {selected && <ProductDetails product={selected} onClose={() => setSelected(null)} />}
      {showBarcode && <BarcodeGenerator product={showBarcode} onClose={() => setShowBarcode(null)} />}
      {showScanner && <BarcodeScanner onFound={handleScanFound} onClose={() => setShowScanner(false)} />}
    </div>
  )
}