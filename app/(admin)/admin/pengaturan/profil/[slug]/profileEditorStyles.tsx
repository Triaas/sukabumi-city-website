'use client'

import { Trash2 } from 'lucide-react'
import { useEscapeClose } from '@/app/(admin)/admin/pengaturan/tabs/shared'

export const PROFILE_CARD_CLASS =
  'bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden'

export const PROFILE_CARD_HEADER_CLASS =
  'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100'

export const PROFILE_INPUT_CLASS =
  'w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all'

export const PROFILE_LABEL_CLASS =
  'block text-xs font-bold text-[#172135] mb-1.5'

export function ProfileConfirmDeleteModal({
  open,
  title,
  description,
  itemLabel,
  previewSrc,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  itemLabel?: string
  previewSrc?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  useEscapeClose(open, onCancel)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-confirm-delete-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 text-red-600">
            <Trash2 className="h-6 w-6 stroke-[2]" aria-hidden="true" />
          </div>

          <h3
            id="profile-confirm-delete-title"
            className="mb-2 text-lg font-bold text-[#1b293c]"
          >
            {title}
          </h3>

          <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
            {description}
          </p>

          {itemLabel && (
            <p className="mb-4 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
              &ldquo;{itemLabel}&rdquo;
            </p>
          )}

          {previewSrc && (
            <div className="mb-5 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 aspect-video">
              <img
                src={previewSrc}
                alt="Pratinjau item yang akan dihapus"
                width={320}
                height={180}
                className="h-full w-full object-contain p-2"
              />
            </div>
          )}

          <div className="flex w-full gap-3 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer shadow-sm min-h-[44px]"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
