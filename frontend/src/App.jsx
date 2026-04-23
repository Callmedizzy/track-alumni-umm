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

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/alumni" element={
              <ProtectedRoute>
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

            {/* Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
