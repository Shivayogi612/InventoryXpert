import React from 'react'

export default function Input({ className = '', ...props }) {
  const base = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none'
  return <input className={`${base} ${className}`} {...props} />
}

