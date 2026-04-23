import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Download, ScrollText,
  LogOut, GraduationCap, KeyRound, ChevronDown,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',  href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Data Alumni', href: '/alumni',      icon: Users },
  { label: 'Export Data', href: '/export',      icon: Download,  adminOnly: true },
  { label: 'Audit Log',   href: '/admin/logs',  icon: ScrollText, adminOnly: true },
]

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const handleLogout = () => {
    setDropOpen(false)
    logout()
    navigate('/login')
  }

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Active page label for breadcrumb
  const activePage = filteredNav.find(n => location.pathname.startsWith(n.href))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" />

      {/* ===== TOP NAVBAR ===== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '0 5%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
          {/* Brand */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#4f46e5,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2e1065' }}>UMM Tracker</span>
          </Link>

          {/* Right side — Admin key dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              id="admin-menu-btn"
              onClick={() => setDropOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: dropOpen ? '#ede9fe' : '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: 10,
                padding: '7px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              {/* Key icon */}
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <KeyRound size={14} color="#fff" />
              </div>
              {/* Username */}
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#3730a3' }}>
                {user?.username || 'Admin'}
              </span>
              <ChevronDown
                size={14}
                color="#6366f1"
                style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* ===== DROPDOWN MENU ===== */}
            {dropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                minWidth: 220,
                padding: '8px',
                animation: 'dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                zIndex: 100,
              }}>
                <style>{`
                  @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                  }
                `}</style>

                {/* User info header */}
                <div style={{
                  padding: '10px 12px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#4f46e5,#2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.95rem', color: '#fff', flexShrink: 0,
                    }}>
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>
                        {user?.username}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6366f1', margin: 0, fontWeight: 600 }}>
                        {user?.role === 'admin' ? '🔑 Administrator' : '👁 Viewer'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nav links */}
                {filteredNav.map(item => {
                  const Icon = item.icon
                  const active = location.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        background: active ? 'rgba(79,70,229,0.08)' : 'transparent',
                        color: active ? '#4f46e5' : '#334155',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.88rem',
                        transition: 'background 0.15s, color 0.15s',
                        marginBottom: 2,
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1e293b' }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: active ? 'rgba(79,70,229,0.12)' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={14} color={active ? '#4f46e5' : '#64748b'} />
                      </div>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && <ChevronRight size={13} color="#4f46e5" />}
                    </Link>
                  )
                })}

                {/* Divider + Logout */}
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6 }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8,
                      background: 'transparent', border: 'none',
                      color: '#dc2626', fontWeight: 600, fontSize: '0.88rem',
                      cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <LogOut size={14} color="#dc2626" />
                    </div>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== BREADCRUMB ===== */}
      {activePage && (
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #f1f5f9',
          padding: '10px 5%',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Admin Panel</span>
            <ChevronRight size={12} color="#cbd5e1" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>{activePage.label}</span>
          </div>
        </div>
      )}

      {/* ===== PAGE CONTENT ===== */}
      <main style={{ flex: 1, padding: '32px 5%', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{
        textAlign: 'center', padding: '16px', background: '#fff',
        borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem',
      }}>
        © 2026 Sistem Pelacakan Alumni UMM · Admin Panel
      </footer>
    </div>
  )
}
