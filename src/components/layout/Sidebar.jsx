import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Box, FileText, Truck, History } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${active ? 'bg-white/5 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
)

export default function Sidebar({ open = false }) {
  const { pathname } = useLocation()
  return (
    <aside className={`fixed md:sticky z-40 md:z-20 top-16 bottom-0 md:top-16 md:h-[calc(100vh-4rem)] w-64 bg-[#0b1220] text-white border-r border-white/10 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

      <nav className="py-3 space-y-1">
        <NavItem to="/dashboard" icon={Home} label="Dashboard" active={pathname.startsWith('/dashboard')} />
        <NavItem to="/inventory" icon={Box} label="Inventory" active={pathname.startsWith('/inventory')} />
        <NavItem to="/transactions" icon={History} label="Transactions" active={pathname.startsWith('/transactions')} />
        <NavItem to="/suppliers" icon={Truck} label="Suppliers" active={pathname.startsWith('/suppliers')} />
      </nav>
    </aside>
  )
}
