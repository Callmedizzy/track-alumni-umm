import React, { createContext, useContext, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)
const ADMIN_ONLY_ERROR = 'Akun viewer tidak memiliki akses ke dashboard admin.'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return null

      const parsed = JSON.parse(stored)
      if (parsed?.role === 'admin') return parsed

      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      return null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      if (data.role !== 'admin') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
        return { success: false, error: ADMIN_ONLY_ERROR }
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }))
      setUser({ username: data.username, role: data.role })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login gagal. Periksa username dan password.'
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
