import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, LogOut } from 'lucide-react'
import AlertCenter from '../alerts/AlertCenter'
import useAlerts from '../../hooks/useAlerts'
import Button from '../ui/Button'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { alerts = [], unreadCount } = useAlerts()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-[#0b1220] border-b border-white/10 sticky top-0 z-40">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-white/10 text-white"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-base text-white">InventoryXpert</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="ghost"
              className="relative p-0 flex items-center justify-center text-white hover:bg-transparent focus:bg-transparent"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Bell className="!w-6 !h-6" />
              {alerts.length > 0 && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-danger border-2 border-[#0b1220]" />
                  <span className="sr-only">{unreadCount} unread alerts</span>
                </>
              )}
            </Button>
            {open && <AlertCenter onClose={() => setOpen(false)} />}
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <span className="text-white truncate max-w-[150px]">{user?.email}</span>
            <button
              onClick={logout}
              className="group relative h-9 px-4 flex items-center gap-2 rounded-lg overflow-hidden
                         border border-white/20 text-white text-sm font-medium
                         backdrop-blur-sm bg-white/5
                         hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/20
                         active:scale-95
                         transition-all duration-300 ease-out"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 
                              group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 
                              transition-all duration-500 ease-out" />

              {/* Content */}
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-[-2px]">
                Logout
              </span>
              <LogOut className="relative z-10 w-4 h-4 transition-all duration-300 
                                 group-hover:translate-x-1 group-hover:scale-110" />
            </button>
          </div>
          {/* Mobile logout button */}
          <div className="md:hidden">
            <button
              onClick={logout}
              className="p-2 text-white"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}