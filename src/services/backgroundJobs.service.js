import { autoPoGenerationService } from './autoPoGeneration.service'
import { alertEngineService } from './alertEngine.service'

// Store intervals to be able to clear them if needed
const intervals = new Map()

export const backgroundJobsService = {
  /**
   * Start all background jobs
   */
  startAllJobs() {
    console.log('Starting background jobs...')

    try {
      /* 
      // Start auto PO generation job (runs every 10 days)
      this.startJob('autoPoGeneration', () => {
        return autoPoGenerationService.scheduleAutoGeneration({ forecastDays: 30, modelType: 'sma' })
          .catch(err => console.error('Auto PO Generation job failed:', err))
      }, 10 * 24 * 60 * 60 * 1000) // 10 days
      */

      // Start alert generation job (runs every 5 minutes instead of every 1 minute)
      this.startJob('alertGeneration', () => {
        return alertEngineService.generateAlerts()
          .catch(err => console.error('Alert Generation job failed:', err))
      }, 5 * 60 * 1000) // 5 minutes


    } catch (error) {
      console.error('Error starting background jobs:', error)
    }
  },

  /**
   * Start a specific background job
   * @param {string} jobId - Unique identifier for the job
   * @param {Function} jobFn - Function to execute
   * @param {number} intervalMs - Interval in milliseconds
   */
  startJob(jobId, jobFn, intervalMs) {
    try {
      // Clear existing interval if any
      if (intervals.has(jobId)) {
        clearInterval(intervals.get(jobId))
      }

      // Run immediately
      jobFn().catch(err => console.error(`Job ${jobId} failed on initial run:`, err))

      // Schedule recurring execution
      const interval = setInterval(() => {
        jobFn().catch(err => console.error(`Job ${jobId} failed:`, err))
      }, intervalMs)
      intervals.set(jobId, interval)

      console.log(`Started background job: ${jobId} (every ${intervalMs / 1000 / 60} minutes)`)
    } catch (error) {
      console.error(`Error starting job ${jobId}:`, error)
    }
  },

  /**
   * Stop a specific background job
   * @param {string} jobId - Unique identifier for the job
   */
  stopJob(jobId) {
    try {
      if (intervals.has(jobId)) {
        clearInterval(intervals.get(jobId))
        intervals.delete(jobId)
        console.log(`Stopped background job: ${jobId}`)
      }
    } catch (error) {
      console.error(`Error stopping job ${jobId}:`, error)
    }
  },

  /**
   * Stop all background jobs
   */
  stopAllJobs() {
    try {
      intervals.forEach((interval, jobId) => {
        try {
          clearInterval(interval)
          console.log(`Stopped background job: ${jobId}`)
        } catch (error) {
          console.error(`Error stopping job ${jobId}:`, error)
        }
      })
      intervals.clear()
      console.log('All background jobs stopped')
    } catch (error) {
      console.error('Error stopping all background jobs:', error)
    }
  },

  /**
   * Get status of all background jobs
   */
  getJobStatus() {
    try {
      return Array.from(intervals.keys()).map(jobId => ({
        id: jobId,
        running: true
      }))
    } catch (error) {
      console.error('Error getting job status:', error)
      return []
    }
  }
}

export default backgroundJobsService