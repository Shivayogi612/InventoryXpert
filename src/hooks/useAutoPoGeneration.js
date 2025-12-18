import { useState } from 'react'
import { autoPoGenerationService } from '../services/autoPoGeneration.service'
import { toast } from 'react-hot-toast'

export function useAutoPoGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const generatePurchaseOrders = async (options = {}) => {
    setIsGenerating(true)
    try {
      const result = await autoPoGenerationService.generatePurchaseOrders(options)
      setLastResult(result)
      
      if (result.summary.ordersGenerated > 0) {
        toast.success(`Successfully generated ${result.summary.ordersGenerated} purchase order(s)`)
      } else {
        toast.success('No purchase orders needed at this time')
      }
      
      return result
    } catch (err) {
      console.error('Auto PO generation failed:', err)
      toast.error(`Failed to generate purchase orders: ${err.message}`)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    lastResult,
    generatePurchaseOrders
  }
}