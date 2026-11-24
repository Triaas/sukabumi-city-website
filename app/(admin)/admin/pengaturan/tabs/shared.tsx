'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
} from 'lucide-react'
import { uploadSiteImageAction } from '@/lib/site-settings/actions'

export type NotifyFn = (type: 'success' | 'error', message: string) => void

export interface TabUnsavedProps {
  onDirtyChange?: (dirty: boolean) => void
  registerSaveHandler?: (fn: (() => Promise<boolean>) | null) => void
}

export function useTabUnsavedGuard<T>(
  formData: T,
  initialData: T,
  saveFn: () => Promise<boolean>,
  onDirtyChange?: (dirty: boolean) => void,
  registerSaveHandler?: (fn: (() => Promise<boolean>) | null) => void
): void {
  const saveRef = useRef(saveFn)
  saveRef.current = saveFn

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    registerSaveHandler?.(() => saveRef.current())
    return () => {
      registerSaveHandler?.(null)
      onDirtyChange?.(false)
    }
  }, [registerSaveHandler, onDirtyChange])
}

export const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20'

export const LABEL_CLASS =
  'block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5'

export function createLocalId(): string {
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  const temp = next[index]
  next[index] = next[target]
  next[target] = temp
  return next
}

const escapeStack: Array<() => void> = []

// Only the top-most open dialog reacts to Escape, so nested modals close one at a time.
export function useEscapeClose(active: boolean, onClose: () => void): void {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return
    const handler = () => closeRef.current()
    escapeStack.push(handler)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escapeStack[escapeStack.length - 1] === handler) {
        handler()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const idx = escapeStack.indexOf(handler)
      if (idx > -1) escapeStack.splice(idx, 1)
    }
  }, [active])
}

const TOOLTIP_BASE =
  'pointer-events-none absolute -top-9 whitespace-nowrap rounded-lg bg-[#172135] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 z-20'

export function TooltipIconButton({
  label,
  ariaLabel,
  onClick,
  disabled,
  danger,
  align = 'center',
  children,
}: {
  label: string
  ariaLabel?: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  align?: 'center' | 'right'
  children: React.ReactNode
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        className={`grid size-11 place-items-center rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
          danger
            ? 'border-red-200 text-red-600 hover:bg-red-50'
            : 'border-slate-200 text-[#172135] hover:bg-slate-100'
        }`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className={`${TOOLTIP_BASE} ${
          align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function ReorderDeleteButtons({
  index,
  total,
  noun,
  onMove,
  onDelete,
}: {
  index: number
  total: number
  noun: string
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <TooltipIconButton
        label={index === 0 ? 'Sudah paling atas' : 'Geser ke atas'}
        ariaLabel={`Geser ${noun} ${index + 1} ke atas`}
        onClick={() => onMove(-1)}
        disabled={index === 0}
      >
        <ArrowUp size={16} />
      </TooltipIconButton>
      <TooltipIconButton
        label={index === total - 1 ? 'Sudah paling bawah' : 'Geser ke bawah'}
        ariaLabel={`Geser ${noun} ${index + 1} ke bawah`}
        onClick={() => onMove(1)}
        disabled={index === total - 1}
      >
        <ArrowDown size={16} />
      </TooltipIconButton>
      <TooltipIconButton
        label={`Hapus ${noun}`}
        ariaLabel={`Hapus ${noun} ${index + 1}`}
        onClick={onDelete}
        align="right"
        danger
      >
        <Trash2 size={16} />
      </TooltipIconButton>
    </div>
  )
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  previewSrc,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  previewSrc?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  useEscapeClose(open, onCancel)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-600">
            <Trash2 size={22} aria-hidden="true" />
          </div>
          <h3
            id="confirm-delete-title"
            className="text-lg font-bold text-[#172135]"
          >
            {title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[#566276]">
            {description}
          </p>
        </div>

        {previewSrc && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video">
            <img
              src={previewSrc}
              alt="Pratinjau item yang akan dihapus"
              width={320}
              height={180}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] hover:bg-slate-50 cursor-pointer min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-700 cursor-pointer min-h-[44px]"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export function ImageField({
  id,
  label,
  value,
  onChange,
  onNotify,
  aspectClass = 'aspect-video',
  fit = 'cover',
  emptyText = 'Belum ada gambar',
}: {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  onNotify: NotifyFn
  aspectClass?: string
  fit?: 'cover' | 'contain'
  emptyText?: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
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
      <label
        htmlFor={id}
        className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#159447] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
          uploading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <Upload size={15} aria-hidden="true" />
        {uploading ? 'Mengunggah...' : value ? 'Ganti Gambar' : 'Unggah Gambar'}
      </label>
    </div>
  )
}

export function SaveResetBar({
  isSaving,
  isResetting,
  resetQuestion,
  onConfirmReset,
}: {
  isSaving: boolean
  isResetting: boolean
  resetQuestion: string
  onConfirmReset: () => Promise<void>
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#566276] hover:bg-slate-50 hover:text-[#172135] transition-colors cursor-pointer min-h-[44px]"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset ke Default
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-red-600">
            {resetQuestion}
          </span>
          <button
            type="button"
            disabled={isResetting}
            onClick={async () => {
              await onConfirmReset()
              setShowConfirm(false)
            }}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer min-h-[44px]"
          >
            {isResetting ? 'Mereset...' : 'Ya, Reset'}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer min-h-[44px]"
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
  )
}
