'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown, FileEdit } from 'lucide-react'
import type { ProfileSettings } from '@/lib/site-settings/types'
import {
  isValidProfilePageSlug,
  type ProfilePageSlug,
} from '@/lib/profile-pages/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
} from '@/lib/site-settings/actions'
import {
  ImageField,
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
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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
          Kartu Profil ({formData.cards.length})
        </h2>
        <p className="text-xs text-[#566276] mt-0.5">
          Terkunci pada 7 kartu baku agar susunan bento grid 4+3 di beranda tetap simetris. Gunakan tombol panah untuk mengatur urutan tampilan.
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

              <ImageField
                id={`profile-card-${index}-image`}
                label="Gambar Latar Kartu"
                value={card.image}
                onChange={(url) => updateCard(index, { image: url })}
                onNotify={onNotify}
                aspectClass="aspect-[16/7]"
              />

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

              <div>
                <label
                  htmlFor={`profile-card-${index}-href`}
                  className={LABEL_CLASS}
                >
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
