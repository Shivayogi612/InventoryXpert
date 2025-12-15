import React, { useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { transactionsService } from '../services/transactions.service'
import { alertsService } from '../services/alerts.service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/currency'

// Modern Metric Card with circular icon
function MetricCard({ title, value, icon, iconBg, trend, trendValue, showProgress }) {
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
  const { data: products = [] } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
  const { data: transactions = [] } = useCache('transactions', () => transactionsService.getRecent(100), { staleTime: 2 * 60 * 1000 })
  const { data: alerts = [] } = useCache('alerts', () => alertsService.getActiveAlerts(), { staleTime: 60 * 1000 })

  const productsList = products || []
  const transactionsList = transactions || []
  const alertsList = alerts || []

  const totalProducts = productsList.length
  const totalInventoryValue = productsList.reduce((s, p) => s + (p?.quantity || 0) * (p?.price || 0), 0)
  const lowStockCount = productsList.filter((p) => {
    const qty = Number(p?.quantity || 0)
    const reorder = Number(p?.reorder_level)
    const threshold = reorder > 0 ? reorder : 5
    return qty <= threshold
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
            title="TASK PROGRESS"
            value={`${taskProgress}%`}
            icon={null}
            iconBg="icon-orange"
            showProgress={true}
          />
          <MetricCard
            title="TOTAL PROFIT"
            value={`${formatCurrency(totalProfit, { maximumFractionDigits: 0 })}`}
            icon={null}
            iconBg="icon-purple"
            trend={trends.profit.direction}
            trendValue={trends.profit.value}
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Sales Chart */}
          <div className="chart-card sales-chart">
            <div className="chart-header">
              <h3 className="chart-title">Sales</h3>
              <button className="sync-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Sync
              </button>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySales}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="chart-card traffic-chart">
            <h3 className="chart-title">Category Distribution</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(212, 214, 220, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="traffic-legend">
                {categoryDistribution.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-icon-wrapper" style={{ background: item.color + '20', color: item.color }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                    </div>
                    <div className="legend-text">
                      <div className="legend-label">{item.name}</div>
                      <div className="legend-value">{item.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}