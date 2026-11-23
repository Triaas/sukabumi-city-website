'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { HeroSettings } from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
  uploadSiteImageAction,
} from '@/lib/site-settings/actions'

export default function HeroTab({
  initialData,
  onSaved,
}: {
  initialData: HeroSettings
  onSaved: (data: HeroSettings) => void
}) {
  const [formData, setFormData] = useState<HeroSettings>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFeedback(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
      if (!res.success || !res.imageUrl) {
        setFeedback({
          type: 'error',
          message: res.error || 'Gagal mengunggah gambar slider.',
        })
      } else {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.imageUrl!],
        }))
        setFeedback({
          type: 'success',
          message:
            'Gambar berhasil diunggah ke daftar slider. Klik Simpan Perubahan untuk menerbitkan.',
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat mengunggah gambar.',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= formData.images.length) return
    const nextImages = [...formData.images]
    const temp = nextImages[index]
    nextImages[index] = nextImages[targetIdx]
    nextImages[targetIdx] = temp
    setFormData((prev) => ({ ...prev, images: nextImages }))
  }

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      setFeedback({
        type: 'error',
        message: 'Minimal harus terdapat 1 gambar latar belakang pada Hero Section.',
      })
      return
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setFeedback({
        type: 'error',
        message: 'Judul Utama (H1) tidak boleh kosong.',
      })
      return
    }

    setIsSaving(true)
    setFeedback(null)

    const res = await updateSiteSectionAction('hero', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      setFeedback({
        type: 'success',
        message: 'Pengaturan Hero Section berhasil disimpan dan diterapkan di halaman beranda.',
      })
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal menyimpan pengaturan Hero Section.',
      })
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    setFeedback(null)

    const res = await resetSiteSectionAction('hero')
    setIsResetting(false)
    setShowResetConfirm(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      setFeedback({
        type: 'success',
        message: 'Hero Section berhasil dikembalikan ke pengaturan awal.',
      })
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal mereset Hero Section.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-[#159447]'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Teks Hero */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#172135]">
              Teks Sambutan Hero
            </h2>
            <p className="text-xs text-[#566276] mt-0.5">
              Ubah tulisan sambutan yang tampil di atas gambar latar halaman utama.
            </p>
          </div>

          <div>
            <label
              htmlFor="hero-eyebrow"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Teks Label Atas
            </label>
            <input
              id="hero-eyebrow"
              type="text"
              value={formData.eyebrow}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eyebrow: e.target.value }))
              }
              placeholder="Selamat datang di"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
          </div>

          <div>
            <label
              htmlFor="hero-title"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Judul Utama (H1)
            </label>
            <input
              id="hero-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Kota Sukabumi"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
          </div>

          <div>
            <label
              htmlFor="hero-subtitle"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Deskripsi / Subjudul
            </label>
            <textarea
              id="hero-subtitle"
              rows={3}
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              placeholder="Bersama mewujudkan Masyarakat Kota Sukabumi yang Inovatif, Mandiri, Agamis, Nasionalis."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
          </div>

          <div>
            <label
              htmlFor="hero-interval"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Durasi Pergantian Slide (Milidetik)
            </label>
            <input
              id="hero-interval"
              type="number"
              min={1000}
              max={20000}
              step={500}
              value={formData.slideIntervalMs}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slideIntervalMs: Number(e.target.value) || 3000,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
            <p className="mt-1 text-xs text-[#566276]">
              3000 milidetik = 3 detik per gambar.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#566276] mb-2">
              Pratinjau Teks Hero
            </p>
            <div className="relative overflow-hidden rounded-2xl bg-[#0c1d26] p-6 text-white min-h-[190px] flex items-center">
              {formData.images[0] && (
                <img
                  src={formData.images[0]}
                  alt="Preview Hero"
                  width={600}
                  height={320}
                  className="absolute inset-0 size-full object-cover opacity-45"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/35" />
              <div className="relative z-10 max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f3c338]">
                  {formData.eyebrow}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold leading-tight text-white">
                  {formData.title}
                </p>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/85">
                  {formData.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Foto Slider Background */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#172135]">
                  Foto Latar Belakang Slider ({formData.images.length})
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  Unggah foto JPG, PNG, atau WebP (maks. 5 MB) dan atur urutan tampilnya.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  id="hero-slide-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadImage}
                  className="sr-only"
                />
                <label
                  htmlFor="hero-slide-upload"
                  className={`inline-flex items-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
                    isUploading ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Upload size={15} aria-hidden="true" />
                  {isUploading ? 'Mengunggah...' : 'Tambah Foto Slide'}
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {formData.images.map((imgUrl, index) => (
                <div
                  key={`${imgUrl}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-200 border border-slate-300">
                    <img
                      src={imgUrl}
                      alt={`Slide Hero ${index + 1}`}
                      width={112}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-[#159447]">
                      Slide #{index + 1}
                    </span>
                    <p className="mt-1 truncate text-xs text-[#566276] font-mono">
                      {imgUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, -1)}
                      disabled={index === 0}
                      aria-label={`Geser slide ${index + 1} ke atas`}
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-[#172135] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 1)}
                      disabled={index === formData.images.length - 1}
                      aria-label={`Geser slide ${index + 1} ke bawah`}
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-[#172135] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Hapus slide ${index + 1}`}
                      className="grid size-9 place-items-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#566276] hover:bg-slate-50 hover:text-[#172135] transition-colors cursor-pointer min-h-[44px]"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset ke Default
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-600">
                  Kembalikan ke bawaan?
                </span>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer min-h-[38px]"
                >
                  {isResetting ? 'Mereset...' : 'Ya, Reset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer min-h-[38px]"
                >
                  Batal
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#159447] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0f7a36] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
            >
              <Save size={16} aria-hidden="true" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
