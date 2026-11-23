'use client'

import type { FeaturedPublication } from '@/lib/profile-pages/types'
import {
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'

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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#172135]">
          Publikasi Unggulan (BPS)
        </h2>
        <p className="text-xs text-[#566276] mt-0.5">
          Gambar sampul publikasi Sukabumi Dalam Angka beserta tautan eksternal ke portal BPS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
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

        <div className="lg:col-span-8 space-y-4">
          <div>
            <label htmlFor="pub-caption" className={LABEL_CLASS}>
              Keterangan / Sumber Publikasi
            </label>
            <input
              id="pub-caption"
              type="text"
              value={pub.caption ?? ''}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Sumber: BPS Kota Sukabumi 2026"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="pub-link" className={LABEL_CLASS}>
              URL Tautan Publikasi BPS
            </label>
            <input
              id="pub-link"
              type="url"
              value={pub.link ?? ''}
              onChange={(e) => update({ link: e.target.value })}
              placeholder="https://sukabumikota.bps.go.id/..."
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="pub-title" className={LABEL_CLASS}>
              Judul Bingkai (Opsional)
            </label>
            <input
              id="pub-title"
              type="text"
              value={pub.title ?? ''}
              onChange={(e) => update({ title: e.target.value || undefined })}
              placeholder="Kosongkan untuk tampil tanpa judul bingkai"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
