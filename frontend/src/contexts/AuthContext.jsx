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
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const { data } = await api.post('/auth/login', formData)
      
      // If login successful, we store everything
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Gagal login. Periksa username dan password.' 
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
