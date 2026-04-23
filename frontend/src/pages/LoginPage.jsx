import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  if (user) return <Navigate to="/dashboard" replace />

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

  return (
    <div className="min-h-screen flex bg-surface overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-900 via-primary-800 to-surface items-center justify-center p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #93c5fd 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center shadow-2xl shadow-primary-900/50">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 text-balance">
            Alumni Tracker
            <span className="block text-primary-300">UMM</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sistem Manajemen Data Alumni<br />
            Universitas Muhammadiyah Malang
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Total Alumni', value: '142K+' },
              { label: 'Tahun Data', value: '25 Thn' },
              { label: 'Fakultas', value: '11' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-primary-300">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-md">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">Alumni Tracker UMM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100">Selamat Datang!</h2>
            <p className="text-slate-400 mt-1 text-sm">Masuk ke sistem manajemen alumni</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="login-username" className="label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  className={`input pl-10 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : 'Masuk ke Sistem'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-8">
            © 2025 Universitas Muhammadiyah Malang
          </p>
        </div>
      </div>
    </div>
  )
}
