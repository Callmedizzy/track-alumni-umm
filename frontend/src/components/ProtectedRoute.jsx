import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  // Jika tidak ada user, lempar ke login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Jika halaman khusus admin dan user bukan admin, lempar ke login (karena viewer tidak punya akses dashboard)
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}
