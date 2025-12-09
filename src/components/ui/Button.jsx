import React from 'react'

export default function Button({ variant = 'default', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg'
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6',
  }
  const variants = {
    default: 'bg-primary-600 text-white hover:bg-primary-700 shadow',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
    destructive: 'bg-danger text-white hover:bg-red-600',
  }
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`
  return (
    <button className={cls} {...props}>{children}</button>
  )
}

