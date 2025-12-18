import React from 'react'
import Layout from '../components/layout/Layout'
import useAlerts from '../hooks/useAlerts'
import { AlertTriangle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useAlertEngine } from '../hooks/useAlertEngine'
import { toast } from 'react-hot-toast'

const severityMap = {
  critical: { color: 'bg-danger text-white', Icon: AlertTriangle },
  high: { color: 'bg-warning text-white', Icon: AlertCircle },
  medium: { color: 'bg-info text-white', Icon: AlertCircle },
  low: { color: 'bg-primary-500 text-white', Icon: AlertCircle },
}

function AlertsPage() {
  const { alerts = [], loading, acknowledge, dismiss, resolve, refreshAlerts, unreadCount, markAllRead } = useAlerts()
  const { generateAlerts, isGenerating } = useAlertEngine()

  const handleGenerateAlerts = async () => {
    try {
      await generateAlerts()
      // Refresh alerts after generation
      await refreshAlerts()
      toast.success('Alerts generated successfully')
    } catch (err) {
      console.error('Error generating alerts:', err)
      toast.error('Failed to generate alerts: ' + err.message)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Alerts</h1>
            <p className="text-gray-600 mt-1">Monitor low stock and out of stock levels for your inventory.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={handleGenerateAlerts}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate Alerts
                </>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </button>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-1 gap-3">
            {alerts.map((a) => {
              const sev = severityMap[a.severity] || severityMap.medium
              const Icon = sev.Icon
              return (
                <div key={a.id} className="p-3 border rounded flex justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`${sev.color} p-2 rounded`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.message}</div>
                      {a.product_name && <div className="text-xs text-gray-400">Product: {a.product_name}</div>}
                      {a.acknowledged_by && <div className="text-xs text-gray-400">Acknowledged by: {a.acknowledged_by}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-400">{new Date(a.created_at).toLocaleString()}</div>
                    <div className="mt-2 flex space-x-2">
                      <button onClick={() => acknowledge(a.id, 'user')} className="px-2 py-1 bg-primary-500 text-white rounded text-xs">Acknowledge</button>
                      <button onClick={() => resolve(a.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Resolve</button>
                      <button onClick={() => dismiss(a.id)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Dismiss</button>
                    </div>
                  </div>
                </div>
              )
            })}
            {!alerts.length && <div className="text-sm text-gray-500">No alerts</div>}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AlertsPage