'use client'

import { useState } from 'react'
import { Plus, Pencil, X, UserCheck, Users } from 'lucide-react'
import type {
  DeputyLeader,
  Leader,
  LeadersData,
} from '@/lib/profile-pages/types'
import {
  ReorderDeleteButtons,
  TooltipIconButton,
  moveItem,
  useEscapeClose,
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

function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface LeaderDraft {
  id: number
  slug: string
  name: string
  role: string
  period: string
  image: string
  bio: string
  fullBioText: string
  hasDeputy: boolean
  deputyName: string
  deputySlug: string
  deputyRole: string
  deputyImage: string
  deputyBio: string
  deputyFullBioText: string
}

function createDraftFromLeader(leader?: Leader, nextId?: number): LeaderDraft {
  if (!leader) {
    return {
      id: nextId ?? Date.now(),
      slug: '',
      name: '',
      role: 'Wali Kota, Kota Sukabumi',
      period: '',
      image: '/images/walikota/siluet.jpg',
      bio: '',
      fullBioText: '',
      hasDeputy: false,
      deputyName: '',
      deputySlug: '',
      deputyRole: 'Wakil Wali Kota',
      deputyImage: '/images/walikota/siluet.jpg',
      deputyBio: '',
      deputyFullBioText: '',
    }
  }

  return {
    id: leader.id,
    slug: leader.slug,
    name: leader.name,
    role: leader.role,
    period: leader.period,
    image: leader.image,
    bio: leader.bio,
    fullBioText: (leader.fullBio ?? []).join('\n\n'),
    hasDeputy: Boolean(leader.deputy),
    deputyName: leader.deputy?.name ?? '',
    deputySlug: leader.deputy?.slug ?? '',
    deputyRole: leader.deputy?.role ?? 'Wakil Wali Kota',
    deputyImage: leader.deputy?.image ?? '/images/walikota/siluet.jpg',
    deputyBio: leader.deputy?.bio ?? '',
    deputyFullBioText: (leader.deputy?.fullBio ?? []).join('\n\n'),
  }
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function LeadersEditor({
  value,
  onChange,
  onNotify,
}: {
  value: LeadersData | undefined
  onChange: (next: LeadersData) => void
  onNotify: NotifyFn
}) {
  const data: LeadersData = value ?? {
    title: 'Nama-Nama Pimpinan Pemerintahan Daerah',
    items: [],
  }

  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null)
  const [draft, setDraft] = useState<LeaderDraft | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [confirmClearDeputy, setConfirmClearDeputy] = useState(false)

  const closeEditorModal = () => {
    setEditingIndex(null)
    setDraft(null)
    setConfirmClearDeputy(false)
  }

  useEscapeClose(editingIndex !== null, closeEditorModal)

  const openNewModal = () => {
    const maxId = data.items.reduce((acc, item) => Math.max(acc, item.id), 0)
    setDraft(createDraftFromLeader(undefined, maxId + 1))
    setEditingIndex('new')
  }

  const openEditModal = (index: number) => {
    const item = data.items[index]
    if (!item) return
    setDraft(createDraftFromLeader(item))
    setEditingIndex(index)
  }

  const handleSaveDraft = () => {
    if (!draft) return
    const trimmedName = draft.name.trim()
    if (!trimmedName) {
      onNotify('error', 'Nama tokoh pimpinan wajib diisi.')
      return
    }
    if (!draft.period.trim()) {
      onNotify('error', 'Periode jabatan wajib diisi.')
      return
    }

    const resolvedSlug = draft.slug.trim() || slugifyName(trimmedName)
    if (!resolvedSlug) {
      onNotify('error', 'Slug tokoh tidak valid.')
      return
    }

    const fullBio = splitParagraphs(draft.fullBioText)
    let deputy: DeputyLeader | undefined
    if (draft.hasDeputy && draft.deputyName.trim()) {
      const deputyFullBio = splitParagraphs(draft.deputyFullBioText)
      deputy = {
        name: draft.deputyName.trim(),
        slug:
          draft.deputySlug.trim() || slugifyName(draft.deputyName.trim()),
        role: draft.deputyRole.trim() || 'Wakil Wali Kota',
        image: draft.deputyImage.trim() || '/images/walikota/siluet.jpg',
        bio: draft.deputyBio.trim(),
        ...(deputyFullBio.length > 0 ? { fullBio: deputyFullBio } : {}),
      }
    }

    const nextLeader: Leader = {
      id: draft.id,
      slug: resolvedSlug,
      name: trimmedName,
      role: draft.role.trim() || 'Wali Kota',
      period: draft.period.trim(),
      image: draft.image.trim() || '/images/walikota/siluet.jpg',
      bio: draft.bio.trim(),
      ...(fullBio.length > 0 ? { fullBio } : {}),
      ...(deputy ? { deputy } : {}),
    }

    if (editingIndex === 'new') {
      onChange({
        ...data,
        items: [...data.items, nextLeader],
      })
      onNotify(
        'success',
        `Tokoh "${nextLeader.name}" ditambahkan. Klik Simpan Perubahan untuk menyimpan ke database.`
      )
    } else if (typeof editingIndex === 'number') {
      onChange({
        ...data,
        items: data.items.map((item, idx) =>
          idx === editingIndex ? nextLeader : item
        ),
      })
      onNotify(
        'success',
        `Data tokoh "${nextLeader.name}" diperbarui. Klik Simpan Perubahan untuk menyimpan.`
      )
    }

    closeEditorModal()
  }

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return
    const removed = data.items[deleteIndex]
    onChange({
      ...data,
      items: data.items.filter((_, idx) => idx !== deleteIndex),
    })
    setDeleteIndex(null)
    onNotify(
      'success',
      `Tokoh "${removed?.name || ''}" dihapus dari daftar. Klik Simpan Perubahan untuk menerapkan.`
    )
  }

  const leaderToDelete =
    deleteIndex !== null ? data.items[deleteIndex] : undefined

  return (
    <section className={PROFILE_CARD_CLASS}>
      <div className={PROFILE_CARD_HEADER_CLASS}>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#172135]">
            <Users size={16} className="text-[#159447]" aria-hidden="true" />
            Daftar Pimpinan / Wali Kota ({data.items.length})
          </h2>
          <p className="text-xs text-[#566276] mt-0.5">
            Tokoh yang ditambahkan atau diedit di sini otomatis sinkron ke galeri dan halaman biografi detail.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f7a36] active:scale-[0.99] transition-all cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah Pimpinan
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <label htmlFor="leaders-section-title" className={PROFILE_LABEL_CLASS}>
            Judul Seksi Pimpinan
          </label>
          <input
            id="leaders-section-title"
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Nama-Nama Pimpinan Pemerintahan Daerah"
            className={PROFILE_INPUT_CLASS}
          />
        </div>

        {data.items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-xs text-[#566276]">
            Belum ada data pimpinan. Klik Tambah Pimpinan untuk menambahkan.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden bg-white">
            {data.items.map((leader, index) => (
              <li
                key={`${leader.id}-${leader.slug}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <img
                      src={leader.image || '/images/walikota/siluet.jpg'}
                      alt={leader.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#172135] truncate">
                        {leader.name}
                      </span>
                      <span className="rounded-full bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-0.5 text-[11px] font-semibold text-[#159447]">
                        {leader.period}
                      </span>
                      {leader.deputy && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          <UserCheck size={12} aria-hidden="true" />
                          + Wakil
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#566276] truncate mt-0.5">
                      {leader.role} ·{' '}
                      <span className="font-mono text-[11px]">
                        /sejarah/pemimpin/{leader.slug}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <TooltipIconButton
                    label={`Edit ${leader.name}`}
                    ariaLabel={`Edit ${leader.name}`}
                    onClick={() => openEditModal(index)}
                  >
                    <Pencil size={15} />
                  </TooltipIconButton>
                  <ReorderDeleteButtons
                    index={index}
                    total={data.items.length}
                    noun="pimpinan"
                    onMove={(dir) =>
                      onChange({
                        ...data,
                        items: moveItem(data.items, index, dir),
                      })
                    }
                    onDelete={() => setDeleteIndex(index)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Tambah / Edit Pimpinan */}
      {editingIndex !== null && draft && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditorModal()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leader-modal-title"
        >
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 shrink-0">
              <div>
                <h3
                  id="leader-modal-title"
                  className="text-lg font-bold text-[#172135]"
                >
                  {editingIndex === 'new'
                    ? 'Tambah Tokoh Pimpinan'
                    : `Edit Tokoh: ${draft.name}`}
                </h3>
                <p className="text-xs text-[#566276]">
                  Lengkapi biodata Wali Kota dan opsional Wakil Wali Kota.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditorModal}
                aria-label="Tutup modal tokoh"
                className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-4">
                  <ProfileImageField
                    id="leader-draft-image"
                    label="Foto Pimpinan"
                    value={draft.image}
                    onChange={(url) =>
                      setDraft((prev) => (prev ? { ...prev, image: url } : prev))
                    }
                    onNotify={onNotify}
                    aspectClass="aspect-[3/4]"
                    fit="cover"
                    emptyText="Belum ada foto"
                  />
                </div>

                <div className="md:col-span-8 space-y-3.5">
                  <div>
                    <label
                      htmlFor="leader-draft-name"
                      className={PROFILE_LABEL_CLASS}
                    >
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="leader-draft-name"
                      type="text"
                      value={draft.name}
                      onChange={(e) => {
                        const nextName = e.target.value
                        setDraft((prev) => {
                          if (!prev) return prev
                          const prevAuto = slugifyName(prev.name)
                          const shouldAutoSlug =
                            !prev.slug || prev.slug === prevAuto
                          return {
                            ...prev,
                            name: nextName,
                            slug: shouldAutoSlug
                              ? slugifyName(nextName)
                              : prev.slug,
                          }
                        })
                      }}
                      placeholder="H. Ayep Zaki, S.E., M.M."
                      className={PROFILE_INPUT_CLASS}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="leader-draft-slug"
                        className={PROFILE_LABEL_CLASS}
                      >
                        Slug URL
                      </label>
                      <input
                        id="leader-draft-slug"
                        type="text"
                        value={draft.slug}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev ? { ...prev, slug: e.target.value } : prev
                          )
                        }
                        placeholder="otomatis-dari-nama"
                        className={`${PROFILE_INPUT_CLASS} font-mono text-xs`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="leader-draft-period"
                        className={PROFILE_LABEL_CLASS}
                      >
                        Periode Jabatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="leader-draft-period"
                        type="text"
                        value={draft.period}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev ? { ...prev, period: e.target.value } : prev
                          )
                        }
                        placeholder="2025 - 2030"
                        className={PROFILE_INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="leader-draft-role"
                      className={PROFILE_LABEL_CLASS}
                    >
                      Jabatan / Gelar Status
                    </label>
                    <input
                      id="leader-draft-role"
                      type="text"
                      value={draft.role}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev ? { ...prev, role: e.target.value } : prev
                        )
                      }
                      placeholder="Wali Kota, Kota Sukabumi"
                      className={PROFILE_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="leader-draft-bio"
                  className={PROFILE_LABEL_CLASS}
                >
                  Biografi Singkat (Tampil di Galeri)
                </label>
                <textarea
                  id="leader-draft-bio"
                  rows={2}
                  value={draft.bio}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, bio: e.target.value } : prev
                    )
                  }
                  placeholder="Ringkasan kiprah pimpinan..."
                  className={PROFILE_INPUT_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor="leader-draft-fullbio"
                  className={PROFILE_LABEL_CLASS}
                >
                  Biografi Lengkap (Pisahkan Paragraf dengan Baris Kosong)
                </label>
                <textarea
                  id="leader-draft-fullbio"
                  rows={5}
                  value={draft.fullBioText}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, fullBioText: e.target.value } : prev
                    )
                  }
                  placeholder="Paragraf pertama biografi...\n\nParagraf kedua biografi..."
                  className={PROFILE_INPUT_CLASS}
                />
              </div>

              {/* Bagian Opsional Wakil Wali Kota */}
              <div className="rounded-xl border border-slate-200/80 bg-[#f8fafc] p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#172135]">
                      Wakil Wali Kota (Opsional)
                    </p>
                    <p className="text-[11px] text-[#566276]">
                      Aktifkan jika periode ini memiliki data Wakil Wali Kota.
                    </p>
                  </div>
                  {!draft.hasDeputy ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) =>
                          prev ? { ...prev, hasDeputy: true } : prev
                        )
                      }
                      className="rounded-xl border border-[#159447]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#159447] hover:bg-[#f0fdf4] transition-colors cursor-pointer min-h-[40px]"
                    >
                      + Tambah Wakil
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearDeputy(true)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer min-h-[40px]"
                    >
                      Hapus Data Wakil
                    </button>
                  )}
                </div>

                {draft.hasDeputy && (
                  <div className="space-y-3.5 pt-3 border-t border-slate-200/80">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-4">
                        <ProfileImageField
                          id="leader-deputy-image"
                          label="Foto Wakil"
                          value={draft.deputyImage}
                          onChange={(url) =>
                            setDraft((prev) =>
                              prev ? { ...prev, deputyImage: url } : prev
                            )
                          }
                          onNotify={onNotify}
                          aspectClass="aspect-[3/4]"
                          fit="cover"
                          emptyText="Belum ada foto"
                        />
                      </div>
                      <div className="md:col-span-8 space-y-3">
                        <div>
                          <label
                            htmlFor="leader-deputy-name"
                            className={PROFILE_LABEL_CLASS}
                          >
                            Nama Wakil
                          </label>
                          <input
                            id="leader-deputy-name"
                            type="text"
                            value={draft.deputyName}
                            onChange={(e) => {
                              const nextName = e.target.value
                              setDraft((prev) => {
                                if (!prev) return prev
                                const prevAuto = slugifyName(prev.deputyName)
                                const shouldAuto =
                                  !prev.deputySlug ||
                                  prev.deputySlug === prevAuto
                                return {
                                  ...prev,
                                  deputyName: nextName,
                                  deputySlug: shouldAuto
                                    ? slugifyName(nextName)
                                    : prev.deputySlug,
                                }
                              })
                            }}
                            placeholder="Bobby Maulana"
                            className={PROFILE_INPUT_CLASS}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="leader-deputy-slug"
                              className={PROFILE_LABEL_CLASS}
                            >
                              Slug URL Wakil
                            </label>
                            <input
                              id="leader-deputy-slug"
                              type="text"
                              value={draft.deputySlug}
                              onChange={(e) =>
                                setDraft((prev) =>
                                  prev
                                    ? { ...prev, deputySlug: e.target.value }
                                    : prev
                                )
                              }
                              placeholder="bobby-maulana"
                              className={`${PROFILE_INPUT_CLASS} font-mono text-xs`}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="leader-deputy-role"
                              className={PROFILE_LABEL_CLASS}
                            >
                              Jabatan Wakil
                            </label>
                            <input
                              id="leader-deputy-role"
                              type="text"
                              value={draft.deputyRole}
                              onChange={(e) =>
                                setDraft((prev) =>
                                  prev
                                    ? { ...prev, deputyRole: e.target.value }
                                    : prev
                                )
                              }
                              placeholder="Wakil Wali Kota"
                              className={PROFILE_INPUT_CLASS}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="leader-deputy-bio"
                        className={PROFILE_LABEL_CLASS}
                      >
                        Biografi Singkat Wakil
                      </label>
                      <textarea
                        id="leader-deputy-bio"
                        rows={2}
                        value={draft.deputyBio}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev ? { ...prev, deputyBio: e.target.value } : prev
                          )
                        }
                        className={PROFILE_INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="leader-deputy-fullbio"
                        className={PROFILE_LABEL_CLASS}
                      >
                        Biografi Lengkap Wakil (Pisahkan Paragraf dengan Baris Kosong)
                      </label>
                      <textarea
                        id="leader-deputy-fullbio"
                        rows={3}
                        value={draft.deputyFullBioText}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev
                              ? { ...prev, deputyFullBioText: e.target.value }
                              : prev
                          )
                        }
                        className={PROFILE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
              <button
                type="button"
                onClick={closeEditorModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-xl bg-[#159447] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0f7a36] active:scale-[0.99] transition-all cursor-pointer min-h-[44px]"
              >
                Terapkan Tokoh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus Tokoh dari Daftar */}
      <ProfileConfirmDeleteModal
        open={deleteIndex !== null}
        title="Konfirmasi Hapus Tokoh"
        description="Apakah yakin ingin menghapus tokoh ini dari daftar Pimpinan Pemerintahan Daerah?"
        itemLabel={leaderToDelete?.name || undefined}
        previewSrc={leaderToDelete?.image || undefined}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Konfirmasi Hapus Data Wakil di Dalam Modal Edit (Bertingkat) */}
      <ProfileConfirmDeleteModal
        open={confirmClearDeputy}
        title="Hapus Data Wakil Wali Kota?"
        description="Data Wakil Wali Kota pada periode ini akan dikosongkan."
        itemLabel={draft?.deputyName || undefined}
        onCancel={() => setConfirmClearDeputy(false)}
        onConfirm={() => {
          setDraft((prev) =>
            prev
              ? {
                  ...prev,
                  hasDeputy: false,
                  deputyName: '',
                  deputySlug: '',
                  deputyBio: '',
                  deputyFullBioText: '',
                }
              : prev
          )
          setConfirmClearDeputy(false)
        }}
      />
    </section>
  )
}
