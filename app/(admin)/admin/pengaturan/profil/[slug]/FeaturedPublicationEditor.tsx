'use client'

import { BookOpen } from 'lucide-react'
import type { FeaturedPublication } from '@/lib/profile-pages/types'
import type { NotifyFn } from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'
import {
  PROFILE_CARD_CLASS,
  PROFILE_CARD_HEADER_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
} from './profileEditorStyles'

export default function FeaturedPublicationEditor({
  value,
  onChange,
  onNotify,
}: {
  value: FeaturedPublication | undefined
  onChange: (next: FeaturedPublication | undefined) => void
  onNotify: NotifyFn
}) {
  const pub: FeaturedPublication = value ?? {
    src: '',
    caption: '',
    link: '',
  }

  const update = (patch: Partial<FeaturedPublication>) => {
    const merged: FeaturedPublication = { ...pub, ...patch }
    if (!merged.src && !merged.caption && !merged.link && !merged.title) {
      onChange(undefined)
    } else {
      onChange(merged)
    }
  }

  return (
    <section className={PROFILE_CARD_CLASS}>
      <div className={PROFILE_CARD_HEADER_CLASS}>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
            <BookOpen size={16} className="text-[#159447]" aria-hidden="true" />
            Publikasi Unggulan (BPS)
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Gambar sampul publikasi Sukabumi Dalam Angka beserta tautan eksternal ke portal BPS.
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-5">
          <ProfileImageField
            id="pub-cover-upload"
            label="Sampul Publikasi"
            value={pub.src}
            onChange={(url) => update({ src: url })}
            onNotify={onNotify}
            aspectClass="aspect-[3/4]"
            fit="contain"
            emptyText="Belum ada sampul publikasi"
            allowClear
          />
        </div>

        <div className="md:col-span-7 space-y-4">
          <div>
            <label htmlFor="pub-caption" className={PROFILE_LABEL_CLASS}>
              Keterangan / Sumber Publikasi
            </label>
            <input
              id="pub-caption"
              type="text"
              value={pub.caption ?? ''}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Sumber: BPS Kota Sukabumi 2026"
              className={PROFILE_INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="pub-link" className={PROFILE_LABEL_CLASS}>
              URL Tautan Publikasi BPS
            </label>
            <input
              id="pub-link"
              type="url"
              value={pub.link ?? ''}
              onChange={(e) => update({ link: e.target.value })}
              placeholder="https://sukabumikota.bps.go.id/..."
              className={`${PROFILE_INPUT_CLASS} font-mono text-xs`}
            />
          </div>

          <div>
            <label htmlFor="pub-title" className={PROFILE_LABEL_CLASS}>
              Judul Bingkai (Opsional)
            </label>
            <input
              id="pub-title"
              type="text"
              value={pub.title ?? ''}
              onChange={(e) => update({ title: e.target.value || undefined })}
              placeholder="Kosongkan untuk tampil tanpa judul bingkai"
              className={PROFILE_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
