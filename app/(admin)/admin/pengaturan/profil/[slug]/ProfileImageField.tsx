'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadProfileImageAction } from '@/lib/profile-pages/actions'
import {
  LABEL_CLASS,
  type NotifyFn,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'

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
}) {
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      e.target.value = ''
    }
  }

  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      <div
        className={`${aspectClass} w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center`}
      >
        {value ? (
          <img
            src={value}
            alt={`Pratinjau ${label}`}
            width={320}
            height={180}
            className={`h-full w-full ${
              fit === 'cover' ? 'object-cover' : 'object-contain p-2'
            }`}
          />
        ) : (
          <span className="px-3 text-center text-xs font-medium text-slate-500">
            {emptyText}
          </span>
        )}
      </div>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleChange}
        className="sr-only"
      />
      <div className="mt-2 flex gap-2">
        <label
          htmlFor={id}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#159447] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
            uploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          <Upload size={15} aria-hidden="true" />
          {uploading
            ? 'Mengunggah...'
            : value
              ? 'Ganti Gambar'
              : 'Unggah Gambar'}
        </label>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={`Hapus ${label}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer min-h-[44px]"
          >
            <X size={15} aria-hidden="true" />
            Hapus
          </button>
        )}
      </div>
    </div>
  )
}
