import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
