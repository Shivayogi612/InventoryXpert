import React, { useMemo, useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useCache } from '../hooks/useCache'
import { productsService } from '../services/products.service'
import { transactionsService } from '../services/transactions.service'
import { advancedForecastingService } from '../services/advancedForecasting.service'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'

export default function AdvancedForecasting() {
  const { data: products = [] } = useCache('products', () => productsService.getAll(), { staleTime: 5 * 60 * 1000 })
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [forecastModel, setForecastModel] = useState('sma')
  const [forecastParams, setForecastParams] = useState({ days: 30, window: 7, seasonType: 'weekly' })
  const [forecastData, setForecastData] = useState([])
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [scenarioGrowth, setScenarioGrowth] = useState(20)
  const [scenarioResults, setScenarioResults] = useState(null)
  const [safetyStockData, setSafetyStockData] = useState(null)

  // Get selected product
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null
  }, [products, selectedProductId])

  // Load historical data when product is selected
  useEffect(() => {
    let mounted = true
    async function loadHistoricalData() {
      if (!selectedProductId) return
      
      try {
        setLoading(true)
        const txns = await transactionsService.getByProduct(selectedProductId, 90)
        
        // Aggregate daily sales
        const dailyMap = {}
        const now = new Date()
        for (let i = 89; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const key = d.toISOString().slice(0, 10)
          dailyMap[key] = 0
        }
        
        txns.forEach(t => {
          if (!t || String(t.type).toLowerCase() !== 'out') return
          const day = (new Date(t.created_at)).toISOString().slice(0, 10)
          if (day in dailyMap) dailyMap[day] += Math.abs(Number(t.quantity) || 0)
        })
        
        const series = Object.keys(dailyMap).map(d => ({ 
          date: d, 
          actual: dailyMap[d],
          forecasted: null
        }))
        
        if (mounted) {
          setHistoricalData(series)
        }
      } catch (err) {
        console.error('Error loading historical data', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    loadHistoricalData()
    return () => { mounted = false }
  }, [selectedProductId])

  // Generate forecast when parameters change
  useEffect(() => {
    let mounted = true
    async function generateForecast() {
      if (!selectedProductId) return
      
      try {
        setLoading(true)
        const forecasts = await advancedForecastingService.generateForecastByModel(
          selectedProductId, 
          forecastModel, 
          forecastParams
        )
        
        // Combine historical and forecast data
        const combinedData = [...historicalData]
        forecasts.forEach((forecast, index) => {
          if (combinedData[index]) {
            combinedData[index].forecasted = forecast.forecasted_demand
          }
        })
        
        if (mounted) {
          setForecastData(forecasts)
          
          // Calculate safety stock
          const safetyStock = advancedForecastingService.calculateDynamicSafetyStock(forecasts, 7, 0.95)
          setSafetyStockData(safetyStock)
          
          // Calculate scenario
          const scenario = advancedForecastingService.calculateScenarioImpact(forecasts, scenarioGrowth)
          setScenarioResults(scenario)
        }
      } catch (err) {
        console.error('Error generating forecast', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    generateForecast()
    return () => { mounted = false }
  }, [selectedProductId, forecastModel, forecastParams, historicalData, scenarioGrowth])

  // Handle model parameter changes
  const handleParamChange = (param, value) => {
    setForecastParams(prev => ({
      ...prev,
      [param]: Number(value)
    }))
  }

  // Reset to defaults
  const resetDefaults = () => {
    setForecastModel('sma')
    setForecastParams({ days: 30, window: 7, seasonType: 'weekly' })
    setScenarioGrowth(20)
  }
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Advanced Demand Forecasting</h1>
              <p className="text-blue-100 mt-1">Multiple forecasting models with dynamic safety stock calculation</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetDefaults}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProductId === product.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.sku}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProduct && (
          <>
            {/* Product Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">SKU: {selectedProduct.sku}</span>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {selectedProduct.category || 'Uncategorized'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        In Stock: {selectedProduct.quantity}
                      </span>
                    </div>
                  </div>
                </div>
                
                {safetyStockData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-blue-700 font-medium">Avg Daily Demand</div>
                      <div className="text-lg font-bold text-blue-900">{Math.round(safetyStockData.avg_daily_demand)}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-amber-700 font-medium">Safety Stock</div>
                      <div className="text-lg font-bold text-amber-900">{safetyStockData.safety_stock}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-purple-700 font-medium">Reorder Point</div>
                      <div className="text-lg font-bold text-purple-900">{safetyStockData.reorder_point}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-green-700 font-medium">Lead Time</div>
                      <div className="text-lg font-bold text-green-900">{safetyStockData.lead_time_days} days</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecasting Models</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Model Selection */}
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forecasting Model</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'sma', name: 'Simple Moving Average', icon: TrendingUp },
                          { id: 'seasonal', name: 'Seasonal (Weekly)', icon: Calendar },
                          { id: 'promotion', name: 'Promotion-Aware', icon: Tag }
                        ].map(model => {
                          const Icon = model.icon
                          return (
                            <button
                              key={model.id}
                              onClick={() => setForecastModel(model.id)}
                              className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                                forecastModel === model.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{model.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
                      <input
                        type="range"
                        min="7"
                        max="90"
                        value={forecastParams.days}
                        onChange={(e) => handleParamChange('days', e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>7 days</span>
                        <span className="font-medium">{forecastParams.days} days</span>
                        <span>90 days</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Model Parameters */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Model Parameters</h3>
                    
                    {forecastModel === 'sma' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moving Average Window: {forecastParams.window} days
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="30"
                          value={forecastParams.window}
                          onChange={(e) => handleParamChange('window', e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>3 days</span>
                          <span className="font-medium">{forecastParams.window} days</span>
                          <span>30 days</span>
                        </div>
                      </div>
                    )}
                    
                    {forecastModel === 'seasonal' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Season Type</label>
                          <select 
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            value={forecastParams.seasonType || 'weekly'}
                            onChange={(e) => handleParamChange('seasonType', e.target.value)}
                          >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Historical Period</label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
                            <option>Last 90 days</option>
                            <option>Last 6 months</option>
                            <option>Last year</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {forecastModel === 'promotion' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Planned Promotions</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          No promotions scheduled. Add promotions to see their impact on demand forecasts.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Visualization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Demand Forecast Visualization</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Actual Sales</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Forecasted Demand</span>
                  </div>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historicalData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Units']}
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="Actual Sales"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecasted"
                      name="Forecasted Demand"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scenario Planning */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Scenario Planning</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Growth Projection: {scenarioGrowth}%
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="100"
                      value={scenarioGrowth}
                      onChange={(e) => setScenarioGrowth(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>-50%</span>
                      <span className="font-medium">{scenarioGrowth}%</span>
                      <span>+100%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Adjust the slider to see how different sales growth rates would affect your inventory needs.
                    </p>
                  </div>
                </div>
                
                {scenarioResults && (
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-700 font-medium mb-1">Current Forecast</div>
                        <div className="text-2xl font-bold text-blue-900">{scenarioResults.original_total}</div>
                        <div className="text-xs text-blue-600">units over {forecastParams.days} days</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-700 font-medium mb-1">Projected Demand</div>
                        <div className="text-2xl font-bold text-green-900">{scenarioResults.adjusted_total}</div>
                        <div className="text-xs text-green-600">units over {forecastParams.days} days</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-sm text-amber-700 font-medium mb-1">Additional Units Needed</div>
                        <div className="text-2xl font-bold text-amber-900">{scenarioResults.difference_total}</div>
                        <div className="text-xs text-amber-600">to meet increased demand</div>
                      </div>
                    </div>
                    
                    {scenarioResults.difference_total > 0 && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-amber-800">Inventory Recommendation</div>
                            <p className="text-sm text-amber-700 mt-1">
                              Based on your {scenarioGrowth}% growth projection, you should consider increasing 
                              your stock by {scenarioResults.difference_total} units to avoid stockouts over 
                              the next {forecastParams.days} days.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Detailed Forecast Data</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted Demand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Version</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecastData.map((forecast, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(forecast.forecast_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {forecast.forecasted_demand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${forecast.confidence_level * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round(forecast.confidence_level * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {forecast.model_version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedProduct && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product to Begin Forecasting</h3>
            <p className="text-gray-500">
              Choose a product from the list above to view advanced demand forecasting insights.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}