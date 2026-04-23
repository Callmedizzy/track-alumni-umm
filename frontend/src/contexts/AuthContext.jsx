import React, { createContext, useContext, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)
const ADMIN_ONLY_ERROR = 'Akun user tidak memiliki akses ke dashboard admin.'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return null

      const parsed = JSON.parse(stored)
      // Any visitor is technically a user, but if they have a token, we parse it.
      // If role is missing or not admin, we still treat them as 'user'
      return parsed
    } catch {
      return null
    }
  })

  const login = async (username, password) => {
    try {
      // Menggunakan JSON (objek biasa) bukan FormData agar sesuai dengan Pydantic di Backend
      const { data } = await api.post('/auth/login', { username, password })
      
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role
      }))
      setUser({ username: data.username, role: data.role })
      return { success: true }
    } catch (err) {
      // Pastikan error message adalah string agar tidak membuat React crash (422 returns array)
      let errorMsg = 'Gagal login. Periksa username dan password.'
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail)) {
        errorMsg = detail[0]?.msg || JSON.stringify(detail)
      }
      
      return { 
        success: false, 
        error: errorMsg
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin,
      loading: false 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
