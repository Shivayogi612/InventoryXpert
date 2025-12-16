import React, { useMemo, useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import { useProducts } from '../../hooks/useProducts';
import { Search, Download, Plus, RefreshCw, QrCode, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductForm from './ProductForm';
import ProductDetails from './ProductDetails';
import BarcodeGenerator from './BarcodeGenerator';
import { FixedSizeList as List } from 'react-window';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { deleteProduct } = useProducts();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showBarcode, setShowBarcode] = useState(null);

  // Fetch products directly without heavy caching
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.getAll();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const productsList = products || [];
  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productsList;
    return productsList.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q));
  }, [productsList, query]);

  const handleExport = async () => {
    try {
      const csv = await productsService.exportCsv(filtered);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // Get status color based on stock level
  const getStatusColor = (product) => {
    if (product.quantity === 0) return 'bg-red-100 text-red-800';
    if (product.quantity <= product.reorder_level) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get status text based on stock level
  const getStatusText = (product) => {
    if (product.quantity === 0) return 'Out of Stock';
    if (product.quantity <= product.reorder_level) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-blue-100 mt-1">Manage your products and stock levels</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
              <span className="font-medium">{productsList.length}</span> products
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full">
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search by name, SKU or barcode..." 
                className="pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <Button 
              onClick={() => setEditing({})} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Removed Upload and Scan buttons as requested */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchProducts}
              disabled={loading}
              className="border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">{loading ? '...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length > 100 ? (
          <div style={{ height: 500 }}>
            <List
              height={500}
              itemCount={filtered.length}
              itemSize={100}
              width="100%"
            >
              {({ index, style }) => {
                const p = filtered[index];
                return (
                  <div key={p.id} style={style} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.sku}</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900 text-sm">{p.quantity}</div>
                          <div className="text-xs text-gray-500">Qty</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 text-sm">{formatCurrency(p.price || 0)}</div>
                          <div className="text-xs text-gray-500">Price</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p)}`}>
                        {getStatusText(p)}
                      </span>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setShowBarcode(p)} 
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                          title="Generate Barcode"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditing(p)} 
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }}
            </List>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => setSelected(p)}>
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">{p.sku}</div>
                          <div className="text-xs text-gray-500">{p.brand || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{p.sku}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{p.category}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{p.quantity}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(p.price || 0)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(p)}`}>
                        {getStatusText(p)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setShowBarcode(p)} 
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Generate Barcode"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditing(p)} 
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => { 
                            if (confirm('Delete this product?')) await deleteProduct(p.id); 
                          }} 
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="text-gray-400">
                        <Search className="w-12 h-12 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile List View for smaller screens */}
      <div className="sm:hidden bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.map((p) => (
          <div key={p.id} className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div 
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 text-sm"
                      onClick={() => setSelected(p)}
                    >
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{p.sku}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p)}`}>
                    {getStatusText(p)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="text-sm text-gray-900">{p.category || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Brand</div>
                    <div className="text-sm text-gray-900">{p.brand || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Quantity</div>
                    <div className="text-sm text-gray-900">{p.quantity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(p.price || 0)}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => setShowBarcode(p)} 
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    Barcode
                  </button>
                  <button 
                    onClick={() => setEditing(p)} 
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={async () => { 
                      if (confirm('Delete this product?')) await deleteProduct(p.id); 
                    }} 
                    className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {!filtered.length && (
          <div className="p-8 text-center">
            <div className="text-gray-400">
              <Search className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search query</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && <ProductForm product={editing} onClose={() => { setEditing(null); fetchProducts(); }} />}
      {selected && <ProductDetails product={selected} onClose={() => setSelected(null)} />}
      {showBarcode && <BarcodeGenerator product={showBarcode} onClose={() => setShowBarcode(null)} />}
    </div>
  );
}