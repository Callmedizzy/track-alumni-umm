import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, Eye, EyeOff, Lock, User, AlertCircle, X, Search, ChevronDown, Key } from 'lucide-react'

export default function LoginPage() {
  const { user, login, logout, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('Semua')
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)

  const categories = ['Semua', 'Nama', 'NIM', 'Prodi', 'Fakultas']

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim() && searchCategory === 'Semua') {
      navigate('/alumni')
      return
    }
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (searchCategory !== 'Semua') params.set('category', searchCategory.toLowerCase())
    navigate(`/alumni?${params.toString()}`)
  }

  // if (user?.role === 'admin') return <Navigate to="/dashboard" replace />

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username wajib diisi'
    if (!form.password) e.password = 'Password wajib diisi'
    else if (form.password.length < 4) e.password = 'Password minimal 4 karakter'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    const result = await login(form.username, form.password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const menuItemsData = [
    { id: 'program-studi', icon: '\u{1F4D8}', label: 'Program Studi' },
    { id: 'peta-alumni', icon: '\u{1F5FA}\u{FE0F}', label: 'Peta Alumni' },
    { id: 'statistik', icon: '\u{1F4CA}', label: 'Statistik' },
  ]

  const handleMenuClick = (itemId) => {
    if (itemId === 'program-studi') {
      window.location.href = '/program-studi.html'
      return
    }

    if (itemId === 'statistik') {
      window.location.href = '/statistik.html'
    }

    if (itemId === 'peta-alumni') {
      window.location.href = '/peta.html'
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
      {/* Google Font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: isMobile ? '0 20px' : '0 40px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: isMobile ? 64 : 84,
          maxWidth: 1600, margin: '0 auto', width: '100%',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            <img 
              src="/logo-umm.png" 
              alt="UMM Logo" 
              style={{ width: isMobile ? 36 : 54, height: isMobile ? 36 : 54, objectFit: 'contain' }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <span style={{ 
              fontWeight: 800, 
              fontSize: isMobile ? '1.1rem' : '1.6rem', 
              color: '#1e3a8a', 
              letterSpacing: '-0.5px' 
            }}>
              UMM Tracker
            </span>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {user ? (
              <>
                {/* Profile Button (User Icon) */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      width: isMobile ? 40 : 56, height: isMobile ? 40 : 56, borderRadius: isMobile ? 12 : 16,
                      background: '#fff',
                      color: '#000',
                      border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => { 
                      if (!isMobile) {
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => { 
                      if (!isMobile) {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <User size={isMobile ? 20 : 26} fill="#000" />
                  </button>

                  {/* Dropdown Menu (Image 3 Style) */}
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      width: 280,
                      background: '#fff',
                      borderRadius: 20,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                      border: '1px solid #f1f5f9',
                      padding: '24px',
                      zIndex: 100,
                      animation: 'slideIn 0.2s ease-out'
                    }}>
                      <style>{`@keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
                      
                      {/* User Info Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%',
                          background: '#f1f5f9', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <User size={24} color="#94a3b8" />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.username}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                            {user.username.toLowerCase()}@alumni.umm.ac.id
                          </p>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: '#f1f5f9', margin: '0 -24px 20px' }} />

                      {/* Menu Links */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { navigate('/dashboard'); setShowUserMenu(false) }}
                            style={{
                              background: 'none', border: 'none', textAlign: 'left',
                              fontSize: '1rem', fontWeight: 600, color: '#3b82f6',
                              padding: '8px 0', cursor: 'pointer', fontFamily: 'inherit'
                            }}
                          >
                            Dashboard
                          </button>
                        )}
                        
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b', padding: '4px 0' }}>
                          Status: {user.role === 'admin' ? 'Administrator' : 'User'}
                        </div>

                        <button
                          onClick={() => { logout(); setShowUserMenu(false); navigate('/login') }}
                          style={{
                            background: 'none', border: 'none', textAlign: 'left',
                            fontSize: '1rem', fontWeight: 600, color: '#ef4444',
                            padding: '8px 0', cursor: 'pointer', fontFamily: 'inherit'
                          }}
                        >
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                title="Login Admin"
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: '#fff',
                  color: '#000',
                  border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <User size={26} fill="#000" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 55%, #93c5fd 100%)',
        padding: isMobile ? '60px 20px 80px' : '120px 5% 150px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: isMobile ? '30px 30px' : '50px 50px',
        }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: isMobile ? '1.1rem' : '1.6rem', fontWeight: 500, marginBottom: 8, letterSpacing: '0.5px' }}>
            Informasi
          </p>
          <h1 style={{
            color: '#fff', fontSize: isMobile ? '2.4rem' : 'clamp(3rem, 6.5vw, 5.5rem)',
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: isMobile ? 16 : 32, letterSpacing: '-1.5px',
            textShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            Pelacakan Mahasiswa
          </h1>
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: isMobile ? -30 : -55, position: 'relative', zIndex: 10,
        padding: isMobile ? '0 20px' : '0 5%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'stretch',
          maxWidth: 1100, width: '100%',
          height: isMobile ? 54 : 84,
          borderRadius: 100,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
          border: '1px solid rgba(79,70,229,0.08)',
          overflow: 'visible',
        }}>
          {/* Category pill */}
          {!isMobile && (
            <div 
              style={{ position: 'relative', display: 'flex' }}
              onMouseLeave={() => setShowCategoryMenu(false)}
            >
              <div 
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0 32px 0 40px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', flexShrink: 0,
                  fontWeight: 700, fontSize: '1.1rem', color: '#fff',
                  minWidth: 160,
                  borderRadius: '100px 0 0 100px',
                }}
              >
                {searchCategory.toUpperCase()} <ChevronDown size={20} strokeWidth={2.5} style={{ 
                  transform: showCategoryMenu ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  color: '#fff'
                }} />
              </div>

              {showCategoryMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: 240,
                  background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                  borderRadius: '24px', border: '1px solid #f1f5f9',
                  zIndex: 100, overflow: 'hidden',
                  animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  {categories.map((cat, idx) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setSearchCategory(cat)
                        setShowCategoryMenu(false)
                      }}
                      style={{
                        padding: '16px 28px', fontSize: '1rem', fontWeight: 800,
                        color: cat === searchCategory ? '#fff' : '#2563eb',
                        background: cat === searchCategory ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                        borderBottom: idx === categories.length - 1 ? 'none' : '1px solid #f8fafc',
                        display: 'flex', alignItems: 'center',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={e => { if (cat !== searchCategory) e.currentTarget.style.background = '#f1f5f9' }}
                      onMouseLeave={e => { if (cat !== searchCategory) e.currentTarget.style.background = 'transparent' }}
                    >
                      {cat.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={isMobile ? "Cari alumni..." : `Cari berdasarkan ${searchCategory === 'Semua' ? 'Nama/NIM' : searchCategory}...`}
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: isMobile ? '0 20px' : '0 32px', 
              fontSize: isMobile ? '0.95rem' : '1.2rem',
              color: '#0f172a', background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          {/* Search btn */}
          <button 
            onClick={handleSearch}
            style={{
              background: 'transparent', border: 'none',
              padding: isMobile ? '0 16px' : '0 40px', cursor: 'pointer',
              color: '#4f46e5', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#3b82f6' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4f46e5' }}
          >
            <Search size={isMobile ? 22 : 32} strokeWidth={2.5} />
          </button>
        </div>
        <a href="/alumni" style={{ marginTop: isMobile ? 12 : 20, color: '#4f46e5', fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 700, textDecoration: 'underline' }}>
          Pencarian Spesifik
        </a>
      </div>

      {/* ===== MENU GRID ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 16 : 40,
        maxWidth: 1400,
        margin: isMobile ? '40px auto 60px' : '80px auto 120px',
        padding: isMobile ? '0 20px' : '0 5%',
        width: '100%',
      }}>
        {menuItemsData.map((item) => (
          <div
            key={item.label}
            onClick={() => handleMenuClick(item.id)}
            style={{
              background: '#fff', borderRadius: isMobile ? 24 : 36,
              padding: isMobile ? '32px 20px' : '70px 40px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={e => { 
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'; 
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#dbeafe';
              }
            }}
            onMouseLeave={e => { 
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }
            }}
          >
            <div style={{ 
              fontSize: isMobile ? '3.5rem' : '6rem', 
              marginBottom: isMobile ? 16 : 32, 
              filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.15))' 
            }}>
              {item.icon}
            </div>
            <div style={{ 
              fontSize: isMobile ? '1.1rem' : '1.8rem', 
              fontWeight: 800, 
              color: '#1e293b' 
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{
        textAlign: 'center', padding: '20px', marginTop: 'auto',
        color: '#64748b', fontSize: '0.88rem', borderTop: '1px solid #e2e8f0',
        background: '#fff',
      }}>
        © 2026 Sistem Pelacakan Alumni UMM. All rights reserved.
      </footer>

      {/* ===== LOGIN MODAL ===== */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, padding: '36px 32px',
            width: '100%', maxWidth: 400,
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative',
          }}>
            <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: '#f1f5f9', border: 'none', borderRadius: 8,
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Selamat Datang!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Masuk ke sistem manajemen alumni</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 18,
              }}>
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                <p style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 14px 12px 36px',
                      border: `1px solid ${errors.username ? '#f87171' : '#e2e8f0'}`,
                      borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit',
                      outline: 'none', color: '#0f172a', background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.username && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 40px 12px 36px',
                      border: `1px solid ${errors.password ? '#f87171' : '#e2e8f0'}`,
                      borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit',
                      outline: 'none', color: '#0f172a', background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#a5b4fc' : '#4f46e5',
                  color: '#fff', border: 'none',
                  borderRadius: 10, padding: '13px',
                  fontWeight: 700, fontSize: '1rem',
                  fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 6,
                  transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#4338ca' }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#4f46e5' }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Masuk...
                  </>
                ) : 'Masuk ke Sistem'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: 20 }}>
              © 2025 Universitas Muhammadiyah Malang
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
