import React from 'react'

export default function Card({ className = '', children }) {
  const base = 'bg-white rounded-xl border border-gray-200 shadow-card transition-shadow hover:shadow-soft'
  return <div className={`${base} ${className}`}>{children}</div>
}
