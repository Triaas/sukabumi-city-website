'use client'

import { useState } from 'react'
import {
  Upload,
  Trash2,
  RotateCcw,
  Save,
} from 'lucide-react'
import type { WelcomeSettings } from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
  uploadSiteImageAction,
} from '@/lib/site-settings/actions'

type PhotoSlotKey = 'leftContainerImage' | 'leaderImage' | 'sloganImage'

export default function WelcomeTab({
  initialData,
  onSaved,
  onNotify,
}: {
  initialData: WelcomeSettings
  onSaved: (data: WelcomeSettings) => void
  onNotify: (type: 'success' | 'error', message: string) => void
}) {
  const [formData, setFormData] = useState<WelcomeSettings>(initialData)
  const [uploadingSlot, setUploadingSlot] = useState<PhotoSlotKey | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleFileUpload = async (
    slot: PhotoSlotKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSlot(slot)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadSiteImageAction(fd)
      if (!res.success || !res.imageUrl) {
        onNotify('error', res.error || 'Gagal mengunggah foto.')
      } else {
        setFormData((prev) => ({
          ...prev,
          [slot]: res.imageUrl!,
        }))
        onNotify(
          'success',
          'Foto berhasil diunggah. Klik Simpan Perubahan untuk menerapkan ke halaman utama.'
        )
      }
    } catch {
      onNotify('error', 'Terjadi kesalahan saat mengunggah foto.')
    } finally {
      setUploadingSlot(null)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const res = await updateSiteSectionAction('welcome', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Foto pada bagian Welcome berhasil diperbarui.')
    } else {
      onNotify('error', res.error || 'Gagal menyimpan pengaturan foto Welcome.')
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)

    const res = await resetSiteSectionAction('welcome')
    setIsResetting(false)
    setShowResetConfirm(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify(
        'success',
        'Bagian Welcome berhasil dikembalikan ke pengaturan awal.'
      )
    } else {
      onNotify('error', res.error || 'Gagal mereset bagian Welcome.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Wadah Kontainer Kiri */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                Kolom Kiri
              </span>
              <h2 className="mt-2 text-base font-bold text-[#172135]">
                Foto Kontainer Kiri (Rasio 4:3)
              </h2>
              <p className="text-xs text-[#566276] mt-0.5">
                Tampil di kotak sebelah kiri foto Wali Kota & Wakil. Jika dikosongkan akan menampilkan placeholder.
              </p>
            </div>

            <div className="w-full aspect-[4/3] rounded-2xl bg-[#eff4f8] border border-slate-200 overflow-hidden flex items-center justify-center">
              {formData.leftContainerImage ? (
                <img
                  src={formData.leftContainerImage}
                  alt={formData.leftContainerAlt || 'Foto Kontainer Kiri'}
                  width={440}
                  height={330}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Belum ada foto (Tampil placeholder &quot;Foto&quot;)
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="welcome-left-alt"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1"
              >
                Teks Alternatif (Alt Text)
              </label>
              <input
                id="welcome-left-alt"
                type="text"
                value={formData.leftContainerAlt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leftContainerAlt: e.target.value,
                  }))
                }
                placeholder="Banner Sambutan Kota Sukabumi"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="upload-left-container"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload('leftContainerImage', e)}
              className="sr-only"
            />
            <label
              htmlFor="upload-left-container"
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
                uploadingSlot === 'leftContainerImage'
                  ? 'opacity-60 pointer-events-none'
                  : ''
              }`}
            >
              <Upload size={15} aria-hidden="true" />
              {uploadingSlot === 'leftContainerImage'
                ? 'Mengunggah...'
                : 'Unggah Foto'}
            </label>

            {formData.leftContainerImage && (
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, leftContainerImage: '' }))
                }
                aria-label="Kosongkan foto kontainer kiri"
                className="grid size-11 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Foto Wali Kota & Wakil */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                Kolom Tengah
              </span>
              <h2 className="mt-2 text-base font-bold text-[#172135]">
                Foto Wali Kota & Wakil Wali Kota
              </h2>
              <p className="text-xs text-[#566276] mt-0.5">
                Disarankan menggunakan gambar PNG transparan beresolusi jelas.
              </p>
            </div>

            <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-3">
              <img
                src={formData.leaderImage || '/images/walikota dan wakil.png'}
                alt={formData.leaderAlt || 'Walikota dan Wakil Walikota'}
                width={500}
                height={375}
                className="max-h-full w-auto object-contain"
              />
            </div>

            <div>
              <label
                htmlFor="welcome-leader-alt"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1"
              >
                Teks Alternatif (Alt Text)
              </label>
              <input
                id="welcome-leader-alt"
                type="text"
                value={formData.leaderAlt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leaderAlt: e.target.value,
                  }))
                }
                placeholder="Walikota dan Wakil Walikota Sukabumi"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <input
              id="upload-leader-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload('leaderImage', e)}
              className="sr-only"
            />
            <label
              htmlFor="upload-leader-image"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
                uploadingSlot === 'leaderImage'
                  ? 'opacity-60 pointer-events-none'
                  : ''
              }`}
            >
              <Upload size={15} aria-hidden="true" />
              {uploadingSlot === 'leaderImage'
                ? 'Mengunggah...'
                : 'Ganti Foto Pimpinan'}
            </label>
          </div>
        </div>

        {/* Card 3: Logo Slogan (IMAN) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                Kolom Kanan
              </span>
              <h2 className="mt-2 text-base font-bold text-[#172135]">
                Logo Slogan / Visi (IMAN)
              </h2>
              <p className="text-xs text-[#566276] mt-0.5">
                Gambar logo pendamping di sebelah kanan foto pimpinan daerah.
              </p>
            </div>

            <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-4">
              <img
                src={formData.sloganImage || '/images/Iman.png'}
                alt={formData.sloganAlt || 'Logo Slogan IMAN'}
                width={320}
                height={240}
                className="max-h-full w-auto object-contain"
              />
            </div>

            <div>
              <label
                htmlFor="welcome-slogan-alt"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1"
              >
                Teks Alternatif (Alt Text)
              </label>
              <input
                id="welcome-slogan-alt"
                type="text"
                value={formData.sloganAlt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sloganAlt: e.target.value,
                  }))
                }
                placeholder="IMAN - Inovatif, Mandiri, Agamis, Nasionalis"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#172135] focus:border-[#159447] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <input
              id="upload-slogan-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(e) => handleFileUpload('sloganImage', e)}
              className="sr-only"
            />
            <label
              htmlFor="upload-slogan-image"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px] ${
                uploadingSlot === 'sloganImage'
                  ? 'opacity-60 pointer-events-none'
                  : ''
              }`}
            >
              <Upload size={15} aria-hidden="true" />
              {uploadingSlot === 'sloganImage'
                ? 'Mengunggah...'
                : 'Ganti Gambar Slogan'}
            </label>
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
              Kembalikan semua foto ke bawaan?
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
