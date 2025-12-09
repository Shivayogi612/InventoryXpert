import React from 'react'
import useProductDemandInsight from '../../hooks/useProductDemandInsight'
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'

function TrendChip({ label }) {
  const map = { up: 'bg-green-100 text-green-800', flat: 'bg-yellow-100 text-yellow-800', down: 'bg-red-100 text-red-800' }
  return <span className={`px-2 py-1 rounded-full text-sm font-semibold ${map[label] || 'bg-gray-100 text-gray-800'}`}>{label === 'up' ? 'Trending up' : label === 'down' ? 'Declining' : 'Flat'}</span>
}

function RecBadge({ rec }) {
  const map = {
    aggressive_buy: ['bg-green-600 text-white', 'Aggressive Buy'],
    normal_buy: ['bg-blue-600 text-white', 'Normal Buy'],
    cautious_buy: ['bg-amber-600 text-white', 'Cautious Buy'],
    avoid_overstock: ['bg-gray-600 text-white', 'Avoid Overstock']
  }
  const v = map[rec] || ['bg-gray-200 text-gray-900', 'Unknown']
  return <span className={`px-3 py-1 rounded-md text-sm font-medium ${v[0]}`}>{v[1]}</span>
}

export default function ProductDemandInsightCard({ productId, productName }) {
  const { data, loading, error, refresh } = useProductDemandInsight(productId)

  if (!productId) return null

  const internal = data?.internal
  const ai = data?.ai

  return (
    <div className="bg-white dark:bg-slate-800 shadow p-4 rounded-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Gemini insight for {productName || (internal && internal.name) || 'Product'}</div>
          <div className="mt-2 flex items-center gap-3">
            {ai?.trend_label ? <TrendChip label={ai.trend_label} /> : internal ? <TrendChip label={internal.trend_internal} /> : null}
            {ai?.recommendation ? <RecBadge rec={ai.recommendation} /> : null}
          </div>
        </div>
        <div className="text-sm text-right">
          <button onClick={refresh} className="text-sm text-primary-600 hover:underline">Refresh</button>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">
        {loading && <div>Loading insight…</div>}
        {error && <div className="text-red-600">Insight unavailable. Showing internal stats only.</div>}

        {ai?.summary ? <div className="mb-2">{ai.summary}</div> : null}

        {/* Sparkline / trend chart */}
        {internal?.series_last_30 && internal.series_last_30.length > 0 && (
          <div className="mt-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={internal.series_last_30} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                <Tooltip formatter={(v) => [v, 'sold']} labelFormatter={(l) => l} />
                <Line type="monotone" dataKey="sold" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {internal && (
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div><strong>Total sold:</strong> {internal.total_sold}</div>
            <div><strong>Avg / week:</strong> {internal.avg_weekly}</div>
            <div><strong>Current stock:</strong> {internal.current_stock}</div>
            <div><strong>Reorder level:</strong> {internal.reorder_level}</div>
          </div>
        )}

        {ai?.risk_factors && ai.risk_factors.length > 0 && (
          <div className="mt-3">
            <strong>Risks / Opportunities</strong>
            <ul className="list-disc ml-5 mt-1 text-sm">
              {ai.risk_factors.slice(0,3).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {ai?.suggested_actions && ai.suggested_actions.length > 0 && (
          <div className="mt-3">
            <strong>Suggested actions</strong>
            <ul className="list-disc ml-5 mt-1 text-sm">
              {ai.suggested_actions.slice(0,3).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {ai?.stock_advice && (
          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded">{ai.stock_advice}</div>
        )}

        <div className="mt-3 text-xs text-slate-400">Based on your sales + Gemini's market understanding.</div>
      </div>
    </div>
  )
}
