import React from 'react'

export default function Dialog({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 w-full max-w-5xl max-h-[95vh]">
          {children}
        </div>
      </div>
    </div>
  )
}