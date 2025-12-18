import React, { useState, useEffect } from 'react'
import { backgroundJobsService } from '../services/backgroundJobs.service'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function BackgroundJobsStatus() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()

    // Refresh every 30 seconds
    const interval = setInterval(loadJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadJobs = () => {
    try {
      const status = backgroundJobsService.getJobStatus()
      setJobs(status)
      setLoading(false)
    } catch (err) {
      console.error('Error loading job status:', err)
      setLoading(false)
    }
  }

  const restartJobs = () => {
    setLoading(true)
    try {
      backgroundJobsService.stopAllJobs()
      backgroundJobsService.startAllJobs()
      setTimeout(loadJobs, 1000)
    } catch (err) {
      console.error('Error restarting jobs:', err)
      setLoading(false)
    }
  }

  const stopJobs = () => {
    setLoading(true)
    try {
      backgroundJobsService.stopAllJobs()
      setTimeout(loadJobs, 500)
    } catch (err) {
      console.error('Error stopping jobs:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading job status...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Background Jobs</h3>
        <div className="flex gap-2">
          <button
            onClick={stopJobs}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Stop All
          </button>
          <button
            onClick={restartJobs}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Restart All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-500">No background jobs running</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 capitalize">
                {job.id.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                Running
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Jobs run automatically to generate alerts, purchase orders, and transfer suggestions.
      </div>
    </div>
  )
}