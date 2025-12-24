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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Loader2 className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Background Jobs</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={stopJobs}
            className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            Stop All
          </button>
          <button
            onClick={restartJobs}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Restart All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-2">
                <XCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">No background jobs running</p>
              <p className="text-xs mt-1">All automated processes are currently inactive</p>
            </div>
          </div>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 capitalize">
                  {job.id.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Active
                  </span>
                  <span className="text-xs text-gray-500">Running automatically</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Automated processes run in the background to generate alerts and purchase orders.
      </div>
    </div>
  )
}