'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ProfileSettings } from '@/lib/site-settings/types'
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
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from './shared'

export default function ProfileTab({
  initialData,
  onSaved,
  onNotify,
}: {
  initialData: ProfileSettings
  onSaved: (data: ProfileSettings) => void
  onNotify: NotifyFn
}) {
  const [formData, setFormData] = useState<ProfileSettings>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const updateCard = (
    index: number,
    patch: Partial<ProfileSettings['cards'][number]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, ...patch } : card
      ),
    }))
  }

  const handleAddCard = () => {
    setFormData((prev) => ({
      ...prev,
      cards: [...prev.cards, { title: '', description: '', image: '', href: '' }],
    }))
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== deleteIndex),
    }))
    setDeleteIndex(null)
    onNotify(
      'success',
      'Kartu dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.heading.trim()) {
      onNotify('error', 'Judul section Profil tidak boleh kosong.')
      return
    }
    if (formData.cards.length === 0) {
      onNotify('error', 'Minimal harus terdapat 1 kartu profil.')
      return
    }
    const invalidIndex = formData.cards.findIndex(
      (card) => !card.title.trim() || !card.image.trim()
    )
    if (invalidIndex >= 0) {
      onNotify(
        'error',
        `Kartu #${invalidIndex + 1} wajib memiliki judul dan gambar.`
      )
      return
    }

    setIsSaving(true)
    const res = await updateSiteSectionAction('profile', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Pengaturan Profil Kota berhasil disimpan.')
    } else {
      onNotify('error', res.error || 'Gagal menyimpan pengaturan Profil Kota.')
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    const res = await resetSiteSectionAction('profile')
    setIsResetting(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Profil Kota berhasil dikembalikan ke pengaturan awal.')
    } else {
      onNotify('error', res.error || 'Gagal mereset Profil Kota.')
    }
  }

  const cardToDelete =
    deleteIndex !== null ? formData.cards[deleteIndex] : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Judul Section Profil
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Teks pengantar di atas deretan kartu profil pada halaman beranda.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-heading" className={LABEL_CLASS}>
              Judul Section
            </label>
            <input
              id="profile-heading"
              type="text"
              value={formData.heading}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, heading: e.target.value }))
              }
              placeholder="Profil Kota Sukabumi"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="profile-subtitle" className={LABEL_CLASS}>
              Subjudul
            </label>
            <textarea
              id="profile-subtitle"
              rows={2}
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Kartu Profil ({formData.cards.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Halaman beranda menampilkan 4 kartu di baris pertama, sisanya di baris kedua. Susunan paling rapi dengan 7 kartu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddCard}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Kartu
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {formData.cards.map((card, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                Kartu #{index + 1}
              </span>
              <ReorderDeleteButtons
                index={index}
                total={formData.cards.length}
                noun="kartu"
                onMove={(direction) =>
                  setFormData((prev) => ({
                    ...prev,
                    cards: moveItem(prev.cards, index, direction),
                  }))
                }
                onDelete={() => setDeleteIndex(index)}
              />
            </div>

            <ImageField
              id={`profile-card-${index}-image`}
              label="Gambar Latar Kartu"
              value={card.image}
              onChange={(url) => updateCard(index, { image: url })}
              onNotify={onNotify}
              aspectClass="aspect-[16/7]"
            />

            <div>
              <label htmlFor={`profile-card-${index}-title`} className={LABEL_CLASS}>
                Judul Kartu
              </label>
              <input
                id={`profile-card-${index}-title`}
                type="text"
                value={card.title}
                onChange={(e) => updateCard(index, { title: e.target.value })}
                placeholder="Sejarah"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`profile-card-${index}-desc`} className={LABEL_CLASS}>
                Deskripsi Singkat
              </label>
              <textarea
                id={`profile-card-${index}-desc`}
                rows={2}
                value={card.description}
                onChange={(e) =>
                  updateCard(index, { description: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`profile-card-${index}-href`} className={LABEL_CLASS}>
                Tautan Tujuan
              </label>
              <input
                id={`profile-card-${index}-href`}
                type="text"
                value={card.href}
                onChange={(e) => updateCard(index, { href: e.target.value })}
                placeholder="/sejarah"
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
          </div>
        ))}
      </div>

      <SaveResetBar
        isSaving={isSaving}
        isResetting={isResetting}
        resetQuestion="Kembalikan Profil Kota ke bawaan?"
        onConfirmReset={handleConfirmReset}
      />

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title={`Hapus Kartu #${(deleteIndex ?? 0) + 1}?`}
        description={`Kartu "${
          cardToDelete?.title || 'tanpa judul'
        }" akan dihapus dari daftar Profil Kota.`}
        previewSrc={cardToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </form>
  )
}
