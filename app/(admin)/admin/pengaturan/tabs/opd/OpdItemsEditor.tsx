'use client'

import { useState } from 'react'
import { Plus, Pencil, Layers, Building2 } from 'lucide-react'
import type { OpdSubItem } from '@/lib/site-settings/types'
import {
  ConfirmDeleteModal,
  ImageField,
  ReorderDeleteButtons,
  TooltipIconButton,
  createLocalId,
  moveItem,
  useEscapeClose,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from '../shared'

export function countDescendants(items: OpdSubItem[] | undefined): number {
  if (!items) return 0
  return items.reduce(
    (total, item) => total + 1 + countDescendants(item.subItems),
    0
  )
}

interface EditingState {
  index: number | null
  draft: OpdSubItem
}

function ItemEditModal({
  state,
  idPrefix,
  onNotify,
  onChangeDraft,
  onSave,
  onClose,
}: {
  state: EditingState
  idPrefix: string
  onNotify: NotifyFn
  onChangeDraft: (patch: Partial<OpdSubItem>) => void
  onSave: () => void
  onClose: () => void
}) {
  useEscapeClose(true, onClose)

  const isNew = state.index === null
  const hasChildren = (state.draft.subItems?.length ?? 0) > 0

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-edit-title`}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <h3
          id={`${idPrefix}-edit-title`}
          className="text-lg font-bold text-[#172135]"
        >
          {isNew ? 'Tambah Layanan Baru' : 'Edit Layanan'}
        </h3>

        <ImageField
          id={`${idPrefix}-edit-image`}
          label="Logo / Ikon"
          value={state.draft.image ?? ''}
          onChange={(url) => onChangeDraft({ image: url })}
          onNotify={onNotify}
          aspectClass="aspect-[16/7]"
          fit="contain"
          emptyText="Belum ada logo (tampil ikon bawaan)"
        />

        <div>
          <label htmlFor={`${idPrefix}-edit-name`} className={LABEL_CLASS}>
            Nama Instansi / Layanan
          </label>
          <input
            id={`${idPrefix}-edit-name`}
            type="text"
            value={state.draft.title}
            onChange={(e) => onChangeDraft({ title: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-edit-sub`} className={LABEL_CLASS}>
            Deskripsi Singkat
          </label>
          <input
            id={`${idPrefix}-edit-sub`}
            type="text"
            value={state.draft.subtitle}
            onChange={(e) => onChangeDraft({ subtitle: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-edit-href`} className={LABEL_CLASS}>
            URL Website Tujuan
          </label>
          <input
            id={`${idPrefix}-edit-href`}
            type="text"
            value={state.draft.href ?? ''}
            onChange={(e) => onChangeDraft({ href: e.target.value })}
            placeholder="https://"
            className={`${INPUT_CLASS} font-mono`}
          />
          {hasChildren && (
            <p className="mt-1 text-xs text-[#566276]">
              Layanan ini punya sub-layanan, sehingga saat diklik pengunjung membuka daftar sub-layanan dan URL ini tidak dipakai.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] hover:bg-slate-50 cursor-pointer min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-xl bg-[#159447] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0f7a36] cursor-pointer min-h-[44px]"
          >
            {isNew ? 'Tambahkan' : 'Terapkan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OpdItemsEditor({
  items,
  onChange,
  onManageChildren,
  onNotify,
  idPrefix,
  emptyMessage,
  addLabel,
}: {
  items: OpdSubItem[]
  onChange: (items: OpdSubItem[]) => void
  onManageChildren: (index: number) => void
  onNotify: NotifyFn
  idPrefix: string
  emptyMessage: string
  addLabel: string
}) {
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const openNew = () =>
    setEditing({
      index: null,
      draft: { id: createLocalId(), title: '', subtitle: '', href: '', image: '' },
    })

  const openEdit = (index: number) =>
    setEditing({ index, draft: { ...items[index] } })

  const handleSave = () => {
    if (!editing) return
    if (!editing.draft.title.trim()) {
      onNotify('error', 'Nama instansi atau layanan wajib diisi.')
      return
    }
    const draft = { ...editing.draft, title: editing.draft.title.trim() }
    if (editing.index === null) {
      onChange([...items, draft])
    } else {
      onChange(items.map((item, i) => (i === editing.index ? draft : item)))
    }
    setEditing(null)
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    onChange(items.filter((_, i) => i !== deleteIndex))
    setDeleteIndex(null)
    onNotify(
      'success',
      'Layanan dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const itemToDelete = deleteIndex !== null ? items[deleteIndex] : undefined
  const nestedCount = countDescendants(itemToDelete?.subItems)

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs font-medium text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-2.5 pt-1">
          {items.map((item, index) => {
            const childCount = item.subItems?.length ?? 0
            return (
              <li
                key={`${item.id}-${index}`}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={`Logo ${item.title}`}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2
                        size={20}
                        className="text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#172135]">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-[#566276]">
                      {item.subtitle || 'Tanpa deskripsi'}
                    </p>
                    {childCount === 0 && item.href && (
                      <p className="truncate font-mono text-[11px] text-slate-500">
                        {item.href}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0">
                  <button
                    type="button"
                    onClick={() => onManageChildren(index)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#159447]/40 bg-white px-3 text-xs font-semibold text-[#159447] hover:bg-green-50 cursor-pointer min-h-[44px]"
                  >
                    <Layers size={15} aria-hidden="true" />
                    Kelola Sub-Layanan
                    <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[11px]">
                      {childCount}
                    </span>
                  </button>
                  <TooltipIconButton
                    label="Edit layanan"
                    ariaLabel={`Edit ${item.title}`}
                    onClick={() => openEdit(index)}
                  >
                    <Pencil size={16} />
                  </TooltipIconButton>
                  <ReorderDeleteButtons
                    index={index}
                    total={items.length}
                    noun="layanan"
                    onMove={(direction) =>
                      onChange(moveItem(items, index, direction))
                    }
                    onDelete={() => setDeleteIndex(index)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={openNew}
        className="inline-flex items-center gap-2 rounded-xl border border-[#159447]/40 bg-green-50 px-4 py-2.5 text-xs font-bold text-[#159447] hover:bg-green-100 cursor-pointer min-h-[44px]"
      >
        <Plus size={16} aria-hidden="true" />
        {addLabel}
      </button>

      {editing && (
        <ItemEditModal
          state={editing}
          idPrefix={idPrefix}
          onNotify={onNotify}
          onChangeDraft={(patch) =>
            setEditing((prev) =>
              prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev
            )
          }
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title="Hapus Layanan?"
        description={`"${itemToDelete?.title ?? ''}" akan dihapus${
          nestedCount > 0
            ? ` beserta ${nestedCount} sub-layanan di dalamnya`
            : ''
        }.`}
        previewSrc={itemToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
