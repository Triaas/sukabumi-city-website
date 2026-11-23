'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowLeft, X } from 'lucide-react'
import type {
  OpdSettings,
  OpdSubItem,
  OpdServiceGroup,
} from '@/lib/site-settings/types'
import {
  updateSiteSectionAction,
  resetSiteSectionAction,
} from '@/lib/site-settings/actions'
import {
  ConfirmDeleteModal,
  SaveResetBar,
  TooltipIconButton,
  useEscapeClose,
  INPUT_CLASS,
  LABEL_CLASS,
  type NotifyFn,
} from './shared'
import OpdItemsEditor, { countDescendants } from './opd/OpdItemsEditor'

interface SubEditorState {
  groupIndex: number
  path: number[]
}

function getItemsAtPath(root: OpdSubItem[], path: number[]): OpdSubItem[] {
  let current = root
  for (const index of path) {
    current = current[index]?.subItems ?? []
  }
  return current
}

function getTitlesAtPath(root: OpdSubItem[], path: number[]): string[] {
  const titles: string[] = []
  let current = root
  for (const index of path) {
    titles.push(current[index]?.title ?? '')
    current = current[index]?.subItems ?? []
  }
  return titles
}

function replaceItemsAtPath(
  root: OpdSubItem[],
  path: number[],
  next: OpdSubItem[]
): OpdSubItem[] {
  if (path.length === 0) return next
  const [head, ...rest] = path
  return root.map((item, i) =>
    i === head
      ? { ...item, subItems: replaceItemsAtPath(item.subItems ?? [], rest, next) }
      : item
  )
}

function findInvalidItem(items: OpdSubItem[], trail: string): string | null {
  for (const item of items) {
    if (!item.title.trim()) {
      return `Ada layanan tanpa nama di ${trail}.`
    }
    const nested = findInvalidItem(
      item.subItems ?? [],
      `${trail} / ${item.title.trim()}`
    )
    if (nested) return nested
  }
  return null
}

