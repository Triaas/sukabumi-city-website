'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { PartnersSettings } from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
} from '@/lib/site-settings/actions'
import {
  ConfirmDeleteModal,
  ImageField,
  ReorderDeleteButtons,
  SaveResetBar,
  moveItem,
  useTabUnsavedGuard,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
  type TabUnsavedProps,
} from './shared'

export default function PartnersTab({
  initialData,
  onSaved,
  onNotify,
  onDirtyChange,
  registerSaveHandler,
}: {
  initialData: PartnersSettings
  onSaved: (data: PartnersSettings) => void
  onNotify: NotifyFn
} & TabUnsavedProps) {
  const [formData, setFormData] = useState<PartnersSettings>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const updateItem = (
    index: number,
    patch: Partial<PartnersSettings['items'][number]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }))
  }

  const handleAddPartner = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.reduce((max, item) => Math.max(max, item.id), 0) + 1,
          image: '',
          href: '',
          alt: '',
        },
      ],
    }))
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== deleteIndex),
    }))
    setDeleteIndex(null)
    onNotify(
      'success',
      'Mitra dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const saveChanges = async (): Promise<boolean> => {
    if (formData.items.length === 0) {
      onNotify('error', 'Minimal harus terdapat 1 logo mitra.')
      return false
    }
    const invalidIndex = formData.items.findIndex(
      (item) => !item.image.trim() || !item.href.trim()
    )
    if (invalidIndex >= 0) {
      onNotify(
        'error',
        `Mitra #${invalidIndex + 1} wajib memiliki logo dan URL tujuan.`
      )
      return false
    }

    setIsSaving(true)
    const res = await updateSiteSectionAction('partners', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Pengaturan Mitra / Partner berhasil disimpan.')
      return true
    } else {
      onNotify('error', res.error || 'Gagal menyimpan pengaturan Mitra / Partner.')
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
    const res = await resetSiteSectionAction('partners')
    setIsResetting(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Mitra / Partner berhasil dikembalikan ke pengaturan awal.')
    } else {
      onNotify('error', res.error || 'Gagal mereset Mitra / Partner.')
    }
  }

  const itemToDelete =
    deleteIndex !== null ? formData.items[deleteIndex] : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Logo Mitra / Partner ({formData.items.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Logo berjalan di bagian bawah halaman beranda. Urutan di sini adalah urutan tampil.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPartner}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Mitra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {formData.items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                Mitra #{index + 1}
              </span>
              <ReorderDeleteButtons
                index={index}
                total={formData.items.length}
                noun="mitra"
                onMove={(direction) =>
                  setFormData((prev) => ({
                    ...prev,
                    items: moveItem(prev.items, index, direction),
                  }))
                }
                onDelete={() => setDeleteIndex(index)}
              />
            </div>

            <ImageField
              id={`partner-${item.id}-image`}
              label="Logo Mitra"
              value={item.image}
              onChange={(url) => updateItem(index, { image: url })}
              onNotify={onNotify}
              aspectClass="aspect-[16/7]"
              fit="contain"
            />

            <div>
              <label htmlFor={`partner-${item.id}-href`} className={LABEL_CLASS}>
                URL Tujuan
              </label>
              <input
                id={`partner-${item.id}-href`}
                type="url"
                value={item.href}
                onChange={(e) => updateItem(index, { href: e.target.value })}
                placeholder="https://"
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
          </div>
        ))}
      </div>

      <SaveResetBar
        isSaving={isSaving}
        isResetting={isResetting}
        resetQuestion="Kembalikan Mitra / Partner ke bawaan?"
        onConfirmReset={handleConfirmReset}
      />

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title={`Hapus Mitra #${(deleteIndex ?? 0) + 1}?`}
        description={`Logo "${
          itemToDelete?.alt || 'mitra'
        }" akan dihapus dari marquee beranda.`}
        previewSrc={itemToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </form>
  )
}
