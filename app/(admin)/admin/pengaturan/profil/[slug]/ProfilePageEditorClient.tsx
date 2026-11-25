'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import {
  AlignLeft,
  ArrowLeft,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Save,
} from 'lucide-react'
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
import { useEscapeClose } from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'
import FeaturedPublicationEditor from './FeaturedPublicationEditor'
import MeaningItemsEditor from './MeaningItemsEditor'
import TimelineEditor from './TimelineEditor'
import LeadersEditor from './LeadersEditor'
import {
  PROFILE_CARD_CLASS,
  PROFILE_CARD_HEADER_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
} from './profileEditorStyles'

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
    <div className="w-full space-y-6 pb-10">
      {/* Header & Navigasi Atas (Identik dengan Modul Berita) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Link
              href="/admin/pengaturan"
              className="text-[11px] font-semibold text-slate-400 hover:text-[#159447] transition-colors"
            >
              Pengaturan Beranda
            </Link>
            <span className="text-[11px] font-semibold text-slate-300">/</span>
            <Link
              href="/admin/pengaturan?tab=profile"
              className="text-[11px] font-semibold text-slate-400 hover:text-[#159447] transition-colors"
            >
              Profil Kota
            </Link>
            <span className="text-[11px] font-semibold text-slate-300">/</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {formData.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#172135] tracking-tight">
              Edit Halaman: {formData.title}
            </h1>
          </div>
          <p className="text-sm text-[#566276] max-w-2xl leading-relaxed mt-1">
            Kelola informasi utama, konten artikel, banner hero, serta data khusus halaman detail profil kota.
          </p>
        </div>

        {/* Tombol Sekunder Kanan Atas */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link
            href="/admin/pengaturan?tab=profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] text-[#172135] text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer min-h-[44px]"
          >
            <ArrowLeft size={15} className="text-slate-500" aria-hidden="true" />
            <span>Kembali</span>
          </Link>
          <a
            href={`/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] text-[#172135] text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer min-h-[44px]"
          >
            <ExternalLink size={15} className="text-[#159447]" aria-hidden="true" />
            <span>Lihat Halaman Publik</span>
          </a>
        </div>
      </div>

      {/* Pill Switcher 7 Halaman Profil */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
        <nav
          aria-label="Navigasi Cepat Halaman Profil Kota"
          className="flex flex-wrap items-center gap-2"
        >
          {PROFILE_SWITCHER_ITEMS.map((item) => {
            const isActive = item.slug === formData.slug
            return (
              <Link
                key={item.slug}
                href={`/admin/pengaturan/profil/${item.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all min-h-[38px] ${
                  isActive
                    ? 'bg-[#159447] text-white border-[#159447] shadow-2xs'
                    : 'bg-[#f8fafc] text-slate-600 border-slate-200/80 hover:border-[#159447]/40 hover:bg-[#f0fdf4] hover:text-[#159447]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Form 2 Kolom Desktop (lg:grid-cols-12) */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* KOLOM KIRI (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kartu Informasi Dasar */}
          <section className={PROFILE_CARD_CLASS}>
            <div className={PROFILE_CARD_HEADER_CLASS}>
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
                  <FileText size={16} className="text-[#159447]" aria-hidden="true" />
                  Informasi Dasar Halaman
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  Judul utama dan ringkasan singkat yang ditampilkan pada bagian atas halaman publik.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="profile-page-title" className={PROFILE_LABEL_CLASS}>
                  Judul Halaman <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-page-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Sejarah Kota Sukabumi"
                  className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-3 text-base font-bold text-[#172135] placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-page-description"
                  className={PROFILE_LABEL_CLASS}
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
                  className={PROFILE_INPUT_CLASS}
                />
              </div>
            </div>
          </section>

          {/* Kartu Konten Utama (RichTextEditor) */}
          <section className={PROFILE_CARD_CLASS}>
            <div className={PROFILE_CARD_HEADER_CLASS}>
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
                  <AlignLeft size={16} className="text-[#159447]" aria-hidden="true" />
                  Konten Utama Halaman
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  Edit naskah, sisipkan gambar atau grafik, serta kelola tabel statistik langsung melalui editor visual.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <RichTextEditor
                value={formData.contentHtml}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, contentHtml: html }))
                }
                enableExtendedTools
                onUploadImage={handleEditorImageUpload}
                minHeight="340px"
                placeholder="Tuliskan isi konten halaman profil di sini..."
              />
            </div>
          </section>

          {/* Kartu Editor Khusus Sesuai Slug */}
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
        </div>

        {/* KOLOM KANAN (lg:col-span-4, Sticky di Desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          {/* Kartu Pengaturan Banner Hero */}
          <section className={PROFILE_CARD_CLASS}>
            <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
                <ImageIcon size={15} className="text-[#159447]" aria-hidden="true" />
                Banner Hero
              </h2>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                Batas 5 MB
              </span>
            </div>

            <div className="p-5 space-y-4">
              <ProfileImageField
                id="profile-hero-image"
                label="Gambar Banner Hero"
                hideHeader
                hint="Format disarankan: JPG, PNG, atau WebP rasio 16:9."
                value={formData.heroImage}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, heroImage: url }))
                }
                onNotify={showToast}
                aspectClass="aspect-[16/9]"
                fit={formData.heroImageFit}
                emptyText="Belum ada gambar banner hero"
              />

              <div className="pt-2 border-t border-slate-100">
                <p className={PROFILE_LABEL_CLASS}>Mode Tampilan Banner</p>
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
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer min-h-[42px] ${
                          active
                            ? 'border-[#159447] bg-[#f0fdf4] text-[#159447]'
                            : 'border-slate-200 bg-[#f8fafc] text-slate-600 hover:bg-slate-100'
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
          </section>

          {/* Kartu Gambar Utama Atas (Opsional) */}
          <section className={PROFILE_CARD_CLASS}>
            <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
                <ImageIcon size={15} className="text-[#159447]" aria-hidden="true" />
                Gambar Utama Atas
              </h2>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                Opsional
              </span>
            </div>

            <div className="p-5 space-y-4">
              <ProfileImageField
                id="profile-content-image"
                label="Gambar Utama Atas"
                hideHeader
                hint="Ditampilkan terpusat di atas isi artikel (misalnya lambang daerah atau foto bersejarah)."
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

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="profile-content-image-title"
                    className={PROFILE_LABEL_CLASS}
                  >
                    Judul di Atas Gambar
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
                    className={PROFILE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-content-image-caption"
                    className={PROFILE_LABEL_CLASS}
                  >
                    Keterangan / Caption Gambar
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
                    className={PROFILE_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tombol Aksi Publikasi (Gaya Kolom Kanan Modul Berita) */}
          <div className="space-y-2.5">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#0f7a36] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer min-h-[48px]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              disabled={isSaving || isResetting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#566276] hover:text-[#172135] text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer min-h-[44px]"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset ke Default</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal Konfirmasi Reset ke Default (Gaya Modal Pengumuman) */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) {
              setIsResetModalOpen(false)
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-profile-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100 text-amber-600">
                <RotateCcw className="h-6 w-6 stroke-[2]" aria-hidden="true" />
              </div>

              <h3
                id="confirm-reset-profile-title"
                className="mb-2 text-lg font-bold text-[#1b293c]"
              >
                Reset Halaman ke Default?
              </h3>

              <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                Seluruh perubahan pada halaman ini akan dikembalikan ke konten bawaan sistem.
              </p>

              <p className="mb-6 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                &ldquo;{formData.title}&rdquo;
              </p>

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleConfirmReset}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[44px] disabled:opacity-70"
                >
                  {isResetting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin text-white"
                        aria-hidden="true"
                      />
                      <span>Mereset...</span>
                    </>
                  ) : (
                    <span>Ya, Reset</span>
                  )}
                </button>
              </div>
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
