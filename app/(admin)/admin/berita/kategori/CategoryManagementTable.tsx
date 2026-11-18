'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Tags,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import type {
  CategoryWithCount,
  CategoryLinkedNewsItem,
} from '@/lib/berita/category';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  getCategoryLinkedNewsAction,
  reassignAndDeleteCategoryAction,
} from './actions';
import ToastNotification from '@/components/ToastNotification';

interface CategoryManagementTableProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoryManagementTable({
  initialCategories,
}: CategoryManagementTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal Tambah / Edit
  const [formModal, setFormModal] = useState<{
    mode: 'CREATE' | 'EDIT';
    category?: CategoryWithCount;
  } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modal Inspeksi & Pindahkan Kategori Terkunci
  const [inspectTarget, setInspectTarget] = useState<CategoryWithCount | null>(
    null
  );
  const [linkedNews, setLinkedNews] = useState<CategoryLinkedNewsItem[]>([]);
  const [isLoadingLinkedNews, setIsLoadingLinkedNews] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [reassignError, setReassignError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        if (formModal) {
          setFormModal(null);
          setModalError(null);
        }
        if (deleteTarget) {
          setDeleteTarget(null);
          setDeleteError(null);
        }
        if (inspectTarget) {
          setInspectTarget(null);
          setReassignError(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formModal, deleteTarget, inspectTarget, isPending]);

  const filteredCategories = initialCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const totalCategories = initialCategories.length;

  const openCreateModal = () => {
    setFeedback(null);
    setModalError(null);
    setNameInput('');
    setFormModal({ mode: 'CREATE' });
  };

  const openEditModal = (category: CategoryWithCount) => {
    setFeedback(null);
    setModalError(null);
    setNameInput(category.name);
    setFormModal({ mode: 'EDIT', category });
  };

  const openDeleteModal = (category: CategoryWithCount) => {
    if (category.raw_total_count > 0) return;
    setFeedback(null);
    setDeleteError(null);
    setDeleteTarget(category);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || !formModal) return;

    const trimmed = nameInput.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      setModalError('Nama kategori wajib diisi.');
      return;
    }
    if (trimmed.length > 30) {
      setModalError('Nama kategori tidak boleh melebihi 30 karakter.');
      return;
    }

    setModalError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', trimmed);

      const res =
        formModal.mode === 'CREATE'
          ? await createCategoryAction(formData)
          : await updateCategoryAction(formModal.category!.id, formData);

      if (!res.success) {
        setModalError(res.error || 'Gagal menyimpan kategori.');
        return;
      }

      const successText =
        formModal.mode === 'CREATE'
          ? `Kategori "${trimmed}" berhasil ditambahkan.`
          : `Kategori berhasil diperbarui menjadi "${trimmed}".`;

      setFormModal(null);
      setNameInput('');
      setFeedback({ type: 'success', message: successText });
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (isPending || !deleteTarget) return;
    setDeleteError(null);

    startTransition(async () => {
      const res = await deleteCategoryAction(deleteTarget.id);

      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus kategori.');
        return;
      }

      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setFeedback({
        type: 'success',
        message: `Kategori "${deletedName}" berhasil dihapus.`,
      });
      router.refresh();
    });
  };

  const openInspectModal = (category: CategoryWithCount) => {
    setFeedback(null);
    setReassignError(null);
    setTargetCategoryId('');
    setLinkedNews([]);
    setInspectTarget(category);
    setIsLoadingLinkedNews(true);

    getCategoryLinkedNewsAction(category.id)
      .then((items) => {
        setLinkedNews(items);
      })
      .catch(() => {
        setReassignError('Gagal memuat daftar berita terkait.');
      })
      .finally(() => {
        setIsLoadingLinkedNews(false);
      });
  };

  const handleReassignAndDelete = () => {
    if (isPending || !inspectTarget || !targetCategoryId) return;
    setReassignError(null);

    const parsedTargetId = Number(targetCategoryId);
    if (!Number.isFinite(parsedTargetId) || parsedTargetId <= 0) {
      setReassignError('Silakan pilih kategori pengganti terlebih dahulu.');
      return;
    }

    startTransition(async () => {
      const res = await reassignAndDeleteCategoryAction(
        inspectTarget.id,
        parsedTargetId
      );

      if (!res.success) {
        setReassignError(
          res.error || 'Gagal memindahkan berita dan menghapus kategori.'
        );
        return;
      }

      const oldName = inspectTarget.name;
      const newName = res.category?.name || 'kategori tujuan';
      const moved = res.movedCount ?? inspectTarget.raw_total_count;

      setInspectTarget(null);
      setTargetCategoryId('');
      setLinkedNews([]);
      setFeedback({
        type: 'success',
        message: `${moved} berita dipindahkan ke "${newName}" dan kategori "${oldName}" berhasil dihapus.`,
      });
      router.refresh();
    });
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* 1. HEADER & TOMBOL AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Link
              href="/admin/berita"
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#159447] transition-colors"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              Kelola Berita
            </Link>
            <span className="text-[11px] font-semibold text-slate-300">/</span>
            <span className="text-[11px] font-semibold text-slate-600">
              Master Kategori
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
            Manajemen Kategori Berita
          </h1>
          <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed mt-1">
            Kelola daftar master kategori berita portal Pemerintah Kota Sukabumi. Kategori yang sedang digunakan oleh naskah berita tidak dapat dihapus.
          </p>
        </div>

        <div className="flex items-center shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
            style={{ backgroundColor: '#159447' }}
          >
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* NOTIFIKASI POP-UP TOAST */}
      <ToastNotification
        message={feedback?.message}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

      {/* 2. RINGKASAN SINGKAT & PENCARIAN */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[#172135] text-xs font-semibold">
              <Tags size={13} className="text-[#159447]" aria-hidden="true" />
              Total: {totalCategories} Kategori
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kategori..."
              aria-label="Cari nama kategori"
              className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* 3. TABEL MASTER KATEGORI */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">No</th>
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4 w-24 text-center">Total</th>
                <th className="py-3 px-4 w-28 text-center">Diterbitkan</th>
                <th className="py-3 px-4 w-28 text-center">Draf / Peninjauan</th>
                <th className="py-3 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, idx) => {
                  const isLocked = cat.raw_total_count > 0;
                  const lockReason =
                    cat.raw_total_count > cat.total_count
                      ? 'Terkunci: Masih digunakan oleh draf pribadi reporter.'
                      : 'Terkunci: Masih digunakan oleh naskah berita aktif.';
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#12803d] border border-[#bbf7d0]">
                            #{cat.name.replace(/\s+/g, '')}
                          </span>
                          <span className="font-bold text-[#172135] text-sm">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {cat.total_count > 0 ? (
                            <Link
                              href={`/admin/berita?category=${encodeURIComponent(cat.name)}`}
                              title={`Lihat ${cat.total_count} berita di Kelola Berita`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-[#172135] transition-colors"
                            >
                              <span>{cat.total_count}</span>
                              <ExternalLink size={10} aria-hidden="true" />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                              0
                            </span>
                          )}
                          {cat.raw_total_count > cat.total_count && (
                            <span className="text-[10px] font-medium text-amber-700">
                              +{cat.raw_total_count - cat.total_count} draf reporter
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {cat.published_count > 0 ? (
                          <Link
                            href={`/admin/berita?category=${encodeURIComponent(cat.name)}&status=PUBLISHED`}
                            title={`Lihat ${cat.published_count} berita diterbitkan`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-[#12803d] border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            <span>{cat.published_count}</span>
                            <ExternalLink size={10} aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-[#12803d] border border-green-200">
                            0
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {cat.draft_count > 0 ? (
                          <Link
                            href={`/admin/berita?category=${encodeURIComponent(cat.name)}`}
                            title={`Lihat ${cat.draft_count} draf / peninjauan`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            <span>{cat.draft_count}</span>
                            <ExternalLink size={10} aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            0
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            title={`Edit kategori ${cat.name}`}
                            aria-label={`Edit kategori ${cat.name}`}
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#159447] hover:border-[#bbf7d0] hover:bg-[#f0fdf4] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>

                          {isLocked ? (
                            <button
                              type="button"
                              onClick={() => openInspectModal(cat)}
                              title={`${lockReason} Klik untuk lihat berita atau pindahkan kategori.`}
                              aria-label={`Kelola berita terkait kategori ${cat.name}`}
                              className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Lock size={13} aria-hidden="true" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(cat)}
                              title={`Hapus kategori ${cat.name}`}
                              aria-label={`Hapus kategori ${cat.name}`}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Tags size={18} aria-hidden="true" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">
                        {searchQuery.trim()
                          ? `Kategori "${searchQuery.trim()}" tidak ditemukan.`
                          : 'Belum ada kategori yang terdaftar di database.'}
                      </p>
                      {!searchQuery.trim() && (
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="text-xs font-semibold text-[#159447] hover:text-[#12803d] underline cursor-pointer"
                        >
                          Tambah kategori pertama
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT KATEGORI */}
      {formModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => {
            if (!isPending) {
              setFormModal(null);
              setModalError(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#159447] flex items-center justify-center">
                  <Tags size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172135]">
                    {formModal.mode === 'CREATE'
                      ? 'Tambah Kategori Baru'
                      : 'Edit Nama Kategori'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Maksimal 30 karakter dan bebas duplikat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setFormModal(null);
                  setModalError(null);
                }}
                aria-label="Tutup dialog"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="category-name-input"
                    className="text-xs font-bold text-[#172135]"
                  >
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-medium ${
                      nameInput.trim().length > 25
                        ? 'text-amber-600 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {nameInput.trim().length} / 30
                  </span>
                </div>
                <input
                  id="category-name-input"
                  type="text"
                  maxLength={30}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Contoh: Layanan Digital"
                  autoFocus
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#172135] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#159447]/20 focus:border-[#159447] transition-all"
                />
              </div>

              {modalError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  <AlertCircle
                    size={14}
                    className="shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setFormModal(null);
                    setModalError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isPending ||
                    !nameInput.trim() ||
                    nameInput.trim().length > 30
                  }
                  className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#159447' }}
                >
                  {isPending ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>
                      {formModal.mode === 'CREATE'
                        ? 'Simpan Kategori'
                        : 'Simpan Perubahan'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KATEGORI */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => {
            if (!isPending) {
              setDeleteTarget(null);
              setDeleteError(null);
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 text-red-600">
                <Trash2 className="h-6 w-6 stroke-[2]" aria-hidden="true" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                Konfirmasi Hapus Kategori
              </h3>

              <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                Apakah Anda yakin ingin menghapus kategori ini secara permanen?
              </p>

              <p className="mb-4 text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 w-full text-center">
                #{deleteTarget.name}
              </p>

              {deleteError && (
                <div className="mb-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-left">
                  <AlertCircle
                    size={14}
                    className="shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteError(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Tidak
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                >
                  {isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin text-white"
                        aria-hidden="true"
                      />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Ya, Hapus</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSPEKSI BERITA & PINDAHKAN KATEGORI TERKUNCI */}
      {inspectTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => {
            if (!isPending) {
              setInspectTarget(null);
              setReassignError(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172135]">
                    Kategori &ldquo;{inspectTarget.name}&rdquo; Masih Digunakan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Terikat pada {inspectTarget.raw_total_count} berita. Lihat daftarnya atau pindahkan semua ke kategori lain agar dapat dihapus.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setInspectTarget(null);
                  setReassignError(null);
                }}
                aria-label="Tutup dialog"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Bagian 1: Daftar Berita Terkait */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden flex flex-col min-h-0 mb-5">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-[#172135] flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-500" aria-hidden="true" />
                  Daftar Berita Terkait
                </span>
                {inspectTarget.total_count > 0 && (
                  <Link
                    href={`/admin/berita?category=${encodeURIComponent(inspectTarget.name)}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#159447] hover:text-[#12803d] hover:underline"
                  >
                    <span>Buka di Kelola Berita</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </Link>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {isLoadingLinkedNews ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    <span>Memuat daftar berita...</span>
                  </div>
                ) : linkedNews.length > 0 ? (
                  linkedNews.map((item) => {
                    const statusBadge = item.is_reporter_private_draft
                      ? {
                          label: 'Draf Pribadi Reporter',
                          cls: 'bg-slate-100 text-slate-700 border-slate-200',
                        }
                      : item.status === 'PUBLISHED'
                      ? {
                          label: 'Diterbitkan',
                          cls: 'bg-green-50 text-[#12803d] border-green-200',
                        }
                      : item.status === 'SUBMITTED'
                      ? {
                          label: 'Perlu Peninjauan',
                          cls: 'bg-blue-50 text-blue-700 border-blue-200',
                        }
                      : {
                          label: 'Draf',
                          cls: 'bg-amber-50 text-amber-700 border-amber-200',
                        };

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#172135] truncate">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.cls}`}
                            >
                              {statusBadge.label}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              oleh {item.author_name}
                            </span>
                            {item.other_categories.length > 0 && (
                              <span className="text-[11px] text-slate-500 truncate">
                                • Juga di: {item.other_categories.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {!item.is_reporter_private_draft && item.uuid && (
                          <Link
                            href={`/admin/berita/tambah?ref=${item.uuid}`}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors"
                          >
                            <Pencil size={11} aria-hidden="true" />
                            <span>Edit</span>
                          </Link>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Tidak ada berita yang ditemukan.
                  </div>
                )}
              </div>
            </div>

            {/* Bagian 2: Pindahkan Semua & Hapus Kategori */}
            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <ArrowRightLeft
                  size={16}
                  className="text-[#159447] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-xs font-bold text-[#172135]">
                    Pindahkan Semua Berita &amp; Hapus Kategori
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Pilih kategori pengganti di bawah ini. Seluruh berita (termasuk draf pribadi reporter) akan dipindahkan tanpa mengubah isi beritanya, lalu kategori <strong>{inspectTarget.name}</strong> langsung dihapus.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="target-category-select"
                  className="block text-[11px] font-bold text-[#172135] mb-1.5"
                >
                  Pindahkan semua berita ke kategori:
                </label>
                <select
                  id="target-category-select"
                  value={targetCategoryId}
                  onChange={(e) => {
                    setTargetCategoryId(e.target.value);
                    setReassignError(null);
                  }}
                  disabled={isPending}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#172135] focus:outline-none focus:ring-2 focus:ring-[#159447]/20 focus:border-[#159447]"
                >
                  <option value="">-- Pilih kategori pengganti --</option>
                  {initialCategories
                    .filter((c) => c.id !== inspectTarget.id)
                    .map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({c.total_count} berita)
                      </option>
                    ))}
                </select>
              </div>

              {targetCategoryId && (
                <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  {inspectTarget.raw_total_count} berita akan dipindahkan ke{' '}
                  <strong>
                    {initialCategories.find(
                      (c) => String(c.id) === targetCategoryId
                    )?.name ?? 'kategori tujuan'}
                  </strong>
                  , lalu kategori <strong>{inspectTarget.name}</strong> akan dihapus permanen.
                </div>
              )}

              {reassignError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  <AlertCircle size={14} className="shrink-0 text-red-500" aria-hidden="true" />
                  <span>{reassignError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setInspectTarget(null);
                    setReassignError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isPending || !targetCategoryId}
                  onClick={handleReassignAndDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      <span>Memindahkan &amp; Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft size={14} aria-hidden="true" />
                      <span>Pindahkan &amp; Hapus Kategori</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

