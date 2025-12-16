import React from 'react'

export default function Badge({ variant = 'default', children, className = '' }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200'
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
  }
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
}