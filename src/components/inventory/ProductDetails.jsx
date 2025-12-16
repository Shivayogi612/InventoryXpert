import React from 'react'
import ProductDemandInsightCard from '../insights/ProductDemandInsightCard'
import { formatCurrency } from '../../utils/currency'
import { X } from 'lucide-react'

export default function ProductDetails({ product, onClose }) {
  if (!product) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Product Details</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Product Image */}
            <div>
              <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center">
                <img 
                  src={product.image_url || '/logo.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = '/logo.svg'
                  }}
                />
              </div>
              
              {/* Status Badge */}
              <div className="mt-4">
                {product.quantity === 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                ) : product.quantity <= product.reorder_level ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    In Stock
                  </span>
                )}
              </div>
            </div>
            
            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{product.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">SKU</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.sku}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.category}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">Brand</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.brand || '-'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">Supplier</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.supplier || '-'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-blue-600">Price</div>
                  <div className="text-lg sm:text-xl font-bold text-blue-900">{formatCurrency(product.price || 0)}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-green-600">Cost</div>
                  <div className="text-lg sm:text-xl font-bold text-green-900">{formatCurrency(product.cost || 0)}</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-purple-600">Quantity</div>
                  <div className="text-lg sm:text-xl font-bold text-purple-900">{product.quantity}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">Location</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.location || '-'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500">Barcode</div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{product.barcode || '-'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Demand Insights */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Demand Insights</h4>
            <ProductDemandInsightCard productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  )
}