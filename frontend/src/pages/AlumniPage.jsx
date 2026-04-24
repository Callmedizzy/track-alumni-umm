import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Edit2, ChevronLeft, ChevronRight, CheckCircle, XCircle, X } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import EditAlumniModal from '../components/EditAlumniModal'
import clsx from 'clsx'

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

export default function AlumniPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    fakultas: '', prodi: '', tahun: '', has_contact: '', has_career: ''
  })
  const [appliedFilters, setAppliedFilters] = useState({ ...filters })
  const [showFilters, setShowFilters] = useState(false)

  const [editTarget, setEditTarget] = useState(null) // { nim, nama }
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const categories = [
    { id: '', label: 'Semua' },
    { id: 'nama', label: 'Nama' },
    { id: 'nim', label: 'NIM' },
    { id: 'prodi', label: 'Prodi' },
    { id: 'fakultas', label: 'Fakultas' },
  ]

  const [allData, setAllData] = useState(null)

  const fetchAlumni = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Muat 142.000+ data secara statis (Hanya butuh 1x muat)
      let dataList = allData;
      if (!dataList) {
        const res = await fetch('/data_100k.json')
        if (!res.ok) throw new Error('Data statis tidak ditemukan')
        dataList = await res.json()
        setAllData(dataList)
      }

      // 2. Filter data secara lokal (Sangat Cepat)
      let filtered = dataList;

      // PROTEKSI DATA: Jika bukan admin, wajib ada minimal 1 kata kunci pencarian.
      if (!isAdmin && !appliedFilters.search && !appliedFilters.fakultas && !appliedFilters.prodi && !appliedFilters.tahun) {
        setData([])
        setTotal(0)
        setTotalPages(1)
        setLoading(false)
        return
      }

      if (appliedFilters.search) {
        const q = appliedFilters.search.toLowerCase()
        filtered = filtered.filter(item => 
          (item.nama && item.nama.toLowerCase().includes(q)) ||
          (item.nim && item.nim.toLowerCase().includes(q))
        )
      }
      if (appliedFilters.fakultas) {
        filtered = filtered.filter(item => item.fakultas === appliedFilters.fakultas)
      }
      if (appliedFilters.prodi) {
        filtered = filtered.filter(item => item.prodi && item.prodi.toLowerCase().includes(appliedFilters.prodi.toLowerCase()))
      }
      if (appliedFilters.tahun) {
        filtered = filtered.filter(item => 
          item.tahun_masuk == appliedFilters.tahun || 
          (item.tgl_lulus && item.tgl_lulus.startsWith(appliedFilters.tahun))
        )
      }

      // 3. Pagination Lokal (Bagi per 50 orang per halaman)
      const limit = 50
      const totalItems = filtered.length
      const start = (page - 1) * limit
      const end = start + limit

      setData(filtered.slice(start, end))
      setTotal(totalItems)
      setTotalPages(Math.ceil(totalItems / limit))

    } catch (err) {
      toast({ message: 'Gagal memuat 100k+ data statis', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [page, appliedFilters, allData])

  useEffect(() => { fetchAlumni() }, [fetchAlumni])

  const applyFilters = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
    setShowFilters(false)
  }

  const resetFilters = () => {
    const empty = { search: '', category: '', fakultas: '', prodi: '', tahun: '', has_contact: '', has_career: '' }
    setFilters(empty)
    setAppliedFilters(empty)
    setPage(1)
  }

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Data Alumni</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total >= 100000 ? total.toLocaleString('id-ID') : total} alumni ditemukan
            {total < 10 && isAdmin && (
               <button 
                 onClick={fetchAlumni}
                 className="ml-3 text-primary-400 hover:underline text-xs font-bold uppercase tracking-widest"
               >
                 (Muat Data Pusat 100rb+)
               </button>
            )}
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="flex flex-1 min-w-[300px] border border-surface-border rounded-lg bg-surface group focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent transition-all relative">
            {/* Custom Category Dropdown */}
            <div className="relative">
              <button
                id="alumni-category-trigger"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="h-full flex items-center justify-between gap-3 px-4 bg-surface-card border-r border-surface-border text-sm font-bold text-slate-200 min-w-[130px] hover:bg-surface-border transition-colors group/btn"
              >
                <span className="uppercase tracking-wide">
                  {categories.find(c => c.id === filters.category)?.label || 'SEMUA'}
                </span>
                <ChevronRight className={clsx("w-4 h-4 text-slate-500 transition-transform duration-200", isCategoryOpen && "rotate-90")} />
              </button>

              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute top-[calc(100%+8px)] left-0 w-56 bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden border border-slate-200 animate-slide-up">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setFilters(f => ({ ...f, category: cat.id }))
                          setIsCategoryOpen(false)
                        }}
                        className={clsx(
                          "w-full text-left px-5 py-3 text-sm transition-all duration-200",
                          cat.id === (filters.category || '')
                            ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold"
                            : "text-[#2563eb] hover:bg-slate-50 font-semibold border-b border-slate-100 last:border-0"
                        )}
                      >
                        {cat.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                id="alumni-search-input"
                type="text"
                className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                placeholder={
                  !filters.category ? "Cari nama atau NIM..." :
                  filters.category === 'nama' ? "Cari nama alumni..." :
                  filters.category === 'nim' ? "Cari NIM alumni..." :
                  filters.category === 'prodi' ? "Cari program studi..." :
                  "Cari fakultas..."
                }
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <button
            id="alumni-filter-btn"
            onClick={() => setShowFilters(s => !s)}
            className={clsx('btn-secondary relative', activeFilterCount > 0 && 'border-primary-600 text-primary-400')}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button id="alumni-search-btn" onClick={applyFilters} className="btn-primary">
            <Search className="w-4 h-4" />
            Cari
          </button>

          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="btn-secondary text-red-400">
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            <div>
              <label className="label">Fakultas</label>
              <select
                id="filter-fakultas"
                className="input"
                value={filters.fakultas}
                onChange={e => setFilters(f => ({ ...f, fakultas: e.target.value }))}
              >
                <option value="">Semua Fakultas</option>
                {FAKULTAS_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Program Studi</label>
              <input
                id="filter-prodi"
                type="text"
                className="input"
                placeholder="Contoh: Teknik Informatika"
                value={filters.prodi}
                onChange={e => setFilters(f => ({ ...f, prodi: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Tahun Lulus</label>
              <input
                id="filter-tahun"
                type="number"
                className="input"
                placeholder="Contoh: 2020"
                min={2000} max={2025}
                value={filters.tahun}
                onChange={e => setFilters(f => ({ ...f, tahun: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Status Kontak</label>
              <select
                id="filter-has-contact"
                className="input"
                value={filters.has_contact}
                onChange={e => setFilters(f => ({ ...f, has_contact: e.target.value }))}
              >
                <option value="">Semua</option>
                <option value="true">Sudah terisi</option>
                <option value="false">Belum terisi</option>
              </select>
            </div>

            <div>
              <label className="label">Status Karier</label>
              <select
                id="filter-has-career"
                className="input"
                value={filters.has_career}
                onChange={e => setFilters(f => ({ ...f, has_career: e.target.value }))}
              >
                <option value="">Semua</option>
                <option value="true">Sudah terisi</option>
                <option value="false">Belum terisi</option>
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={applyFilters} className="btn-primary w-full justify-center">
                Terapkan Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface/50">
                <th className="table-head">Nama Lulusan</th>
                <th className="table-head">NIM</th>
                <th className="table-head">Tahun Masuk</th>
                <th className="table-head">Tanggal Lulus</th>
                <th className="table-head">Fakultas</th>
                <th className="table-head">Program Studi</th>
                <th className="table-head">Pekerjaan</th>
                <th className="table-head">Perusahaan</th>
                <th className="table-head">Lokasi</th>
                <th className="table-head">Status</th>
                {isAdmin && <th className="table-head text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-surface-border/50">
                    {[...Array(isAdmin ? 11 : 10)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-surface-border rounded animate-pulse" style={{ width: `${60 + (j * 17) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="py-16 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-bold text-slate-300">
                      {!isAdmin && !appliedFilters.search ? "Pencarian Diperlukan" : "Tidak ada alumni yang ditemukan"}
                    </p>
                    <p className="text-sm mt-1 text-slate-400">
                      {!isAdmin && !appliedFilters.search 
                        ? "Silakan ketikkan Nama atau NIM alumni di kolom pencarian untuk melihat data." 
                        : "Coba ubah filter atau kata kunci pencarian"}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((alumni) => (
                  <tr
                    key={alumni.nim}
                    className="border-b border-surface-border/50 hover:bg-surface/50 transition-colors"
                  >
                    <td className="table-cell font-medium text-slate-200 max-w-[180px] truncate">
                      {alumni.nama}
                    </td>
                    <td className="table-cell font-mono text-xs text-slate-400">{alumni.nim}</td>
                    <td className="table-cell text-center">{alumni.tahun_masuk || '—'}</td>
                    <td className="table-cell">{formatDate(alumni.tgl_lulus)}</td>
                    <td className="table-cell max-w-[150px] truncate text-xs">{alumni.fakultas || '—'}</td>
                    <td className="table-cell max-w-[140px] truncate">{alumni.prodi || '—'}</td>
                    <td className="table-cell max-w-[140px] truncate text-xs">{alumni.posisi || '—'}</td>
                    <td className="table-cell max-w-[140px] truncate text-xs">{alumni.tempat_kerja || '—'}</td>
                    <td className="table-cell max-w-[140px] truncate text-xs">{alumni.alamat_kerja || '—'}</td>
                    <td className="table-cell text-xs">{alumni.status_kerja || '—'}</td>
                    {isAdmin && (
                      <td className="table-cell text-center">
                        <button
                          id={`edit-btn-${alumni.nim}`}
                          onClick={() => setEditTarget(alumni)}
                          className="btn-secondary py-1 px-2.5 text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    )}
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
            <div className="flex items-center gap-2">
              <button
                id="pagination-prev-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      p === page ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-surface-border'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                id="pagination-next-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditAlumniModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updatedAlumni) => { 
            // Update data statis secara lokal di browser
            if (allData) {
              const newData = allData.map(a => a.nim === updatedAlumni.nim ? updatedAlumni : a)
              setAllData(newData)
            }
            setEditTarget(null) 
          }}
        />
      )}
    </div>
  )
}
