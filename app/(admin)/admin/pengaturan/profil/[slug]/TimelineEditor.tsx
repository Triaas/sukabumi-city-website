'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { TimelineData, TimelineItem } from '@/lib/profile-pages/types'
import {
  ConfirmDeleteModal,
  ReorderDeleteButtons,
  moveItem,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'

export default function TimelineEditor({
  value,
  onChange,
  onNotify,
}: {
  value: TimelineData | undefined
  onChange: (next: TimelineData) => void
  onNotify: NotifyFn
}) {
  const data: TimelineData = value ?? {
    title: 'Perkembangan Nomenklatur Kota Sukabumi',
    items: [],
  }

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const updateItem = (index: number, patch: Partial<TimelineItem>) => {
    onChange({
      ...data,
      items: data.items.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item
      ),
    })
  }

  const handleAdd = () => {
    onChange({
      ...data,
      items: [
        ...data.items,
        { period: '', title: '', badge: '', description: '' },
      ],
    })
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    onChange({
      ...data,
      items: data.items.filter((_, idx) => idx !== deleteIndex),
    })
    setDeleteIndex(null)
    onNotify(
      'success',
      'Periode nomenklatur dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const itemToDelete = deleteIndex !== null ? data.items[deleteIndex] : undefined

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Timeline Nomenklatur ({data.items.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Daftar linimasa perubahan status dan nomenklatur Kota Sukabumi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Periode
        </button>
      </div>

      <div>
        <label htmlFor="timeline-section-title" className={LABEL_CLASS}>
          Judul Seksi Timeline
        </label>
        <input
          id="timeline-section-title"
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Perkembangan Nomenklatur Kota Sukabumi"
          className={INPUT_CLASS}
        />
      </div>

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-xs text-[#566276]">
          Belum ada periode nomenklatur. Klik Tambah Periode untuk menambahkan.
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                  Periode #{index + 1}
                </span>
                <ReorderDeleteButtons
                  index={index}
                  total={data.items.length}
                  noun="periode"
                  onMove={(dir) =>
                    onChange({
                      ...data,
                      items: moveItem(data.items, index, dir),
                    })
                  }
                  onDelete={() => setDeleteIndex(index)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor={`timeline-${index}-period`}
                    className={LABEL_CLASS}
                  >
                    Periode Tahun
                  </label>
                  <input
                    id={`timeline-${index}-period`}
                    type="text"
                    value={item.period}
                    onChange={(e) =>
                      updateItem(index, { period: e.target.value })
                    }
                    placeholder="1914 - 1942"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`timeline-${index}-title`}
                    className={LABEL_CLASS}
                  >
                    Nama Nomenklatur
                  </label>
                  <input
                    id={`timeline-${index}-title`}
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      updateItem(index, { title: e.target.value })
                    }
                    placeholder="Gemeente Soeka Boemi"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`timeline-${index}-badge`}
                    className={LABEL_CLASS}
                  >
                    Dasar Hukum / Badge
                  </label>
                  <input
                    id={`timeline-${index}-badge`}
                    type="text"
                    value={item.badge}
                    onChange={(e) =>
                      updateItem(index, { badge: e.target.value })
                    }
                    placeholder="Staatsblad 1914 No. 310"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`timeline-${index}-desc`}
                  className={LABEL_CLASS}
                >
                  Uraian Singkat
                </label>
                <textarea
                  id={`timeline-${index}-desc`}
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                  placeholder="Ringkasan sejarah pada periode tersebut..."
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title={`Hapus Periode #${(deleteIndex ?? 0) + 1}?`}
        description={`Periode "${
          itemToDelete?.title || itemToDelete?.period || 'tanpa judul'
        }" akan dihapus dari linimasa nomenklatur.`}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
