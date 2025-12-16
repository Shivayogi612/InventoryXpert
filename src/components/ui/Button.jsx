import React from 'react'

export default function Button({ variant = 'default', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg'
  
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-500 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
  }
  
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`
  
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}