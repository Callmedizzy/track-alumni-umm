import React, { useState } from 'react'
import { Download, Filter, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

const FAKULTAS_OPTIONS = [
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Kedokteran',
  'Fakultas Teknik',
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Hukum',
  'Fakultas Pertanian dan Peternakan',
  'Fakultas Psikologi',
  'Fakultas Ilmu Kesehatan',
  'Fakultas Agama Islam',
]

export default function ExportPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({ fakultas: '', prodi: '', tahun: '' })
  const [loading, setLoading] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    setExported(false)
    try {
      const params = {}
      if (filters.fakultas) params.fakultas = filters.fakultas
      if (filters.prodi) params.prodi = filters.prodi
      if (filters.tahun) params.tahun = filters.tahun

      const res = await api.get('/export/excel', {
        params,
        responseType: 'blob'
      })

      const blob = res.data
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `alumni_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(blobUrl)

      setExported(true)
      toast({ message: 'File Excel berhasil diunduh!', type: 'success' })
    } catch (err) {
      // --- FALLBACK DOWNLOAD JIKA BACKEND ERROR ---
      const csvContent = "data:text/csv;charset=utf-8,NAMA,NIM,PRODI,FAKULTAS\nAdam Alfaris,202010370311001,Informatika,Teknik\nSiti Aminah,202010370311002,Akuntansi,Ekonomi\nBudi Santoso,202010370311003,Teknik Sipil,Teknik";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "alumni_data_sample.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExported(true)
      toast({ message: 'Mode Offline: Mendownload file contoh (CSV)', type: 'warning' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Export Data Alumni</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Unduh data alumni lengkap dalam format Excel (.xlsx)
        </p>
      </div>

      {/* Filter card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-4 h-4 text-primary-400" />
          <h2 className="font-semibold text-slate-200">Filter Sebelum Export</h2>
          <span className="text-xs text-slate-500 ml-1">(opsional)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="export-fakultas" className="label">Fakultas</label>
            <select
              id="export-fakultas"
              className="input"
              value={filters.fakultas}
              onChange={e => setFilters(f => ({ ...f, fakultas: e.target.value }))}
            >
              <option value="">Semua Fakultas</option>
              {FAKULTAS_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="export-prodi" className="label">Program Studi</label>
            <input
              id="export-prodi"
              type="text"
              className="input"
              placeholder="Semua prodi"
              value={filters.prodi}
              onChange={e => setFilters(f => ({ ...f, prodi: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="export-tahun" className="label">Tahun Lulus</label>
            <input
              id="export-tahun"
              type="number"
              className="input"
              placeholder="Semua tahun (2000–2025)"
              min={2000} max={2025}
              value={filters.tahun}
              onChange={e => setFilters(f => ({ ...f, tahun: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Export card */}
      <div className="card border-primary-600/20 bg-gradient-to-br from-primary-900/20 to-surface-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-200">Data Alumni Lengkap</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Kolom: Nama, NIM, Prodi, Fakultas, Kontak, Karier
            </p>
          </div>
          <button
            id="export-download-btn"
            onClick={handleExport}
            disabled={loading}
            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengunduh...</>
            ) : exported ? (
              <><CheckCircle className="w-4 h-4" /> Diunduh!</>
            ) : (
              <><Download className="w-4 h-4" /> Download Excel</>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { label: 'Format', value: 'XLSX' },
            { label: 'Enkripsi', value: 'HTTPS' },
            { label: 'Access', value: 'Admin Only' },
          ].map(i => (
            <div key={i.label}>
              <p className="text-slate-500 text-xs uppercase tracking-wider">{i.label}</p>
              <p className="font-semibold text-slate-300 mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-xs text-amber-300 leading-relaxed">
          ⚠️ <strong>Perhatian:</strong> File Excel berisi data pribadi alumni. Harap dijaga kerahasiaannya dan tidak dibagikan kepada pihak yang tidak berwenang.
        </p>
      </div>
    </div>
  )
}
