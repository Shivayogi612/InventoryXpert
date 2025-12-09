import React, { useMemo, useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import useDemandForecasts from '../hooks/useDemandForecasts'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { transactionsService } from '../services/transactions.service'
import { getInsightsForProducts } from '../services/productInsights.service'

export default function Forecasting() {
  const { data: products = [] } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
  const { data: forecasts = [], loading, refresh } = useDemandForecasts()

  // Build a map of product -> forecasts
  const byProduct = useMemo(() => {
    const map = new Map()
      ; (forecasts || []).forEach((f) => {
        const pid = f.product_id
        if (!map.has(pid)) map.set(pid, {})
        map.get(pid)[f.forecast_period] = f
      })
    return map
  }, [forecasts])

  // Compose list of products with forecast and risk
  const items = useMemo(() => {
    return (products || []).map((p) => {
      const f7 = byProduct.get(p.id)?.[`7d`]
      const f30 = byProduct.get(p.id)?.[`30d`]
      const forecast30 = f30 ? Number(f30.forecast_units || 0) : null
      const qty = Number(p.quantity || 0)
      let risk = 'low'
      if (forecast30 !== null) {
        if (qty < forecast30) risk = 'high'
        else if (qty <= Math.ceil(forecast30 * 1.0)) risk = 'medium'
        else risk = 'low'
      }
      return { product: p, f7, f30, forecast30, qty, risk }
    })
  }, [products, byProduct])

  // per-product recent series state (last 30 days)
  const [seriesMap, setSeriesMap] = useState({})
  const [loadingSeries, setLoadingSeries] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadSeries(list) {
      setLoadingSeries(true)
      const batch = list.slice(0, 12) // only fetch for the first page of cards
      const promises = batch.map(async (it) => {
        try {
          const txns = await transactionsService.getByProduct(it.product.id, 90)
          // aggregate last 30 days daily 'out' quantities
          const daily = {}
          const now = new Date()
          for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            daily[d.toISOString().slice(0, 10)] = 0
          }
          ; (txns || []).forEach(t => {
            if (!t || String(t.type).toLowerCase() !== 'out') return
            const day = (new Date(t.created_at)).toISOString().slice(0, 10)
            if (day in daily) daily[day] += Math.abs(Number(t.quantity) || 0)
          })
          const series = Object.keys(daily).map(d => ({ date: d, sold: daily[d] }))
          return { id: it.product.id, series }
        } catch (e) {
          return { id: it.product.id, series: [] }
        }
      })

      const results = await Promise.all(promises)
      if (!mounted) return
      const map = {}
      results.forEach(r => { map[r.id] = r.series })
      setSeriesMap(map)
      setLoadingSeries(false)
    }

    loadSeries(items)
    return () => { mounted = false }
  }, [items])

  // load cached AI insights for visible items
  const [insightsMap, setInsightsMap] = useState({})
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadInsights(list) {
      const ids = (list || []).slice(0, 12).map(i => i.product.id).filter(Boolean)
      if (!ids.length) return
      setLoadingInsights(true)
      try {
        const rows = await getInsightsForProducts(ids)
        if (!mounted) return
        const map = {}
          ; (rows || []).forEach(r => { map[r.product_id] = r })
        setInsightsMap(map)
      } catch (e) {
        console.warn('failed to load product insights', e)
      } finally {
        if (mounted) setLoadingInsights(false)
      }
    }
    loadInsights(items)
    return () => { mounted = false }
  }, [items])

  // Light color schemes - no gradients
  const getColorScheme = (risk) => {
    switch (risk) {
      case 'high':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          stroke: '#ef4444',
          label: 'High Risk'
        }
      case 'medium':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          stroke: '#f59e0b',
          label: 'Medium Risk'
        }
      default:
        return {
          bg: '#f0f9ff',
          border: '#bfdbfe',
          text: '#1e40af',
          stroke: '#3b82f6',
          label: 'Low Risk'
        }
    }
  }

  // Market trend info - light colors
  const getMarketTrendInfo = (insight, pct) => {
    if (!insight?.trend_label) {
      if (pct > 15) return { status: 'Hot Demand', icon: '🔥', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' }
      if (pct > 5) return { status: 'Trending Up', icon: '📈', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' }
      if (pct < -15) return { status: 'Declining', icon: '📉', bg: '#f8fafc', text: '#475569', border: '#cbd5e1' }
      if (pct < -5) return { status: 'Cooling Off', icon: '❄️', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }
      return { status: 'Stable', icon: '➡️', bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' }
    }

    switch (insight.trend_label) {
      case 'up':
        return { status: 'Trending Up', icon: '📈', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' }
      case 'down':
        return { status: 'Declining', icon: '📉', bg: '#f8fafc', text: '#475569', border: '#cbd5e1' }
      default:
        return { status: 'Stable', icon: '➡️', bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' }
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Clean Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Demand Forecasting</h2>
              <p className="text-sm text-gray-600">AI-powered insights and market trend analysis</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Page
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                onClick={() => refresh(true)}
                disabled={loading}
              >
                {loading ? '⏳ Refreshing…' : '✨ Refresh Forecasts'}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-lg text-gray-500">No products found.</div>
            </div>
          )}

          {items.slice(0, 12).map(({ product, f30, qty, forecast30, risk }) => {
            const series = seriesMap[product.id] || []
            const last7 = series.slice(-7).map(s => s.sold || 0)
            const prev7 = series.slice(-14, -7).map(s => s.sold || 0)
            const avgLast7 = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : 0
            const avgPrev7 = prev7.length ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0
            const pct = avgPrev7 === 0 ? (avgLast7 === 0 ? 0 : 100) : Math.round(((avgLast7 - avgPrev7) / avgPrev7) * 100)
            const pctLabel = pct > 0 ? `+${pct}%` : `${pct}%`

            const colorScheme = getColorScheme(risk)
            const fillId = `gradient-${product.id}`.replace(/[^a-z0-9-_]/gi, '')
            const marketTrend = getMarketTrendInfo(insightsMap[product.id], pct)

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border-2 overflow-hidden"
                style={{ borderColor: colorScheme.border }}
              >
                {/* Top colored bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: colorScheme.stroke }}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700 mb-2">
                        {product.category || 'General'}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>

                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-bold ml-3"
                      style={{
                        backgroundColor: colorScheme.bg,
                        color: colorScheme.text,
                        border: `1px solid ${colorScheme.border}`
                      }}
                    >
                      {colorScheme.label}
                    </div>
                  </div>

                  {/* Market Trend Section */}
                  <div
                    className="mb-4 p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: marketTrend.bg,
                      borderColor: marketTrend.border,
                      color: marketTrend.text
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{marketTrend.icon}</span>
                        <div>
                          <div className="text-xs font-semibold uppercase opacity-70">Market Trend</div>
                          <div className="text-base font-bold">{marketTrend.status}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{pctLabel}</div>
                        <div className="text-xs opacity-70">vs last week</div>
                      </div>
                    </div>

                    {insightsMap[product.id]?.summary && (
                      <div className="text-xs leading-relaxed opacity-80 border-t pt-2 mt-2" style={{ borderColor: marketTrend.border }}>
                        💡 {insightsMap[product.id].summary}
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-blue-700 mb-1 font-medium">Forecast</div>
                      <div className="text-xl font-bold text-blue-900">
                        {forecast30 ?? '-'}
                      </div>
                      <div className="text-xs text-blue-600">30 days</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-purple-700 mb-1 font-medium">Stock</div>
                      <div className="text-xl font-bold text-purple-900">
                        {qty}
                      </div>
                      <div className="text-xs text-purple-600">units</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                      <div className="text-xs text-amber-700 mb-1 font-medium">Reorder</div>
                      <div className="text-xl font-bold text-amber-900">
                        {product.reorder_level ?? '—'}
                      </div>
                      <div className="text-xs text-amber-600">level</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-700 mb-3 uppercase">
                      📈 30-Day Sales Trend
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <defs>
                            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor={colorScheme.stroke} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={colorScheme.stroke} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip
                            formatter={(v) => [v, 'Sold']}
                            labelFormatter={(l) => l}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                              padding: '8px 12px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sold"
                            stroke={colorScheme.stroke}
                            fill={`url(#${fillId})`}
                            strokeWidth={2}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {insightsMap[product.id] && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-xs font-bold uppercase text-slate-700">AI Recommendation</span>
                      </div>
                      <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-2 ${insightsMap[product.id].recommendation === 'aggressive_buy' ? 'bg-green-100 text-green-800 border border-green-300' :
                          insightsMap[product.id].recommendation === 'normal_buy' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            insightsMap[product.id].recommendation === 'cautious_buy' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                        {insightsMap[product.id].recommendation ?
                          insightsMap[product.id].recommendation.replace(/_/g, ' ').toUpperCase() :
                          'ANALYZING'
                        }
                      </div>
                      {insightsMap[product.id].stock_advice && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {insightsMap[product.id].stock_advice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
