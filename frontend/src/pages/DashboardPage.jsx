import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, Phone, Briefcase, TrendingUp, RefreshCw } from 'lucide-react'
import api from '../lib/api'

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16']

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-600/30 text-primary-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-600/30 text-emerald-400',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-600/30 text-violet-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-600/30 text-amber-400',
  }
  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-slate-100 mt-1">{value}</p>
          {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-bold text-slate-100">{payload[0].value.toLocaleString('id-ID')} alumni</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/alumni/stats/dashboard')
      setStats(data)
    } catch (err) {
      setError('Gagal memuat statistik. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  // Prepare chart data
  const perTahunData = stats
    ? Object.entries(stats.per_tahun)
        .map(([k, v]) => ({ tahun: k, jumlah: v }))
        .sort((a, b) => a.tahun - b.tahun)
    : []

  const perFakultasData = stats
    ? Object.entries(stats.per_fakultas)
        .slice(0, 8)
        .map(([k, v]) => ({ name: k.replace('Fakultas ', '').replace(' dan ', ' & '), value: v }))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Memuat statistik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Ringkasan data alumni UMM</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="card border-red-600/30 bg-red-600/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Alumni"
          value={(stats?.total_alumni || 0).toLocaleString('id-ID')}
          sub="Seluruh angkatan"
          color="primary"
        />
        <StatCard
          icon={Phone}
          label="Data Kontak"
          value={`${stats?.pct_contact ?? 0}%`}
          sub={`${(stats?.with_contact || 0).toLocaleString('id-ID')} alumni`}
          color="emerald"
        />
        <StatCard
          icon={Briefcase}
          label="Data Karier"
          value={`${stats?.pct_career ?? 0}%`}
          sub={`${(stats?.with_career || 0).toLocaleString('id-ID')} alumni`}
          color="violet"
        />
        <StatCard
          icon={TrendingUp}
          label="Kelengkapan Data"
          value={`${Math.round(((stats?.pct_contact ?? 0) + (stats?.pct_career ?? 0)) / 2)}%`}
          sub="Rata-rata kontak + karier"
          color="amber"
        />
      </div>

      {/* Progress bars */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Tingkat Kelengkapan</h2>
        <div className="space-y-4">
          {[
            { label: 'Data Kontak (email, HP, sosmed)', pct: stats?.pct_contact ?? 0, color: 'bg-primary-500' },
            { label: 'Data Karier (pekerjaan, posisi)', pct: stats?.pct_career ?? 0, color: 'bg-violet-500' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-bold text-slate-200">{item.pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alumni per tahun */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
            Alumni per Tahun Lulus
          </h2>
          {perTahunData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={perTahunData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="tahun"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={4}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Tidak ada data
            </div>
          )}
        </div>

        {/* Alumni per fakultas */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
            Distribusi per Fakultas
          </h2>
          {perFakultasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={perFakultasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {perFakultasData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v.toLocaleString('id-ID'), n]}
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Tidak ada data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
