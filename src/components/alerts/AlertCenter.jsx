import React, { useState } from 'react'
import useAlerts from '../../hooks/useAlerts'
import { AlertTriangle, AlertCircle, Bell, CheckCircle, Check } from 'lucide-react'

const severityMap = {
  critical: { color: 'bg-danger text-white', icon: AlertTriangle },
  high: { color: 'bg-warning text-white', icon: AlertCircle },
  medium: { color: 'bg-info text-white', icon: Bell },
  low: { color: 'bg-primary-500 text-white', icon: Bell },
}

export default function AlertCenter({ onClose }) {
  const { alerts = [], acknowledge, dismiss, resolve, markAllRead } = useAlerts()
  const [marking, setMarking] = useState(false)

  const handleMarkAll = async () => {
    if (!alerts.length) return
    setMarking(true)
    try {
      await markAllRead()
    } catch (err) {
      console.error('mark all failed', err)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded shadow-lg z-50">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-semibold">Alerts</span>
        {alerts.length > 0 && (
          <button
            className="text-xs font-medium text-primary-600 hover:text-primary-500 flex items-center gap-1"
            onClick={handleMarkAll}
            disabled={marking}
          >
            <Check className="w-3 h-3" />
            {marking ? 'Clearing...' : 'Mark all as read'}
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-auto">
        {alerts.map((a) => {
          const sev = severityMap[a.severity] || severityMap.medium
          const Icon = sev.icon
          return (
            <div key={a.id} className="p-3 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`${sev.color} p-2 rounded`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500">{a.message}</div>
                    {a.product_name && <div className="text-xs text-gray-400">Product: {a.product_name}</div>}
                    <div className="text-[11px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button className="text-xs text-primary-600" onClick={() => acknowledge(a.id)}>Acknowledge</button>
                  <button className="text-xs text-green-600" onClick={() => resolve(a.id)}>Resolve</button>
                  <button className="text-xs text-gray-500" onClick={() => dismiss(a.id)}>Dismiss</button>
                </div>
              </div>
            </div>
          )
        })}
        {!alerts.length && (
          <div className="p-6 text-center text-sm text-gray-500">
            <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
            All caught up! No active alerts.
          </div>
        )}
      </div>
      <div className="p-2 text-right">
        <button onClick={onClose} className="text-sm text-gray-600">Close</button>
      </div>
    </div>
  )
}
