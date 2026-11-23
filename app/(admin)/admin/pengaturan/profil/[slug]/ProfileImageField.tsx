'use client'

import { useRef, useState } from 'react'
import { CloudUpload, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { uploadProfileImageAction } from '@/lib/profile-pages/actions'
import type { NotifyFn } from '@/app/(admin)/admin/pengaturan/tabs/shared'

function getFileDisplayName(url: string): string {
  if (!url) return ''
  const clean = url.split('?')[0]
  const parts = clean.split('/')
  return parts[parts.length - 1] || 'Gambar tersimpan'
}

export default function ProfileImageField({
  id,
  label,
  value,
  onChange,
  onNotify,
  aspectClass = 'aspect-video',
  fit = 'cover',
  emptyText = 'Belum ada gambar',
  allowClear = false,
  hint,
  hideHeader = false,
}: {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  onNotify: NotifyFn
  aspectClass?: string
  fit?: 'cover' | 'contain'
  emptyText?: string
  allowClear?: boolean
  hint?: string
  hideHeader?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadProfileImageAction(fd)
      if (!res.success || !res.imageUrl) {
        onNotify('error', res.error || 'Gagal mengunggah gambar.')
      } else {
        onChange(res.imageUrl)
        onNotify(
          'success',
          'Gambar berhasil diunggah. Klik Simpan Perubahan untuk menerapkan.'
        )
      }
    } catch {
      onNotify('error', 'Terjadi kesalahan saat mengunggah gambar.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!uploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const fileName = getFileDisplayName(value)

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label
            htmlFor={id}
            className="text-xs font-bold text-[#172135] cursor-pointer"
          >
            {label}
          </label>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
            Maks. 5 MB
          </span>
        </div>
      )}

      {hint && (
        <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
          {hint}
        </p>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleChange}
        className="sr-only"
      />

      {value ? (
        <div
          className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-slate-200/80 group ${
            fit === 'contain' ? 'bg-slate-50' : 'bg-slate-900'
          }`}
        >
          <img
            src={value}
            alt={`Pratinjau ${label}`}
            width={320}
            height={180}
            className={`w-full h-full transition-transform duration-300 ${
              fit === 'cover'
                ? 'object-cover group-hover:scale-[1.01]'
                : 'object-contain p-3'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

          {fileName && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg max-w-[55%] truncate">
              <ImageIcon size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{fileName}</span>
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <label
              htmlFor={id}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 bg-white/95 hover:bg-emerald-50 rounded-lg shadow-sm text-[11px] font-semibold text-slate-700 hover:text-[#159447] transition-all cursor-pointer ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin text-[#159447]" />
              ) : (
                <CloudUpload size={13} className="text-[#159447]" aria-hidden="true" />
              )}
              <span>{uploading ? 'Mengunggah...' : 'Ganti'}</span>
            </label>

            {allowClear && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                title={`Hapus ${label}`}
                aria-label={`Hapus ${label}`}
                className="flex items-center justify-center w-8 h-8 bg-white/95 hover:bg-red-50 rounded-lg shadow-sm text-slate-500 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploading) fileInputRef.current?.click()
          }}
          className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#159447] bg-[#f0fdf4]'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2.5 shadow-xs">
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-[#159447]" />
            ) : (
              <ImageIcon size={20} className="text-slate-400" aria-hidden="true" />
            )}
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-0.5">
            {uploading ? 'Sedang mengunggah gambar...' : emptyText}
          </p>
          <p className="text-[11px] text-slate-400 mb-3">
            JPG, PNG, WebP, atau SVG (Maks. 5 MB)
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer min-h-[38px]"
          >
            <CloudUpload size={14} className="text-[#159447]" aria-hidden="true" />
            <span>Pilih Berkas</span>
          </button>
        </div>
      )}
    </div>
  )
}
