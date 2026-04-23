import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, Eye, EyeOff, Lock, User, AlertCircle, X, Search, ChevronDown } from 'lucide-react'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [showModal, setShowModal] = useState(false)

  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />

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
    { id: 'perguruan-tinggi', icon: '\u{1F3E2}', label: 'Perguruan Tinggi' },
    { id: 'statistik', icon: '\u{1F4CA}', label: 'Statistik' },
    { id: 'publikasi', icon: '\u{1F4DA}', label: 'Publikasi' },
    { id: 'pengumuman', icon: '\u{1F4E2}', label: 'Pengumuman' },
    { id: 'peta-alumni', icon: '\u{1F5FA}\u{FE0F}', label: 'Peta Alumni' },
  ]

  const handleMenuClick = (itemId) => {
    if (itemId === 'program-studi') {
      window.location.href = '/program-studi.html'
      return
    }

    if (itemId === 'statistik') {
      window.location.href = '/statistik.html'
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
        padding: '0 5%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#4f46e5,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2e1065' }}>UMM Tracker</span>
          </div>

          {/* Login Button */}
          <button
            id="open-login-btn"
            onClick={() => setShowModal(true)}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#4338ca'}
            onMouseLeave={e => e.target.style.background = '#4f46e5'}
          >
            Login Admin
          </button>
        </div>
      </nav>

      {/* ===== HERO BANNER ===== */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 55%, #93c5fd 100%)',
        padding: '96px 5% 108px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.4rem', fontWeight: 400, marginBottom: 4 }}>
            Informasi
          </p>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: 28, letterSpacing: '-1px',
            textShadow: '0 4px 15px rgba(0,0,0,0.1)',
          }}>
            Pembaruan Data Diri
          </h1>
        </div>
      </div>

      {/* ===== SEARCH BAR (overlapping hero) ===== */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: -40, position: 'relative', zIndex: 10,
        padding: '0 5%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'stretch',
          maxWidth: 900, width: '100%',
          borderRadius: 100,
          background: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(79,70,229,0.12)',
          overflow: 'hidden',
        }}>
          {/* Category pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 20px 0 24px',
            background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            cursor: 'pointer', flexShrink: 0,
            fontWeight: 700, fontSize: '0.95rem', color: '#1e293b',
          }}>
            Semua <ChevronDown size={15} />
          </div>
          {/* Input */}
          <input
            type="text"
            placeholder="Kata kunci: [Nama] [PT] [Prodi] [NIM] [NIDN] [NUPTK]"
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '16px 20px', fontSize: '0.97rem',
              color: '#0f172a', background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          {/* Search btn */}
          <button style={{
            background: 'transparent', border: 'none',
            padding: '0 28px', cursor: 'pointer',
            color: '#a855f7', display: 'flex', alignItems: 'center',
          }}>
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>
        <a href="/daftar.html" style={{ marginTop: 10, color: '#3b82f6', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'underline' }}>
          Pencarian Spesifik
        </a>
      </div>

      {/* ===== MENU GRID ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        maxWidth: 900,
        margin: '48px auto 0',
        padding: '0 5%',
        width: '100%',
      }}>
        {menuItemsData.map((item) => (
          <div
            key={item.label}
            style={{
              background: '#fff', borderRadius: 16,
              padding: '28px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onClick={() => handleMenuClick(item.id)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{item.icon}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
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
