import React, { useEffect, useState } from 'react'
import { X, Save, User, Phone, Briefcase, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import clsx from 'clsx'

const TABS = [
  { id: 'contact', label: 'Kontak', icon: Phone },
  { id: 'career', label: 'Karier', icon: Briefcase },
]

const STATUS_KERJA = ['PNS', 'Swasta', 'Wirausaha']

const DEFAULT_CONTACT = { linkedin: '', instagram: '', facebook: '', tiktok: '', email: '', no_hp: '' }
const DEFAULT_CAREER = { tempat_kerja: '', alamat_kerja: '', posisi: '', status_kerja: '', sosmed_instansi: '' }

export default function EditAlumniModal({ nim, nama, onClose, onSaved }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('contact')
  const [contact, setContact] = useState(DEFAULT_CONTACT)
  const [career, setCareer] = useState(DEFAULT_CAREER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch current data
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/alumni/${nim}`)
        if (data.contact) {
          setContact({
            linkedin: data.contact.linkedin || '',
            instagram: data.contact.instagram || '',
            facebook: data.contact.facebook || '',
            tiktok: data.contact.tiktok || '',
            email: data.contact.email || '',
            no_hp: data.contact.no_hp || '',
          })
        }
        if (data.career) {
          setCareer({
            tempat_kerja: data.career.tempat_kerja || '',
            alamat_kerja: data.career.alamat_kerja || '',
            posisi: data.career.posisi || '',
            status_kerja: data.career.status_kerja || '',
            sosmed_instansi: data.career.sosmed_instansi || '',
          })
        }
      } catch {
        toast({ message: 'Gagal memuat data alumni', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [nim])

  const saveContact = async () => {
    setSaving(true)
    try {
      const payload = {}
      Object.entries(contact).forEach(([k, v]) => { if (v) payload[k] = v })
      await api.put(`/alumni/${nim}/contact`, payload)
      toast({ message: 'Data kontak berhasil disimpan!', type: 'success' })
      onSaved()
    } catch (err) {
      toast({ message: err.response?.data?.detail || 'Gagal menyimpan kontak', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const saveCareer = async () => {
    setSaving(true)
    try {
      const payload = {}
      Object.entries(career).forEach(([k, v]) => { if (v) payload[k] = v })
      await api.put(`/alumni/${nim}/career`, payload)
      toast({ message: 'Data karier berhasil disimpan!', type: 'success' })
      onSaved()
    } catch (err) {
      toast({ message: err.response?.data?.detail || 'Gagal menyimpan karier', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary-400" />
              </div>
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Edit Alumni</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">{nama}</h2>
            <p className="text-sm text-slate-500 font-mono mt-0.5">NIM: {nim}</p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                id={`modal-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-600/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-surface/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : activeTab === 'contact' ? (
            <div className="space-y-4 animate-fade-in">
              {[
                { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...' },
                { key: 'email', label: 'Email', placeholder: 'contoh@email.com', type: 'email' },
                { key: 'no_hp', label: 'No. HP / WhatsApp', placeholder: '08xxxxxxxxxx', type: 'tel' },
              ].map(field => (
                <div key={field.key}>
                  <label htmlFor={`contact-${field.key}`} className="label">{field.label}</label>
                  <input
                    id={`contact-${field.key}`}
                    type={field.type || 'text'}
                    className="input"
                    placeholder={field.placeholder}
                    value={contact[field.key]}
                    onChange={e => setContact(c => ({ ...c, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="career-tempat-kerja" className="label">Tempat Bekerja</label>
                <input
                  id="career-tempat-kerja"
                  type="text"
                  className="input"
                  placeholder="Nama perusahaan/instansi"
                  value={career.tempat_kerja}
                  onChange={e => setCareer(c => ({ ...c, tempat_kerja: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="career-alamat-kerja" className="label">Alamat Bekerja</label>
                <textarea
                  id="career-alamat-kerja"
                  className="input resize-none"
                  rows={3}
                  placeholder="Jl. ..."
                  value={career.alamat_kerja}
                  onChange={e => setCareer(c => ({ ...c, alamat_kerja: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="career-posisi" className="label">Posisi / Jabatan</label>
                <input
                  id="career-posisi"
                  type="text"
                  className="input"
                  placeholder="Contoh: Software Engineer"
                  value={career.posisi}
                  onChange={e => setCareer(c => ({ ...c, posisi: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Status Pekerjaan</label>
                <div className="flex gap-3 mt-1">
                  {STATUS_KERJA.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status_kerja"
                        id={`career-status-${s.toLowerCase()}`}
                        value={s}
                        checked={career.status_kerja === s}
                        onChange={() => setCareer(c => ({ ...c, status_kerja: s }))}
                        className="sr-only"
                      />
                      <div className={clsx(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                        career.status_kerja === s
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-slate-600 group-hover:border-slate-400'
                      )}>
                        {career.status_kerja === s && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className={clsx(
                        'text-sm font-medium',
                        career.status_kerja === s ? 'text-slate-200' : 'text-slate-400'
                      )}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="career-sosmed" className="label">Sosial Media Instansi</label>
                <input
                  id="career-sosmed"
                  type="text"
                  className="input"
                  placeholder="Link sosmed perusahaan"
                  value={career.sosmed_instansi}
                  onChange={e => setCareer(c => ({ ...c, sosmed_instansi: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-surface-border">
          <button
            id="modal-cancel-btn"
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
            disabled={saving}
          >
            Batal
          </button>
          <button
            id="modal-save-btn"
            onClick={activeTab === 'contact' ? saveContact : saveCareer}
            className="btn-primary flex-1 justify-center"
            disabled={saving || loading}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan {activeTab === 'contact' ? 'Kontak' : 'Karier'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
