import React, { useMemo } from 'react'
import Layout from '../components/layout/Layout'
import BackgroundJobsStatus from '../components/BackgroundJobsStatus'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { transactionsService } from '../services/transactions.service'
import { alertsService } from '../services/alerts.service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/currency'
import { smsService } from '../services/sms.service'
import { toast } from 'react-hot-toast'

// Modern Metric Card with circular icon
function MetricCard({ title, value, icon, iconBg, trend, trendValue, showProgress, subtitle }) {
  // Extract numeric value for progress bar if it's a percentage
  const progressValue = showProgress && typeof value === 'string'
    ? parseInt(value.replace('%', ''))
    : 0

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="metric-label">{title}</div>
          <div className="metric-value">{value}</div>
          {subtitle && (
            <div className="metric-subtitle text-sm text-gray-500 mt-1">{subtitle}</div>
          )}
          {showProgress && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressValue}%` }}></div>
            </div>
          )}
          {trend && (
            <div className={`metric-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              <span className="trend-icon">{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
              <span className="trend-text">Since last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`metric-icon ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  console.log('Dashboard component mounting...')

  // Re-enable data fetching to show real products
  const { data: products = [], loading: productsLoading, error: productsError } = useCache('products', () => {
    console.log('Fetching products...')
    return productsService.getAll()
  }, { staleTime: 5 * 60 * 1000 })


  const { data: transactions = [], loading: transactionsLoading, error: transactionsError } = useCache('transactions', () => {
    console.log('Fetching transactions...')
    return transactionsService.getRecent(100)
  }, { staleTime: 2 * 60 * 1000 })
  /*
  const transactions = []
  const transactionsLoading = false
  const transactionsError = null
  */

  const { data: alerts = [], loading: alertsLoading, error: alertsError } = useCache('alerts', async () => {
    console.log('Fetching alerts...')
    const data = await alertsService.getActiveAlerts()
    return (data || []).filter(a => a.type === 'low_stock' || a.type === 'out_of_stock')
  }, { staleTime: 60 * 1000 })


  // Always use real data - remove mock data
  const productsList = products || []
  const transactionsList = transactions || []
  const alertsList = alerts || []

  // Check if we have data loading issues
  const hasDataErrors = productsError || transactionsError || alertsError
  const isLoading = productsLoading || transactionsLoading || alertsLoading

  const totalProducts = productsList.length
  const totalInventoryValue = productsList.reduce((s, p) => s + (p?.quantity || 0) * (p?.price || 0), 0)
  const lowStockCount = productsList.filter((p) => {
    const qty = Number(p?.quantity || 0)
    const reorder = Number(p?.reorder_level)
    const threshold = reorder > 0 ? reorder : 5
    return qty <= threshold
  }).length
  
  const outOfStockCount = productsList.filter((p) => {
    const qty = Number(p?.quantity || 0)
    return qty === 0
  }).length

  // Monthly sales data from actual transactions
  const monthlySales = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize monthly data
    const monthlyData = months.map((month, idx) => ({
      month,
      monthIndex: idx,
      sales: 0,
      count: 0
    }))

    // Aggregate transactions by month
    transactionsList.forEach(transaction => {
      if (!transaction.created_at) return

      const date = new Date(transaction.created_at)
      const year = date.getFullYear()
      const monthIndex = date.getMonth()

      // Only include current year transactions
      if (year === currentYear) {
        const value = Math.abs(transaction.quantity || 0) * (transaction.unit_price || 0)
        monthlyData[monthIndex].sales += value
        monthlyData[monthIndex].count += 1
      }
    })

    return monthlyData.map(({ month, sales }) => ({
      month,
      sales: Math.round(sales)
    }))
  }, [transactionsList])

  // Category distribution from actual products
  const categoryDistribution = useMemo(() => {
    const categoryMap = {}
    productsList.forEach(product => {
      const category = product.category || 'Uncategorized'
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, value: 0 }
      }
      categoryMap[category].count += 1
      categoryMap[category].value += (product.quantity || 0) * (product.price || 0)
    })

    // Convert to array and calculate percentages
    const total = Object.values(categoryMap).reduce((sum, cat) => sum + cat.count, 0)
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return Object.entries(categoryMap)
      .map(([name, data], idx) => ({
        name,
        value: total > 0 ? Math.round((data.count / total) * 100) : 0,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories
  }, [productsList])

  // Calculate task progress (based on low stock vs total)
  const taskProgress = totalProducts > 0 ? Math.round(((totalProducts - lowStockCount) / totalProducts) * 100) : 0

  // Calculate trends from last 30 days vs previous 30 days
  const trends = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    let recentValue = 0
    let previousValue = 0
    let recentProfit = 0
    let previousProfit = 0

    transactionsList.forEach(transaction => {
      if (!transaction.created_at) return
      const date = new Date(transaction.created_at)
      // For profit calculation, we only consider 'out' transactions (sales)
      if (transaction.type === 'out') {
        const value = Math.abs(transaction.quantity || 0) * (transaction.unit_price || 0)
        // Profit = revenue - cost
        const cost = value * 0.7 // Assuming 70% cost of goods sold
        const profit = value - cost

        if (date >= thirtyDaysAgo) {
          recentValue += value
          recentProfit += profit
        } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
          previousValue += value
          previousProfit += profit
        }
      }
    })

    const budgetTrend = previousValue > 0
      ? Math.round(((recentValue - previousValue) / previousValue) * 100)
      : 0

    const profitTrend = previousProfit > 0
      ? Math.round(((recentProfit - previousProfit) / previousProfit) * 100)
      : 0

    const customerTrend = Math.round((totalProducts * 0.05) - 10) // Simulated based on product count

    return {
      budget: { direction: budgetTrend >= 0 ? 'up' : 'down', value: `${Math.abs(budgetTrend)}%` },
      profit: { direction: profitTrend >= 0 ? 'up' : 'down', value: `${Math.abs(profitTrend)}%` },
      customers: { direction: customerTrend >= 0 ? 'up' : 'down', value: `${Math.abs(customerTrend)}%` }
    }
  }, [transactionsList, totalProducts])

  // Calculate total profit from sales transactions
  const totalProfit = useMemo(() => {
    let profit = 0
    transactionsList.forEach(transaction => {
      if (transaction.type === 'out') { // Sales transactions
        const revenue = Math.abs(transaction.quantity || 0) * (transaction.unit_price || 0)
        // Assuming 70% cost of goods sold, so 30% profit margin
        const transactionProfit = revenue * 0.3
        profit += transactionProfit
      }
    })
    return profit
  }, [transactionsList])

  return (
    <Layout>
      <div className="dashboard-container">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>
        {/* Error notification */}
        {hasDataErrors && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Data Loading Error</p>
            <p>There was an error loading data from the database. Check the console for details.</p>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
            <p className="font-bold">Loading Data</p>
            <p>Fetching data from the database...</p>
          </div>
        )}

        {/* Empty state notification */}
        {!isLoading && !hasDataErrors && totalProducts === 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">No Products Found</p>
            <p>No products were found in the database. Please add some products to see data here.</p>
          </div>
        )}

        {/* Top Metrics */}
        <div className="metrics-grid">
          <MetricCard
            title="BUDGET"
            value={`${formatCurrency(totalInventoryValue, { maximumFractionDigits: 0 })}`}
            icon={null}
            iconBg="icon-red"
            trend={trends.budget.direction}
            trendValue={trends.budget.value}
          />
          <MetricCard
            title="TOTAL PRODUCTS"
            value={totalProducts}
            icon={null}
            iconBg="icon-green"
            trend={trends.customers.direction}
            trendValue={trends.customers.value}
          />
          <MetricCard
            title="LOW STOCK ITEMS"
            value={lowStockCount}
            subtitle="Below reorder level"
            icon={null}
            iconBg="icon-orange"
            showProgress={false}
          />
          <MetricCard
            title="OUT OF STOCK ITEMS"
            value={outOfStockCount}
            subtitle="Immediate restock required"
            icon={null}
            iconBg="icon-red"
            showProgress={false}
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Background Jobs Status */}
        <BackgroundJobsStatus />
      </div>
    </Layout>
  )
}