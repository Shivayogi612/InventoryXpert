import React from 'react'
import Layout from '../components/layout/Layout'
import ProductList from '../components/inventory/ProductList'
import Card from '../components/ui/Card'
import { Info } from 'lucide-react'

export default function Inventory() {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Inventory</h2>
        </div>
        
        {/* Notice about product creation */}
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium text-blue-800">Product Creation Moved</h3>
              <p className="text-blue-700 text-sm mt-1">
                New product creation has been moved to the Suppliers section. 
                Please go to the <a href="/suppliers" className="underline font-medium">Suppliers page</a> to add new products.
                Existing products can still be edited here.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <ProductList />
        </Card>
      </div>
    </Layout>
  )
}