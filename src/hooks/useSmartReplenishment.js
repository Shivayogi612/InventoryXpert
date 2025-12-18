import { useState } from 'react'
import { smartReplenishmentService } from '../services/smartReplenishment.service'
import { toast } from 'react-hot-toast'

export function useSmartReplenishment() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestedTransfers, setSuggestedTransfers] = useState([])
  const [lastAnalysis, setLastAnalysis] = useState(null)

  const analyzeAndSuggestTransfers = async (options = {}) => {
    setIsAnalyzing(true)
    try {
      const transfers = await smartReplenishmentService.analyzeAndSuggestTransfers(options)
      setSuggestedTransfers(transfers)
      setLastAnalysis({
        transfers,
        timestamp: new Date().toISOString(),
        count: transfers.length
      })
      
      if (transfers.length > 0) {
        toast.success(`Found ${transfers.length} suggested transfer(s)`)
      } else {
        toast.success('No transfers suggested at this time')
      }
      
      return transfers
    } catch (err) {
      console.error('Smart replenishment analysis failed:', err)
      toast.error(`Failed to analyze transfers: ${err.message}`)
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeTransfer = async (transferData) => {
    try {
      const result = await smartReplenishmentService.executeTransfer(transferData)
      toast.success(`Transfer executed successfully`)
      return result
    } catch (err) {
      console.error('Transfer execution failed:', err)
      toast.error(`Failed to execute transfer: ${err.message}`)
      throw err
    }
  }

  return {
    isAnalyzing,
    suggestedTransfers,
    lastAnalysis,
    analyzeAndSuggestTransfers,
    executeTransfer
  }
}