'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, RotateCcw, Save } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import ToastNotification from '@/components/ToastNotification'
import {
  resetProfilePageAction,
  updateProfilePageAction,
  uploadProfileImageAction,
} from '@/lib/profile-pages/actions'
import type {
  ProfilePageData,
  ProfilePageExtraData,
  ProfilePageSlug,
} from '@/lib/profile-pages/types'
import {
  INPUT_CLASS,
  LABEL_CLASS,
  useEscapeClose,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'
import FeaturedPublicationEditor from './FeaturedPublicationEditor'
import MeaningItemsEditor from './MeaningItemsEditor'
import TimelineEditor from './TimelineEditor'
import LeadersEditor from './LeadersEditor'

const PROFILE_SWITCHER_ITEMS: Array<{ slug: ProfilePageSlug; label: string }> = [
  { slug: 'sejarah', label: 'Sejarah' },
  { slug: 'visi-misi', label: 'Visi & Misi' },
  { slug: 'lambang', label: 'Lambang' },
  { slug: 'geografi', label: 'Geografi' },
  { slug: 'sosial-ekonomi', label: 'Sosial Ekonomi' },
  { slug: 'dalam-angka', label: 'Dalam Angka' },
  { slug: 'uks', label: 'UKS' },
]

export default function ProfilePageEditorClient({
  initialPage,
}: {
  initialPage: ProfilePageData
}) {
  const [formData, setFormData] = useState<ProfilePageData>(initialPage)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message })
    },
    []
  )

  useEscapeClose(isResetModalOpen && !isResetting, () =>
    setIsResetModalOpen(false)
  )

  const updateExtraData = (patch: Partial<ProfilePageExtraData>) => {
    setFormData((prev) => ({
      ...prev,
      extraData: {
        ...prev.extraData,
        ...patch,
      },
    }))
  }

  const handleEditorImageUpload = useCallback(
    async (file: File): Promise<string> => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadProfileImageAction(fd)
      if (!res.success || !res.imageUrl) {
        throw new Error(res.error || 'Gagal mengunggah gambar konten.')
      }
      return res.imageUrl
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      showToast('error', 'Judul halaman tidak boleh kosong.')
      return
    }

    setIsSaving(true)
    const res = await updateProfilePageAction(formData.slug, {
      title: formData.title,
      description: formData.description,
      heroImage: formData.heroImage,
      heroImageFit: formData.heroImageFit,
      contentImage: formData.contentImage || null,
      contentImageTitle: formData.contentImageTitle || null,
      contentImageCaption: formData.contentImageCaption || null,
      contentHtml: formData.contentHtml,
      extraData: formData.extraData,
    })
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      showToast('success', `Halaman "${res.data.title}" berhasil disimpan.`)
    } else {
      showToast('error', res.error || 'Gagal menyimpan perubahan halaman.')
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    const res = await resetProfilePageAction(formData.slug)
    setIsResetting(false)
    setIsResetModalOpen(false)

    if (res.success && res.data) {
      setFormData(res.data)
      showToast(
        'success',
        `Halaman "${res.data.title}" berhasil dikembalikan ke default.`
      )
    } else {
      showToast('error', res.error || 'Gagal mereset halaman ke default.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigasi Atas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <Link
              href="/admin/pengaturan?tab=profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159447] hover:text-[#0f7a36] transition-colors"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Kembali ke Pengaturan (Profil Kota)
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                Edit Halaman: {formData.title}
              </h1>
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-mono font-semibold text-slate-600">
                /{formData.slug}
              </span>
            </div>
          </div>

          <a
            href={`/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] shadow-sm hover:border-[#159447] hover:text-[#159447] transition-colors shrink-0 min-h-[44px]"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Lihat Halaman Publik
          </a>
        </div>

        {/* Pill Switcher Cepat 7 Halaman Profil */}
        <nav
          aria-label="Navigasi Cepat Halaman Profil Kota"
          className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
        >
          {PROFILE_SWITCHER_ITEMS.map((item) => {
            const isActive = item.slug === formData.slug
            return (
              <Link
                key={item.slug}
                href={`/admin/pengaturan/profil/${item.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center rounded-full px-3.5 py-2 text-xs font-bold transition-colors min-h-[38px] ${
                  isActive
                    ? 'bg-[#159447] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-[#159447]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bagian 1: Informasi Utama & Banner Hero */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#172135]">
              Informasi Utama &amp; Banner Hero
            </h2>
            <p className="text-xs text-[#566276] mt-0.5">
              Judul, subjudul, gambar latar bagian atas (hero), serta gambar utama opsional di awal artikel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4">
              <ProfileImageField
                id="profile-hero-image"
                label="Gambar Banner Hero"
                value={formData.heroImage}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, heroImage: url }))
                }
                onNotify={showToast}
                aspectClass="aspect-[16/9]"
                fit={formData.heroImageFit}
                emptyText="Belum ada gambar banner"
              />

              <div>
                <p className={LABEL_CLASS}>Mode Tampilan Banner (Hero Fit)</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['cover', 'contain'] as const).map((fitMode) => {
                    const active = formData.heroImageFit === fitMode
                    return (
                      <button
                        key={fitMode}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            heroImageFit: fitMode,
                          }))
                        }
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                          active
                            ? 'border-[#159447] bg-emerald-50 text-[#159447]'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {fitMode === 'cover'
                          ? 'Cover (Penuh)'
                          : 'Contain (Utuh)'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div>
                <label htmlFor="profile-page-title" className={LABEL_CLASS}>
                  Judul Halaman
                </label>
                <input
                  id="profile-page-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Sejarah Kota Sukabumi"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor="profile-page-description"
                  className={LABEL_CLASS}
                >
                  Subjudul / Deskripsi Singkat
                </label>
                <textarea
                  id="profile-page-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ringkasan singkat yang tampil di bawah judul halaman"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Gambar Utama Atas (Opsional) */}
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#172135]">
                Gambar Utama Atas (Opsional)
              </h3>
              <p className="text-xs text-[#566276]">
                Ditampilkan terpusat di atas isi artikel (misalnya lambang daerah atau foto bersejarah). Kosongkan jika tidak diperlukan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4">
                <ProfileImageField
                  id="profile-content-image"
                  label="Gambar Utama Atas"
                  value={formData.contentImage ?? ''}
                  onChange={(url) =>
                    setFormData((prev) => ({
                      ...prev,
                      contentImage: url || null,
                    }))
                  }
                  onNotify={showToast}
                  aspectClass="aspect-[4/3]"
                  fit="contain"
                  emptyText="Tidak menggunakan gambar utama atas"
                  allowClear
                />
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label
                    htmlFor="profile-content-image-title"
                    className={LABEL_CLASS}
                  >
                    Judul di Atas Gambar (Opsional)
                  </label>
                  <input
                    id="profile-content-image-title"
                    type="text"
                    value={formData.contentImageTitle ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contentImageTitle: e.target.value || null,
                      }))
                    }
                    placeholder="Contoh: WALI KOTA SUKABUMI"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-content-image-caption"
                    className={LABEL_CLASS}
                  >
                    Keterangan / Caption Gambar (Opsional)
                  </label>
                  <input
                    id="profile-content-image-caption"
                    type="text"
                    value={formData.contentImageCaption ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contentImageCaption: e.target.value || null,
                      }))
                    }
                    placeholder="Contoh: Rumah dinas residen Sukabumi tempo dulu"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bagian 2: Editor Konten Utama (RichTextEditor) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#172135]">
              Konten Utama Halaman
            </h2>
            <p className="text-xs text-[#566276] mt-0.5">
              Edit naskah, sisipkan gambar atau grafik, serta kelola tabel statistik langsung melalui editor visual.
            </p>
          </div>

          <RichTextEditor
            value={formData.contentHtml}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, contentHtml: html }))
            }
            enableExtendedTools
            onUploadImage={handleEditorImageUpload}
            minHeight="320px"
            placeholder="Tuliskan isi konten halaman profil di sini..."
          />
        </section>

        {/* Bagian 3: Editor Khusus Sesuai Slug */}
        {formData.slug === 'dalam-angka' && (
          <FeaturedPublicationEditor
            value={formData.extraData.featuredPublication}
            onChange={(featuredPublication) =>
              updateExtraData({ featuredPublication })
            }
            onNotify={showToast}
          />
        )}

        {formData.slug === 'lambang' && (
          <MeaningItemsEditor
            items={formData.extraData.meaningItems ?? []}
            onChange={(meaningItems) => updateExtraData({ meaningItems })}
            onNotify={showToast}
          />
        )}

        {formData.slug === 'sejarah' && (
          <>
            <TimelineEditor
              value={formData.extraData.timelineData}
              onChange={(timelineData) => updateExtraData({ timelineData })}
              onNotify={showToast}
            />
            <LeadersEditor
              value={formData.extraData.leadersData}
              onChange={(leadersData) => updateExtraData({ leadersData })}
              onNotify={showToast}
            />
          </>
        )}

        {/* Action Bar Bawah */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#566276] hover:bg-slate-50 hover:text-[#172135] transition-colors cursor-pointer min-h-[44px]"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset ke Default
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#159447] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0f7a36] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
          >
            <Save size={16} aria-hidden="true" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {/* Modal Konfirmasi Reset ke Default */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) {
              setIsResetModalOpen(false)
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-profile-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-600">
                <RotateCcw size={22} aria-hidden="true" />
              </div>
              <h3
                id="confirm-reset-profile-title"
                className="text-lg font-bold text-[#172135]"
              >
                Reset Halaman ke Default?
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#566276]">
                Seluruh perubahan pada halaman &ldquo;{formData.title}&rdquo; akan dikembalikan ke konten bawaan sistem.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] hover:bg-slate-50 cursor-pointer min-h-[44px] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-700 cursor-pointer min-h-[44px] disabled:opacity-60"
              >
                {isResetting ? 'Mereset...' : 'Ya, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastNotification
        message={toast?.message}
        type={toast?.type}
        duration={3500}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
