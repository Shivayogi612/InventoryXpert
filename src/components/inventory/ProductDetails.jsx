import React from 'react'
import ProductDemandInsightCard from '../insights/ProductDemandInsightCard'

import { formatCurrency } from '../../utils/currency'

export default function ProductDetails({ product, onClose }) {
  if (!product) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img src={product.image_url || '/logo.svg'} alt="product" className="w-full rounded" />
          </div>
          <div>
            <div className="text-sm text-gray-500">SKU</div>
            <div className="font-medium">{product.sku}</div>

            <div className="text-sm text-gray-500 mt-2">Category</div>
            <div className="font-medium">{product.category}</div>

            <div className="text-sm text-gray-500 mt-2">Quantity</div>
            <div className="font-medium">{product.quantity}</div>

            <div className="text-sm text-gray-500 mt-2">Price</div>
            <div className="font-medium">{formatCurrency(product.price || 0)}</div>

            <div className="text-sm text-gray-500 mt-2">Supplier</div>
            <div className="font-medium">{product.supplier}</div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Description</h4>
          <div className="text-sm text-gray-700">{product.description || '—'}</div>
        </div>

        <div className="mt-4">
          <ProductDemandInsightCard productId={product.id} productName={product.name} />
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  )
}
