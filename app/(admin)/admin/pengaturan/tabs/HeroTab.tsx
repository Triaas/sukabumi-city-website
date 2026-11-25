'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
} from 'lucide-react'
import type { HeroSettings } from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
  uploadSiteImageAction,
} from '@/lib/site-settings/actions'
import { useTabUnsavedGuard, type TabUnsavedProps } from './shared'

export default function HeroTab({
  initialData,
  onSaved,
  onNotify,
  onDirtyChange,
  registerSaveHandler,
}: {
  initialData: HeroSettings
  onSaved: (data: HeroSettings) => void
  onNotify: (type: 'success' | 'error', message: string) => void
} & TabUnsavedProps) {
  const [formData, setFormData] = useState<HeroSettings>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (deleteConfirmIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDeleteConfirmIndex(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmIndex])

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
      if (!res.success || !res.imageUrl) {
        onNotify('error', res.error || 'Gagal mengunggah gambar slider.')
      } else {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.imageUrl!],
        }))
        onNotify(
          'success',
          'Gambar berhasil diunggah ke daftar slider. Klik Simpan Perubahan untuk menerbitkan.'
        )
      }
    } catch {
      onNotify('error', 'Terjadi kesalahan saat mengunggah gambar.')
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

  const handleRequestRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      onNotify(
        'error',
        'Minimal harus terdapat 1 gambar latar belakang pada Hero Section.'
      )
      return
    }
    setDeleteConfirmIndex(index)
  }

  const handleConfirmRemoveImage = () => {
    if (deleteConfirmIndex === null) return
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== deleteConfirmIndex),
    }))
    setDeleteConfirmIndex(null)
    onNotify(
      'success',
      'Foto slide dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const saveChanges = async (): Promise<boolean> => {
    if (!formData.title.trim()) {
      onNotify('error', 'Judul Utama (H1) tidak boleh kosong.')
      return false
    }

    setIsSaving(true)

    const res = await updateSiteSectionAction('hero', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify(
        'success',
        'Pengaturan Hero Section berhasil disimpan dan diterapkan di halaman beranda.'
      )
      return true
    } else {
      onNotify('error', res.error || 'Gagal menyimpan pengaturan Hero Section.')
      return false
    }
  }

  useTabUnsavedGuard(
    formData,
    initialData,
    saveChanges,
    onDirtyChange,
    registerSaveHandler
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveChanges()
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)

    const res = await resetSiteSectionAction('hero')
    setIsResetting(false)
    setShowResetConfirm(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify(
        'success',
        'Hero Section berhasil dikembalikan ke pengaturan awal.'
      )
    } else {
      onNotify('error', res.error || 'Gagal mereset Hero Section.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, -1)}
                        disabled={index === 0}
                        aria-label={`Geser slide ${index + 1} ke atas`}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-[#172135] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#172135] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 z-20"
                      >
                        {index === 0 ? 'Sudah paling atas' : 'Geser ke atas'}
                      </span>
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 1)}
                        disabled={index === formData.images.length - 1}
                        aria-label={`Geser slide ${index + 1} ke bawah`}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-[#172135] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#172135] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 z-20"
                      >
                        {index === formData.images.length - 1
                          ? 'Sudah paling bawah'
                          : 'Geser ke bawah'}
                      </span>
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => handleRequestRemoveImage(index)}
                        aria-label={`Hapus slide ${index + 1}`}
                        className="grid size-9 place-items-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-lg bg-[#172135] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 z-20"
                      >
                        Hapus foto slide
                      </span>
                    </div>
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

      {/* Modal Konfirmasi Hapus Slide */}
      {deleteConfirmIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmIndex(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-slide-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-600">
                <Trash2 size={22} aria-hidden="true" />
              </div>
              <h3
                id="delete-slide-modal-title"
                className="text-lg font-bold text-[#172135]"
              >
                Hapus Foto Slide #{deleteConfirmIndex + 1}?
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#566276]">
                Foto ini akan dihapus dari daftar slider Hero Section.
              </p>
            </div>

            {formData.images[deleteConfirmIndex] && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video">
                <img
                  src={formData.images[deleteConfirmIndex]}
                  alt={`Preview slide ${deleteConfirmIndex + 1}`}
                  width={320}
                  height={180}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmIndex(null)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] hover:bg-slate-50 cursor-pointer min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveImage}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-700 cursor-pointer min-h-[44px]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
