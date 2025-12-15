import React from 'react'
import { motion } from 'framer-motion'

const Timeline = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent z-0"></div>
      <div className="ml-8 relative z-10">
        {children}
      </div>
    </div>
  )
}

const TimelineItem = ({ children, isActive = false, className = '' }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative ${className}`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-4 border-white shadow-lg"></div>
      )}
      {!isActive && (
        <div className="absolute -left-8 top-6 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
      )}
      {children}
    </motion.div>
  )
}

Timeline.Item = TimelineItem

export default Timeline