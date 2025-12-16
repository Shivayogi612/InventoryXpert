import React from 'react'

export default function Input({ className = '', ...props }) {
  const base = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-opacity-50 outline-none transition-all duration-200 shadow-sm hover:border-gray-400'
  return <input className={`${base} ${className}`} {...props} />
}