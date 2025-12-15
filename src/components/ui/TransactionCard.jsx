import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'
import Badge from './Badge'

// Custom SVG Icons
const StockInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const StockOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const AdjustmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
)

const ReturnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
)

const DamagedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const getTypeIcon = (type) => {
  switch (type) {
    case 'in': return <StockInIcon />
    case 'out': return <StockOutIcon />
    case 'adjustment': return <AdjustmentIcon />
    case 'return': return <ReturnIcon />
    case 'damaged': return <DamagedIcon />
    default: return <StockInIcon />
  }
}

const getTypeColor = (type) => {
  switch (type) {
    case 'in': return 'from-green-500 to-emerald-500'
    case 'out': return 'from-orange-500 to-red-500'
    case 'adjustment': return 'from-purple-500 to-indigo-500'
    case 'return': return 'from-blue-500 to-cyan-500'
    case 'damaged': return 'from-red-500 to-rose-500'
    default: return 'from-gray-500 to-gray-600'
  }
}

const getTypeBg = (type) => {
  switch (type) {
    case 'in': return 'bg-green-50 text-green-700 border-green-200'
    case 'out': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'adjustment': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'return': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'damaged': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const StockMeter = ({ before, after, max = 100 }) => {
  const beforePercent = Math.min(100, (before / max) * 100)
  const afterPercent = Math.min(100, (after / max) * 100)
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="relative h-full">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-1000 ease-out"
          style={{ width: `${beforePercent}%` }}
        ></div>
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500"
          initial={{ width: `${beforePercent}%` }}
          animate={{ width: `${afterPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>
      </div>
    </div>
  )
}

const TransactionCard = ({ transaction, product }) => {
  const [expanded, setExpanded] = useState(false)
  
  const toggleExpand = () => {
    setExpanded(!expanded)
  }
  
  const quantityChange = transaction.new_quantity - transaction.previous_quantity
  const maxStock = Math.max(transaction.previous_quantity, transaction.new_quantity, 50)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent z-0"></div>
      
      <motion.div 
        className={`relative z-10 mb-6 cursor-pointer ${expanded ? 'scale-[1.02]' : ''}`}
        whileHover={{ scale: 1.01 }}
        onClick={toggleExpand}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Gradient header bar */}
          <div className={`h-2 bg-gradient-to-r ${getTypeColor(transaction.type)}`}></div>
          
          <div className="p-5">
            {/* Top row with date and type */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeBg(transaction.type)}`}>
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{product?.name || 'Unknown Product'}</h3>
                  <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <Badge variant={transaction.type === 'in' ? 'success' : transaction.type === 'out' ? 'danger' : 'warning'}>
                {transaction.type.toUpperCase()}
              </Badge>
            </div>
            
            {/* Quantity change visualization */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Before</p>
                <p className="text-xl font-bold">{transaction.previous_quantity}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {quantityChange > 0 ? '+' : ''}{quantityChange}
                  </span>
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      quantityChange > 0 
                        ? 'bg-green-100 text-green-600' 
                        : quantityChange < 0 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600'
                    }`}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {quantityChange > 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    ) : quantityChange < 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </motion.div>
                </div>
                <StockMeter before={transaction.previous_quantity} after={transaction.new_quantity} max={maxStock} />
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">After</p>
                <p className="text-xl font-bold">{transaction.new_quantity}</p>
              </div>
            </div>
            
            {/* Expanded details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 pt-4 mt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Performed By</p>
                      <p className="font-medium">{transaction.performed_by ? `${transaction.performed_by} by manager` : 'by manager'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reference</p>
                      <p className="font-medium">{transaction.reference_number || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="font-medium">{transaction.reason || 'N/A'}</p>
                    </div>
                    {transaction.notes && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="font-medium">{transaction.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Expand indicator */}
            <div className="flex justify-center mt-3">
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                className="text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default TransactionCard