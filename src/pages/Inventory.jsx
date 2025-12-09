import React from 'react'
import Layout from '../components/layout/Layout'
import ProductList from '../components/inventory/ProductList'
import Card from '../components/ui/Card'

export default function Inventory() {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Inventory</h2>
        </div>
        <Card className="p-5">
          <ProductList />
        </Card>
      </div>
    </Layout>
  )
}
