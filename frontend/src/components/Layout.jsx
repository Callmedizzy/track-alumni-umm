import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Download, ScrollText,
  LogOut, Menu, GraduationCap, Search, Home
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Beranda', href: '/login', icon: Home },
  { label: 'Statistik', href: '/dashboard', icon: LayoutDashboard, adminOnly: true },
  { label: 'Pelacakan Alumni', href: '/alumni', icon: Search },
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

  // Jika viewer, tidak tampilkan sidebar/dashboard ini sesuai permintaan user terbaru
  // Namun untuk keamanan, ProtectedRoute yang harusnya menangani ini.
  // Di sini kita hanya mem-filter item menu.
  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" />

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desain Biru sesuai Gambar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#0061d1] transition-transform duration-300 ease-in-out shadow-2xl',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header Profil (Sesuai Gambar: ketenangan jiwa / Admin) */}
        <div className="p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <div className="w-9 h-9 text-[#0061d1] flex items-center justify-center">
                {/* Ikon mirip di gambar */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight truncate">
                {user?.username || 'Alumni Tracker'}
              </h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">
                {isAdmin ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Pill style */}
        <nav className="flex-1 px-4 py-2 space-y-3 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 group border',
                  active
                    ? 'bg-white text-[#0061d1] shadow-xl border-white'
                    : 'bg-white/5 text-white border-transparent hover:bg-white/10'
                )}
              >
                <Icon className={clsx('w-5 h-5', active ? 'text-[#0061d1]' : 'text-white')} />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 text-white/80 hover:bg-red-500/20 hover:text-white transition-all border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <GraduationCap size={24} className="text-[#0061d1]" />
            <span className="font-bold text-[#0061d1]">UMM Tracker</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-[#0061d1]"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
