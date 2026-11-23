'use client'

import { useState } from 'react'
import { Plus, Shield } from 'lucide-react'
import type { MeaningItem } from '@/lib/profile-pages/types'
import {
  ReorderDeleteButtons,
  moveItem,
  type NotifyFn,
} from '@/app/(admin)/admin/pengaturan/tabs/shared'
import ProfileImageField from './ProfileImageField'
import {
  PROFILE_CARD_CLASS,
  PROFILE_CARD_HEADER_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
  ProfileConfirmDeleteModal,
} from './profileEditorStyles'

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
    <section className={PROFILE_CARD_CLASS}>
      <div className={PROFILE_CARD_HEADER_CLASS}>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
            <Shield size={16} className="text-[#159447]" aria-hidden="true" />
            Arti &amp; Makna Elemen Lambang ({items.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Daftar elemen filosofis yang ditampilkan pada carousel halaman Lambang Kota Sukabumi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] active:scale-[0.99] transition-all cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Elemen
        </button>
      </div>

      <div className="p-5">
        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-xs text-[#566276]">
            Belum ada elemen lambang. Klik Tambah Elemen untuk menambahkan.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200/80 bg-[#f8fafc]/60 p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <span className="inline-flex items-center rounded-full bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-0.5 text-[11px] font-bold text-[#159447]">
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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-4">
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
                  <div className="md:col-span-8 space-y-3.5">
                    <div>
                      <label
                        htmlFor={`meaning-item-${index}-title`}
                        className={PROFILE_LABEL_CLASS}
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
                        className={PROFILE_INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`meaning-item-${index}-desc`}
                        className={PROFILE_LABEL_CLASS}
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
                        className={PROFILE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProfileConfirmDeleteModal
        open={deleteIndex !== null}
        title="Konfirmasi Hapus Elemen"
        description="Apakah yakin ingin menghapus elemen lambang ini dari daftar?"
        itemLabel={itemToDelete?.title || `Elemen #${(deleteIndex ?? 0) + 1}`}
        previewSrc={itemToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
