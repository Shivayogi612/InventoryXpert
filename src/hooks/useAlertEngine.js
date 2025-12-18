import { useState } from 'react'
import { alertEngineService } from '../services/alertEngine.service'
import { toast } from 'react-hot-toast'

export function useAlertEngine() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastAlerts, setLastAlerts] = useState(null)

  const generateAlerts = async (options = {}) => {
    setIsGenerating(true)
    try {
      const result = await alertEngineService.generateAlerts(options)
      setLastAlerts(result)
      
      const totalCreated = result.summary.totalCreated
      if (totalCreated > 0) {
        toast.success(`Generated ${totalCreated} new alert(s)`)
      } else {
        toast.success('No new alerts at this time')
      }
      
      return result
    } catch (err) {
      console.error('Alert generation failed:', err)
      toast.error(`Failed to generate alerts: ${err.message}`)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  const sendNotification = async (alert, channels) => {
    try {
      const result = await alertEngineService.sendNotification(alert, channels)
      toast.success(`Notification sent via ${channels.join(', ')}`)
      return result
    } catch (err) {
      console.error('Notification sending failed:', err)
      toast.error(`Failed to send notification: ${err.message}`)
      throw err
    }
  }

  return {
    isGenerating,
    lastAlerts,
    generateAlerts,
    sendNotification
  }
}