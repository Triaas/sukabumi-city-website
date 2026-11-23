'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MeaningItem } from '@/lib/profile-pages/types'
import {
  ConfirmDeleteModal,
  ReorderDeleteButtons,
  moveItem,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'

export default function MeaningItemsEditor({
  items,
  onChange,
  onNotify,
}: {
  items: MeaningItem[]
  onChange: (next: MeaningItem[]) => void
  onNotify: NotifyFn
}) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const updateItem = (index: number, patch: Partial<MeaningItem>) => {
    onChange(
      items.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    )
  }

  const handleAdd = () => {
    onChange([...items, { title: '', desc: '', image: '' }])
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    onChange(items.filter((_, idx) => idx !== deleteIndex))
    setDeleteIndex(null)
    onNotify(
      'success',
      'Elemen lambang dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const itemToDelete = deleteIndex !== null ? items[deleteIndex] : undefined

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Arti &amp; Makna Elemen Lambang ({items.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Daftar elemen filosofis yang ditampilkan pada carousel halaman Lambang Kota Sukabumi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] transition-colors cursor-pointer min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Elemen
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-xs text-[#566276]">
          Belum ada elemen lambang. Klik Tambah Elemen untuk menambahkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-bold text-[#159447]">
                  Elemen #{index + 1}
                </span>
                <ReorderDeleteButtons
                  index={index}
                  total={items.length}
                  noun="elemen lambang"
                  onMove={(dir) => onChange(moveItem(items, index, dir))}
                  onDelete={() => setDeleteIndex(index)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div className="sm:col-span-5">
                  <ProfileImageField
                    id={`meaning-item-${index}-img`}
                    label="Ikon Elemen"
                    value={item.image ?? ''}
                    onChange={(url) => updateItem(index, { image: url })}
                    onNotify={onNotify}
                    aspectClass="aspect-square"
                    fit="contain"
                    emptyText="Belum ada ikon"
                    allowClear
                  />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <div>
                    <label
                      htmlFor={`meaning-item-${index}-title`}
                      className={LABEL_CLASS}
                    >
                      Judul Elemen
                    </label>
                    <input
                      id={`meaning-item-${index}-title`}
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateItem(index, { title: e.target.value })
                      }
                      placeholder="Perisai"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`meaning-item-${index}-desc`}
                      className={LABEL_CLASS}
                    >
                      Makna Filosofis
                    </label>
                    <textarea
                      id={`meaning-item-${index}-desc`}
                      rows={4}
                      value={item.desc}
                      onChange={(e) =>
                        updateItem(index, { desc: e.target.value })
                      }
                      placeholder="Jelaskan makna elemen lambang..."
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title={`Hapus Elemen #${(deleteIndex ?? 0) + 1}?`}
        description={`Elemen "${
          itemToDelete?.title || 'tanpa judul'
        }" akan dihapus dari daftar makna lambang.`}
        previewSrc={itemToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
