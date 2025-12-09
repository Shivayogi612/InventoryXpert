import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">

      {/* Navbar stays at top on both mobile & desktop */}
      <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden md:overflow-visible">

        {/* Sidebar: 
            - Mobile: slide-in (same behavior)
            - Desktop: fixed left layout (always visible, full height)
        */}
        <Sidebar open={sidebarOpen} />

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Dark overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
