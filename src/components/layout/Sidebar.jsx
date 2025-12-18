import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Box, Truck, History, TrendingUp } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${active
      ? 'bg-white/5 text-white'
      : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm font-medium truncate">{label}</span>
  </Link>
)

export default function Sidebar({ open = false }) {
  const { pathname } = useLocation()

  return (
    <aside
      className={`
        /* Base */
        bg-[#0b1220] text-white border-r border-white/10
        w-64 z-40

        /* Full height below navbar */
        fixed md:sticky
        top-16 md:top-16
        bottom-0 md:h-[calc(100vh-4rem)]

        /* Mobile slide-in */
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}

        /* Desktop: ALWAYS visible */
        md:translate-x-0
      `}
    >
      <nav className="py-3 space-y-1 overflow-y-auto h-full">
        <NavItem
          to="/dashboard"
          icon={Home}
          label="Dashboard"
          active={pathname.startsWith('/dashboard')}
        />

        <NavItem
          to="/inventory"
          icon={Box}
          label="Inventory"
          active={pathname.startsWith('/inventory')}
        />

        {/* <NavItem
          to="/advanced-forecasting"
          icon={TrendingUp}
          label="Advanced Forecasting"
          active={pathname.startsWith('/advanced-forecasting')}
        /> */}

        <NavItem
          to="/transactions"
          icon={History}
          label="Transactions"
          active={pathname.startsWith('/transactions')}
        />

        <NavItem
          to="/suppliers"
          icon={Truck}
          label="Suppliers"
          active={pathname.startsWith('/suppliers')}
        />
      </nav>
    </aside>
  )
}