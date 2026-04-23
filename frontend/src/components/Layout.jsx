import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Download, ScrollText,
  LogOut, Menu, X, GraduationCap, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Alumni', href: '/alumni', icon: Users },
  { label: 'Export Data', href: '/export', icon: Download, adminOnly: true },
  { label: 'Audit Log', href: '/admin/logs', icon: ScrollText, adminOnly: true },
]

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-surface-card border-r border-surface-border',
          'transform transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-100 text-sm leading-tight">Alumni Tracker</p>
            <p className="text-xs text-slate-500">UMM — Sistem Manajemen</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  active
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                    : 'text-slate-400 hover:bg-surface-border hover:text-slate-200'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-surface">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.username}</p>
              <span className={clsx(
                'text-xs font-medium',
                user?.role === 'admin' ? 'text-primary-400' : 'text-slate-500'
              )}>
                {user?.role === 'admin' ? '🔑 Admin' : '👁 Viewer'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary justify-center text-red-400 border-red-600/20 hover:bg-red-600/10"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-surface-card border-b border-surface-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-border text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-slate-200 text-sm">Alumni Tracker</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
