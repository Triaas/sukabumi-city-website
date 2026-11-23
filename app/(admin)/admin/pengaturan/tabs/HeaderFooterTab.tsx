'use client'

import { useState } from 'react'
import {
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  Save,
} from 'lucide-react'
import type { HeaderFooterSettings } from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
  uploadSiteImageAction,
} from '@/lib/site-settings/actions'

export default function HeaderFooterTab({
  initialData,
  onSaved,
  onNotify,
}: {
  initialData: HeaderFooterSettings
  onSaved: (data: HeaderFooterSettings) => void
  onNotify: (type: 'success' | 'error', message: string) => void
}) {
  const [formData, setFormData] = useState<HeaderFooterSettings>(initialData)
  const [uploadingLogo, setUploadingLogo] = useState<
    'headerLogoUrl' | 'footerLogoUrl' | null
  >(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleLogoUpload = async (
    targetField: 'headerLogoUrl' | 'footerLogoUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(targetField)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
      if (!res.success || !res.imageUrl) {
        onNotify('error', res.error || 'Gagal mengunggah logo.')
      } else {
        setFormData((prev) => ({
          ...prev,
          [targetField]: res.imageUrl!,
        }))
        onNotify(
          'success',
          'Logo berhasil diunggah. Klik Simpan Perubahan untuk memperbarui Header & Footer.'
        )
      }
    } catch {
      onNotify('error', 'Terjadi kesalahan saat mengunggah logo.')
    } finally {
      setUploadingLogo(null)
      e.target.value = ''
    }
  }

  const handleAddRelatedLink = () => {
    setFormData((prev) => ({
      ...prev,
      relatedLinks: [
        ...prev.relatedLinks,
        { label: 'Tautan Baru', href: 'https://' },
      ],
    }))
  }

  const handleUpdateRelatedLink = (
    index: number,
    field: 'label' | 'href',
    value: string
  ) => {
    setFormData((prev) => {
      const next = [...prev.relatedLinks]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, relatedLinks: next }
    })
  }

  const handleRemoveRelatedLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((_, idx) => idx !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const res = await updateSiteSectionAction('headerFooter', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify(
        'success',
        'Pengaturan Header & Footer berhasil disimpan dan langsung diperbarui di seluruh halaman publik.'
      )
    } else {
      onNotify(
        'error',
        res.error || 'Gagal menyimpan pengaturan Header & Footer.'
      )
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)

    const res = await resetSiteSectionAction('headerFooter')
    setIsResetting(false)
    setShowResetConfirm(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify(
        'success',
        'Header & Footer berhasil dikembalikan ke pengaturan awal.'
      )
    } else {
      onNotify('error', res.error || 'Gagal mereset Header & Footer.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Identitas Brand & Logo */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#172135]">
              Identitas Brand (Navbar & Footer)
            </h2>
            <p className="text-xs text-[#566276] mt-0.5">
              Mengatur logo lambang kota, nama instansi, motto, dan deskripsi singkat pada footer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Logo Navbar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#172135]">Logo Navbar</p>
                <div className="mt-2 h-20 rounded-lg bg-slate-900/85 flex items-center justify-center p-2">
                  <img
                    src={formData.headerLogoUrl || '/logo.png'}
                    alt="Logo Navbar"
                    width={68}
                    height={68}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </div>
              <div>
                <input
                  id="upload-header-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload('headerLogoUrl', e)}
                  className="sr-only"
                />
                <label
                  htmlFor="upload-header-logo"
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#159447] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f7a36] cursor-pointer min-h-[40px] ${
                    uploadingLogo === 'headerLogoUrl'
                      ? 'opacity-60 pointer-events-none'
                      : ''
                  }`}
                >
                  <Upload size={14} aria-hidden="true" />
                  {uploadingLogo === 'headerLogoUrl'
                    ? 'Mengunggah...'
                    : 'Ganti Logo Navbar'}
                </label>
              </div>
            </div>

            {/* Logo Footer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#172135]">Logo Footer</p>
                <div className="mt-2 h-20 rounded-lg bg-[#17253a] flex items-center justify-center p-2">
                  <img
                    src={
                      formData.footerLogoUrl ||
                      '/images/Lambang_Kota_Sukabumi.png'
                    }
                    alt="Logo Footer"
                    width={64}
                    height={64}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </div>
              <div>
                <input
                  id="upload-footer-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload('footerLogoUrl', e)}
                  className="sr-only"
                />
                <label
                  htmlFor="upload-footer-logo"
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#159447] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f7a36] cursor-pointer min-h-[40px] ${
                    uploadingLogo === 'footerLogoUrl'
                      ? 'opacity-60 pointer-events-none'
                      : ''
                  }`}
                >
                  <Upload size={14} aria-hidden="true" />
                  {uploadingLogo === 'footerLogoUrl'
                    ? 'Mengunggah...'
                    : 'Ganti Logo Footer'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="hf-top-label"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Label Atas
              </label>
              <input
                id="hf-top-label"
                type="text"
                value={formData.topLabel}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, topLabel: e.target.value }))
                }
                placeholder="WEBSITE RESMI"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hf-motto"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Teks Motto
              </label>
              <input
                id="hf-motto"
                type="text"
                value={formData.mottoText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mottoText: e.target.value,
                  }))
                }
                placeholder="Reugreug Pageuh Repeh Rapih"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hf-org-name"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Nama Instansi
            </label>
            <input
              id="hf-org-name"
              type="text"
              value={formData.orgName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orgName: e.target.value }))
              }
              placeholder="Pemerintah Kota Sukabumi"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#172135] focus:border-[#159447] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="hf-footer-desc"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Deskripsi Singkat Footer
            </label>
            <textarea
              id="hf-footer-desc"
              rows={3}
              value={formData.footerDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  footerDescription: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="hf-managed-label"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Dikelola Oleh (Nama)
              </label>
              <input
                id="hf-managed-label"
                type="text"
                value={formData.managedByLabel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    managedByLabel: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="hf-managed-url"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Dikelola Oleh (URL)
              </label>
              <input
                id="hf-managed-url"
                type="url"
                value={formData.managedByUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    managedByUrl: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kontak Resmi, Tautan Terkait, Media Sosial */}
        <div className="lg:col-span-6 space-y-6">
          {/* Kontak Resmi */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#172135]">
              Kontak Resmi & Alamat
            </h2>

            <div>
              <label
                htmlFor="hf-address"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Teks Alamat Lengkap
              </label>
              <input
                id="hf-address"
                type="text"
                value={formData.addressText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressText: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hf-maps"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Tautan Google Maps
              </label>
              <input
                id="hf-maps"
                type="url"
                value={formData.mapsUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mapsUrl: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hf-phone-display"
                  className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
                >
                  Teks Telepon
                </label>
                <input
                  id="hf-phone-display"
                  type="text"
                  value={formData.phoneDisplay}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneDisplay: e.target.value,
                    }))
                  }
                  placeholder="Telp : +62 (266) 20229715"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="hf-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
                >
                  Alamat Email Resmi
                </label>
                <input
                  id="hf-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="diskominfo@sukabumikota.go.id"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tautan Terkait & Media Sosial */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[#172135]">
                Tautan Terkait di Footer
              </h2>
              <button
                type="button"
                onClick={handleAddRelatedLink}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs font-bold text-[#159447] hover:bg-green-100 cursor-pointer min-h-[38px]"
              >
                <Plus size={14} aria-hidden="true" />
                Tambah Tautan
              </button>
            </div>

            <div className="space-y-3">
              {formData.relatedLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
                >
                  <input
                    type="text"
                    aria-label={`Nama tautan terkait ${idx + 1}`}
                    value={item.label}
                    onChange={(e) =>
                      handleUpdateRelatedLink(idx, 'label', e.target.value)
                    }
                    placeholder="Nama Layanan"
                    className="sm:col-span-5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                  <input
                    type="url"
                    aria-label={`URL tautan terkait ${idx + 1}`}
                    value={item.href}
                    onChange={(e) =>
                      handleUpdateRelatedLink(idx, 'href', e.target.value)
                    }
                    placeholder="https://..."
                    className="sm:col-span-6 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRelatedLink(idx)}
                    aria-label={`Hapus tautan ${item.label}`}
                    className="sm:col-span-1 grid size-9 place-items-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer justify-self-end"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-[#172135]">
                Tautan Media Sosial Resmi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="hf-social-fb"
                    className="block text-[11px] font-bold uppercase text-[#566276] mb-1"
                  >
                    Facebook URL
                  </label>
                  <input
                    id="hf-social-fb"
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          facebook: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hf-social-x"
                    className="block text-[11px] font-bold uppercase text-[#566276] mb-1"
                  >
                    X (Twitter) URL
                  </label>
                  <input
                    id="hf-social-x"
                    type="url"
                    value={formData.socialLinks.x}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          x: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hf-social-ig"
                    className="block text-[11px] font-bold uppercase text-[#566276] mb-1"
                  >
                    Instagram URL
                  </label>
                  <input
                    id="hf-social-ig"
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          instagram: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hf-social-yt"
                    className="block text-[11px] font-bold uppercase text-[#566276] mb-1"
                  >
                    YouTube Channel URL
                  </label>
                  <input
                    id="hf-social-yt"
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          youtube: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#566276] hover:bg-slate-50 hover:text-[#172135] transition-colors cursor-pointer min-h-[44px]"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset ke Default
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-600">
              Kembalikan Header & Footer ke bawaan?
            </span>
            <button
              type="button"
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer min-h-[38px]"
            >
              {isResetting ? 'Mereset...' : 'Ya, Reset'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer min-h-[38px]"
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
    </form>
  )
}
