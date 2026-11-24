'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown, FileEdit, Upload } from 'lucide-react'
import type { ProfileSettings } from '@/lib/site-settings/types'
import {
  isValidProfilePageSlug,
  type ProfilePageSlug,
} from '@/lib/profile-pages/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
  uploadSiteImageAction,
} from '@/lib/site-settings/actions'
import {
  TooltipIconButton,
  SaveResetBar,
  moveItem,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from './shared'

function extractProfileSlug(href: string): ProfilePageSlug | null {
  const cleaned = href
    .trim()
    .split(/[?#]/)[0]
    .replace(/^\/+|\/+$/g, '')
  return isValidProfilePageSlug(cleaned) ? cleaned : null
}

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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleCardImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
      if (!res.success || !res.imageUrl) {
        onNotify('error', res.error || 'Gagal mengunggah gambar.')
      } else {
        updateCard(index, { image: res.imageUrl })
        onNotify(
          'success',
          'Gambar berhasil diunggah. Klik Simpan Perubahan untuk menerapkan.'
        )
      }
    } catch {
      onNotify('error', 'Terjadi kesalahan saat mengunggah gambar.')
    } finally {
      setUploadingIndex(null)
      e.target.value = ''
    }
  }

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

      <div>
        <h2 className="text-lg font-bold text-[#172135]">
          Kartu Profil
        </h2>
        <p className="text-xs text-[#566276] mt-0.5">
          Atur judul, deskripsi, gambar, dan urutan tampilan kartu profil yang muncul di beranda. Gunakan tombol panah untuk menggeser posisi kartu.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {formData.cards.map((card, index) => {
          const detailSlug = extractProfileSlug(card.href)
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                  Kartu #{index + 1}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TooltipIconButton
                    label={index === 0 ? 'Sudah paling atas' : 'Geser ke atas'}
                    ariaLabel={`Geser kartu ${index + 1} ke atas`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        cards: moveItem(prev.cards, index, -1),
                      }))
                    }
                    disabled={index === 0}
                  >
                    <ArrowUp size={16} />
                  </TooltipIconButton>
                  <TooltipIconButton
                    label={
                      index === formData.cards.length - 1
                        ? 'Sudah paling bawah'
                        : 'Geser ke bawah'
                    }
                    ariaLabel={`Geser kartu ${index + 1} ke bawah`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        cards: moveItem(prev.cards, index, 1),
                      }))
                    }
                    disabled={index === formData.cards.length - 1}
                    align="right"
                  >
                    <ArrowDown size={16} />
                  </TooltipIconButton>
                </div>
              </div>

              <div>
                <p className={LABEL_CLASS}>Gambar Latar Kartu</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row sm:items-center gap-3.5">
                  <div className="w-full sm:w-40 aspect-[16/10] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={`Pratinjau ${card.title || `Kartu ${index + 1}`}`}
                        width={160}
                        height={100}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-[11px] font-medium text-slate-500">
                        Belum ada gambar
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <p className="text-xs text-[#566276] leading-relaxed">
                      Ditampilkan sebagai latar kartu profil di beranda.
                    </p>
                    <div>
                      <input
                        id={`profile-card-${index}-image`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={(e) => handleCardImageUpload(index, e)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`profile-card-${index}-image`}
                        className={`inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-[#159447] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
                          uploadingIndex === index
                            ? 'opacity-60 pointer-events-none'
                            : ''
                        }`}
                      >
                        <Upload size={14} aria-hidden="true" />
                        {uploadingIndex === index
                          ? 'Mengunggah...'
                          : card.image
                            ? 'Ganti Gambar'
                            : 'Unggah Gambar'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`profile-card-${index}-title`}
                  className={LABEL_CLASS}
                >
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
                <label
                  htmlFor={`profile-card-${index}-desc`}
                  className={LABEL_CLASS}
                >
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

              {detailSlug && (
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/admin/pengaturan/profil/${detailSlug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#159447]/30 bg-emerald-50/70 px-4 py-2.5 text-xs font-bold text-[#159447] hover:bg-[#159447] hover:text-white transition-colors min-h-[44px]"
                  >
                    <FileEdit size={15} aria-hidden="true" />
                    Edit Halaman Detail
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <SaveResetBar
        isSaving={isSaving}
        isResetting={isResetting}
        resetQuestion="Kembalikan Profil Kota ke bawaan?"
        onConfirmReset={handleConfirmReset}
      />
    </form>
  )
}
