'use client'

import { useState } from 'react'
import {
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { MediaSettings } from '@/lib/site-settings/types'
import { normalizeYoutubeEmbedUrl } from '@/lib/site-settings/defaults'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
} from '@/lib/site-settings/actions'

export default function MediaTab({
  initialData,
  onSaved,
}: {
  initialData: MediaSettings
  onSaved: (data: MediaSettings) => void
}) {
  const [formData, setFormData] = useState<MediaSettings>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const previewEmbedUrl = normalizeYoutubeEmbedUrl(formData.youtubeEmbedUrl)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFeedback(null)

    const normalizedPayload: MediaSettings = {
      ...formData,
      youtubeEmbedUrl: normalizeYoutubeEmbedUrl(formData.youtubeEmbedUrl),
    }

    const res = await updateSiteSectionAction('media', normalizedPayload)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      setFeedback({
        type: 'success',
        message: 'Pengaturan Media & GPR Komdigi berhasil disimpan.',
      })
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal menyimpan pengaturan Media Section.',
      })
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    setFeedback(null)

    const res = await resetSiteSectionAction('media')
    setIsResetting(false)
    setShowResetConfirm(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      setFeedback({
        type: 'success',
        message: 'Media Section berhasil dikembalikan ke pengaturan awal.',
      })
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal mereset Media Section.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-[#159447]'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#172135]">
              Video YouTube & GPR Komdigi
            </h2>
            <p className="text-xs text-[#566276] mt-0.5">
              Tempel link video YouTube biasa (watch?v= atau youtu.be/), sistem otomatis mengubahnya ke format embed.
            </p>
          </div>

          <div>
            <label
              htmlFor="media-youtube-url"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Link Video YouTube
            </label>
            <input
              id="media-youtube-url"
              type="url"
              required
              value={formData.youtubeEmbedUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  youtubeEmbedUrl: e.target.value,
                }))
              }
              placeholder="https://www.youtube.com/watch?v=p2gcx5S5QJE"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
            <p className="mt-1 text-xs text-[#566276]">
              URL Embed hasil konversi:{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-[#159447]">
                {previewEmbedUrl}
              </code>
            </p>
          </div>

          <div>
            <label
              htmlFor="media-youtube-title"
              className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
            >
              Judul Video YouTube (Atribut Title)
            </label>
            <input
              id="media-youtube-title"
              type="text"
              value={formData.youtubeTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  youtubeTitle: e.target.value,
                }))
              }
              placeholder="Profil Kota Sukabumi"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-[#172135]">
              Header Kartu GPR Komdigi
            </h3>

            <div>
              <label
                htmlFor="media-gpr-title"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Judul Kartu GPR
              </label>
              <input
                id="media-gpr-title"
                type="text"
                value={formData.gprTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gprTitle: e.target.value,
                  }))
                }
                placeholder="GPR KOMDIGI"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
              />
            </div>

            <div>
              <label
                htmlFor="media-gpr-subtitle"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Subjudul Kartu GPR
              </label>
              <input
                id="media-gpr-subtitle"
                type="text"
                value={formData.gprSubtitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gprSubtitle: e.target.value,
                  }))
                }
                placeholder="Kanal Berita Nasional"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
              />
            </div>

            <div>
              <label
                htmlFor="media-gpr-url"
                className="block text-xs font-bold uppercase tracking-wider text-[#172135] mb-1.5"
              >
                Tautan Tombol Portal GPR
              </label>
              <input
                id="media-gpr-url"
                type="url"
                value={formData.gprPortalUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gprPortalUrl: e.target.value,
                  }))
                }
                placeholder="https://www.komdigi.go.id"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] focus:border-[#159447] focus:outline-none focus:ring-2 focus:ring-[#159447]/20"
              />
            </div>
          </div>
        </div>

        {/* Live Video Preview */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#172135]">
                Pratinjau Pemutar YouTube
              </h2>
              <p className="text-xs text-[#566276] mt-0.5">
                Pastikan video dapat diputar dan tidak dibatasi untuk penyematan (embed).
              </p>
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
              <iframe
                src={previewEmbedUrl}
                title={formData.youtubeTitle || 'Pratinjau Video'}
                className="h-full w-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
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
                  Kembalikan ke bawaan?
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
        </div>
      </div>
    </form>
  )
}