export default function OpdTab({
  initialData,
  onSaved,
  onNotify,
}: {
  initialData: OpdSettings
  onSaved: (data: OpdSettings) => void
  onNotify: NotifyFn
}) {
  const [formData, setFormData] = useState<OpdSettings>(initialData)
  const categoryKeys = Object.keys(formData.categories)
  const [activeCategory, setActiveCategory] = useState(categoryKeys[0] ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [subEditor, setSubEditor] = useState<SubEditorState | null>(null)
  const [deleteGroupIndex, setDeleteGroupIndex] = useState<number | null>(null)

  const groups: OpdServiceGroup[] =
    formData.categories[activeCategory]?.groups ?? []

  const setGroups = (nextGroups: OpdServiceGroup[]) => {
    setFormData((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: { groups: nextGroups },
      },
    }))
  }

  const setGroupItems = (groupIndex: number, items: OpdSubItem[]) => {
    setGroups(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)))
  }

  const subRoot = subEditor ? groups[subEditor.groupIndex]?.items ?? [] : []
  const subItems = subEditor ? getItemsAtPath(subRoot, subEditor.path) : []
  const subTitles = subEditor ? getTitlesAtPath(subRoot, subEditor.path) : []

  const handleSubBack = () => {
    setSubEditor((prev) => {
      if (!prev || prev.path.length <= 1) return null
      return { ...prev, path: prev.path.slice(0, -1) }
    })
  }

  useEscapeClose(subEditor !== null, handleSubBack)

  const handleSubItemsChange = (next: OpdSubItem[]) => {
    if (!subEditor) return
    setGroupItems(
      subEditor.groupIndex,
      replaceItemsAtPath(subRoot, subEditor.path, next)
    )
  }

  const handleConfirmDeleteGroup = () => {
    if (deleteGroupIndex === null) return
    setGroups(groups.filter((_, i) => i !== deleteGroupIndex))
    setDeleteGroupIndex(null)
    onNotify(
      'success',
      'Grup dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.'
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.heading.trim()) {
      onNotify('error', 'Judul section OPD tidak boleh kosong.')
      return
    }

    for (const [category, data] of Object.entries(formData.categories)) {
      for (const group of data.groups) {
        if (!group.title.trim()) {
          onNotify('error', `Kategori ${category}: judul grup wajib diisi.`)
          setActiveCategory(category)
          return
        }
        const invalid = findInvalidItem(group.items, `${category} / ${group.title}`)
        if (invalid) {
          onNotify('error', invalid)
          setActiveCategory(category)
          return
        }
      }
    }

    setIsSaving(true)
    const res = await updateSiteSectionAction('opd', formData)
    setIsSaving(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      onNotify('success', 'Pengaturan Daftar OPD berhasil disimpan.')
    } else {
      onNotify('error', res.error || 'Gagal menyimpan pengaturan Daftar OPD.')
    }
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    const res = await resetSiteSectionAction('opd')
    setIsResetting(false)

    if (res.success && res.data) {
      setFormData(res.data)
      onSaved(res.data)
      setSubEditor(null)
      setActiveCategory(Object.keys(res.data.categories)[0] ?? '')
      onNotify('success', 'Daftar OPD berhasil dikembalikan ke pengaturan awal.')
    } else {
      onNotify('error', res.error || 'Gagal mereset Daftar OPD.')
    }
  }

  const groupToDelete =
    deleteGroupIndex !== null ? groups[deleteGroupIndex] : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#172135]">
            Judul Section OPD
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Teks pengantar di atas direktori Organisasi Perangkat Daerah pada beranda.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="opd-heading" className={LABEL_CLASS}>
              Judul Section
            </label>
            <input
              id="opd-heading"
              type="text"
              value={formData.heading}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, heading: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="opd-subtitle" className={LABEL_CLASS}>
              Subjudul
            </label>
            <textarea
              id="opd-subtitle"
              rows={2}
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Pilih Kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((category) => {
            const total = formData.categories[category].groups.reduce(
              (sum, g) => sum + g.items.length,
              0
            )
            const isActive = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'border-[#159447] bg-[#159447] text-white'
                    : 'border-slate-200 bg-white text-[#172135] hover:bg-slate-50'
                }`}
              >
                {category}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                    isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {total}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group, groupIndex) => (
          <section
            key={groupIndex}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor={`opd-group-${groupIndex}-title`} className={LABEL_CLASS}>
                  Judul Grup
                </label>
                <input
                  id={`opd-group-${groupIndex}-title`}
                  type="text"
                  value={group.title}
                  onChange={(e) =>
                    setGroups(
                      groups.map((g, i) =>
                        i === groupIndex ? { ...g, title: e.target.value } : g
                      )
                    )
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <TooltipIconButton
                label="Hapus grup"
                ariaLabel={`Hapus grup ${group.title || groupIndex + 1}`}
                onClick={() => setDeleteGroupIndex(groupIndex)}
                align="right"
                danger
              >
                <Trash2 size={16} />
              </TooltipIconButton>
            </div>

            <OpdItemsEditor
              items={group.items}
              onChange={(items) => setGroupItems(groupIndex, items)}
              onManageChildren={(index) =>
                setSubEditor({ groupIndex, path: [index] })
              }
              onNotify={onNotify}
              idPrefix={`opd-${activeCategory.replace(/\s+/g, '-')}-${groupIndex}`}
              emptyMessage="Grup ini belum memiliki instansi. Di beranda tampil pesan daftar belum tersedia."
              addLabel="Tambah Instansi / Layanan"
            />
          </section>
        ))}

        <button
          type="button"
          onClick={() => setGroups([...groups, { title: '', items: [] }])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-[#172135] hover:bg-slate-50 cursor-pointer min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Grup pada Kategori {activeCategory}
        </button>
      </div>

      <SaveResetBar
        isSaving={isSaving}
        isResetting={isResetting}
        resetQuestion="Kembalikan seluruh Daftar OPD ke bawaan?"
        onConfirmReset={handleConfirmReset}
      />

      {subEditor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSubEditor(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="opd-sub-title"
        >
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0">
                {subEditor.path.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSubBack}
                    className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#159447] hover:underline cursor-pointer min-h-[32px]"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Kembali ke {subTitles[subTitles.length - 2]}
                  </button>
                )}
                <h3
                  id="opd-sub-title"
                  className="text-lg font-bold text-[#172135]"
                >
                  Sub-Layanan: {subTitles[subTitles.length - 1]}
                </h3>
                <p className="mt-0.5 truncate text-xs text-[#566276]">
                  {activeCategory} / {subTitles.join(' / ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubEditor(null)}
                aria-label="Tutup editor sub-layanan"
                className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <OpdItemsEditor
                key={subEditor.path.join('-')}
                items={subItems}
                onChange={handleSubItemsChange}
                onManageChildren={(index) =>
                  setSubEditor((prev) =>
                    prev ? { ...prev, path: [...prev.path, index] } : prev
                  )
                }
                onNotify={onNotify}
                idPrefix={`opd-sub-${subEditor.path.join('-')}`}
                emptyMessage="Belum ada sub-layanan. Layanan ini akan menjadi tautan langsung jika dikosongkan."
                addLabel="Tambah Sub-Layanan"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#566276]">
                Perubahan tersimpan ke database setelah menekan Simpan Perubahan di halaman utama.
              </p>
              <button
                type="button"
                onClick={() => setSubEditor(null)}
                className="rounded-xl bg-[#159447] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0f7a36] cursor-pointer min-h-[44px]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={deleteGroupIndex !== null}
        title="Hapus Grup?"
        description={`Grup "${groupToDelete?.title || 'tanpa judul'}" akan dihapus beserta ${countDescendants(
          groupToDelete?.items
        )} instansi dan sub-layanan di dalamnya.`}
        onCancel={() => setDeleteGroupIndex(null)}
        onConfirm={handleConfirmDeleteGroup}
      />
    </form>
  )
}
