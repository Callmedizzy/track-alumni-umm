import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AlumniPage from './pages/AlumniPage'
import ExportPage from './pages/ExportPage'
import AuditLogPage from './pages/AuditLogPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected - Restricted to Admin only as requested */}
            <Route path="/dashboard" element={
              <ProtectedRoute adminOnly>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/alumni" element={
              <ProtectedRoute adminOnly>
                <Layout><AlumniPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/export" element={
              <ProtectedRoute adminOnly>
                <Layout><ExportPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/logs" element={
              <ProtectedRoute adminOnly>
                <Layout><AuditLogPage /></Layout>
              </ProtectedRoute>
            } />

            {/* Redirect to login if not authenticated or not admin */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
