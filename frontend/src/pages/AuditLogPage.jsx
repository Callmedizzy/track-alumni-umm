import React, { useEffect, useState, useCallback } from 'react'
import { ScrollText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import clsx from 'clsx'

const ACTION_COLORS = {
  LOGIN: 'badge-success',
  LOGIN_FAILED: 'badge-danger',
  VIEW_LIST: 'badge-info',
  VIEW_DETAIL: 'badge-info',
  UPDATE_CONTACT: 'badge-warning',
  UPDATE_CAREER: 'badge-warning',
  EXPORT_EXCEL: 'badge-warning',
}

export default function AuditLogPage() {
  const { toast } = useToast()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ action: '', username: '' })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 50 }
      if (filters.action) params.action = filters.action
      if (filters.username) params.username = filters.username

      const { data: res } = await api.get('/admin/logs', { params })
      setData(res.data)
      setTotal(res.total)
      setTotalPages(res.total_pages)
    } catch {
      toast({ message: 'Gagal memuat audit log', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const formatDateTime = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'medium',
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Audit Log</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total.toLocaleString('id-ID')} aktivitas tercatat</p>
        </div>
        <button onClick={() => { setPage(1); fetchLogs() }} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          id="log-filter-username"
          type="text"
          className="input flex-1 min-w-[150px]"
          placeholder="Filter username..."
          value={filters.username}
          onChange={e => { setFilters(f => ({ ...f, username: e.target.value })); setPage(1) }}
        />
        <select
          id="log-filter-action"
          className="input flex-1 min-w-[160px]"
          value={filters.action}
          onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1) }}
        >
          <option value="">Semua Aksi</option>
          {Object.keys(ACTION_COLORS).map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface/50">
                <th className="table-head">Waktu</th>
                <th className="table-head">Username</th>
                <th className="table-head">Aksi</th>
                <th className="table-head">Resource</th>
                <th className="table-head">Detail</th>
                <th className="table-head">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-surface-border/50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-surface-border rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <ScrollText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p>Tidak ada log aktivitas</p>
                  </td>
                </tr>
              ) : (
                data.map(log => (
                  <tr key={log.id} className="border-b border-surface-border/50 hover:bg-surface/50 transition-colors">
                    <td className="table-cell text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-slate-300">{log.username || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className={clsx('badge', ACTION_COLORS[log.action] || 'badge-info')}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell text-xs font-mono text-slate-500">{log.resource || '—'}</td>
                    <td className="table-cell text-xs text-slate-500 max-w-[200px] truncate">
                      {log.detail || '—'}
                    </td>
                    <td className="table-cell text-xs font-mono text-slate-600">{log.ip_address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
            <p className="text-sm text-slate-500">
              Halaman <span className="text-slate-300 font-medium">{page}</span> dari{' '}
              <span className="text-slate-300 font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
