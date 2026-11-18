'use client'

import { useState, useMemo, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    PlusCircle,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    Undo2,
    X,
    Check,
    AlertCircle,
    CheckCircle2,
    UploadCloud,
    Link as LinkIcon,
    Image as ImageIcon,
    ExternalLink,
    Loader2,
    Send,
    Save,
} from 'lucide-react'
import {
    createBannerAction,
    updateBannerAction,
    deleteBannerAction,
    toggleBannerStatusAction,
    type BannerItem,
} from '@/lib/banner/actions'
import ToastNotification from '@/components/ToastNotification'
import ConfirmSaveDraftModal from '@/components/ConfirmSaveDraftModal'

export type { BannerItem }

const statusOptions = ['Semua Status', 'Aktif', 'Tidak Aktif']

const ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
]
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

type BannerFormData = {
    title: string
    imageUrl: string
    imagePreview: string
    targetUrl: string
    sortOrder: number
    isActive: boolean
}

export default function BannerClient({
    initialData,
}: {
    initialData: BannerItem[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [bannerList, setBannerList] = useState<BannerItem[]>(initialData)

    useEffect(() => {
        setBannerList(initialData)
    }, [initialData])

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [previewItem, setPreviewItem] = useState<BannerItem | null>(null)
    const [editingItem, setEditingItem] = useState<BannerItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<BannerItem | null>(null)
    const [unpublishingItem, setUnpublishingItem] = useState<BannerItem | null>(null)
    const [togglingId, setTogglingId] = useState<number | null>(null)
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
    const [editInitialSnapshot, setEditInitialSnapshot] = useState<{
        title: string
        imageUrl: string
        targetUrl: string
        sortOrder: number
    } | null>(null)

    // Feedback Toast
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    // Form State
    const [formData, setFormData] = useState<BannerFormData>({
        title: '',
        imageUrl: '',
        imagePreview: '',
        targetUrl: '',
        sortOrder: 1,
        isActive: true,
    })
    const [imageFileObj, setImageFileObj] = useState<File | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [titleError, setTitleError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)
    const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(
        null
    )

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const hasEditChanges = Boolean(
        editingItem &&
            editInitialSnapshot &&
            (formData.title !== editInitialSnapshot.title ||
                formData.targetUrl !== editInitialSnapshot.targetUrl ||
                formData.sortOrder !== editInitialSnapshot.sortOrder ||
                imageFileObj !== null ||
                formData.imageUrl !== editInitialSnapshot.imageUrl)
    )

    const requestCloseEditModal = () => {
        if (isPending) return
        if (hasEditChanges) {
            setIsExitConfirmOpen(true)
            return
        }
        setEditingItem(null)
        setEditInitialSnapshot(null)
    }

    const hasAddChanges = Boolean(
        isAddModalOpen &&
            (formData.title.trim().length > 0 ||
                formData.targetUrl.trim().length > 0 ||
                imageFileObj !== null ||
                formData.imagePreview.trim().length > 0)
    )

    const requestCloseAddModal = () => {
        if (isPending) return
        if (hasAddChanges) {
            setIsExitConfirmOpen(true)
            return
        }
        setIsAddModalOpen(false)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || isPending) return
            if (isExitConfirmOpen) setIsExitConfirmOpen(false)
            else if (unpublishingItem) setUnpublishingItem(null)
            else if (deletingItem) setDeletingItem(null)
            else if (previewItem) setPreviewItem(null)
            else if (editingItem) requestCloseEditModal()
            else if (isAddModalOpen) requestCloseAddModal()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [
        isPending,
        isExitConfirmOpen,
        unpublishingItem,
        deletingItem,
        previewItem,
        editingItem,
        isAddModalOpen,
        hasEditChanges,
        hasAddChanges,
    ])

    // Filter & Search Logic
    const filteredData = useMemo(() => {
        return bannerList.filter((item) => {
            const matchSearch = item.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            const matchStatus =
                statusFilter === 'Semua Status' ||
                (statusFilter === 'Aktif' && item.isActive) ||
                (statusFilter === 'Tidak Aktif' && !item.isActive)
            return matchSearch && matchStatus
        })
    }, [bannerList, searchTerm, statusFilter])

    // Pagination Logic
    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / rowsPerPage)
    )
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )
    const startItem =
        filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const endItem = Math.min(currentPage * rowsPerPage, filteredData.length)

    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7)
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        const pages: (number | '...')[] = []
        const left = Math.max(2, currentPage - 1)
        const right = Math.min(totalPages - 1, currentPage + 1)
        pages.push(1)
        if (left > 2) pages.push('...')
        for (let i = left; i <= right; i++) pages.push(i)
        if (right < totalPages - 1) pages.push('...')
        pages.push(totalPages)
        return pages
    }

    // Modal & Form Handlers
    const getNextSortOrder = () =>
        bannerList.length > 0
            ? Math.max(...bannerList.map((b) => b.sortOrder)) + 1
            : 1

    const openAddModal = () => {
        setFormData({
            title: '',
            imageUrl: '',
            imagePreview: '',
            targetUrl: '',
            sortOrder: getNextSortOrder(),
            isActive: true,
        })
        setImageFileObj(null)
        setFormError(null)
        setTitleError(null)
        setImageError(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: BannerItem) => {
        setIsExitConfirmOpen(false)
        setEditingItem(item)
        setEditInitialSnapshot({
            title: item.title,
            imageUrl: item.imageUrl,
            targetUrl: item.targetUrl,
            sortOrder: item.sortOrder,
        })
        setFormData({
            title: item.title,
            imageUrl: item.imageUrl,
            imagePreview: item.imageUrl,
            targetUrl: item.targetUrl,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
        })
        setImageFileObj(null)
        setFormError(null)
        setTitleError(null)
        setImageError(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleImageFile = (file: File) => {
        const mime = file.type.toLowerCase()
        const isAllowedExt = /\.(jpe?g|png|webp)$/i.test(file.name)
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime) && !isAllowedExt) {
            setImageError(true)
            setImageErrorMessage(
                'Format berkas gambar tidak didukung. Gunakan JPG, PNG, atau WebP.'
            )
            return
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setImageError(true)
            setImageErrorMessage(
                'Ukuran berkas gambar melebihi batas maksimal 5 MB.'
            )
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setImageFileObj(file)
        setImageError(false)
        setImageErrorMessage(null)
        setFormError(null)
        setFormData((prev) => ({
            ...prev,
            imageUrl: file.name,
            imagePreview: objectUrl,
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleImageFile(file)
    }

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleImageFile(file)
    }

    const buildValidatedPayload = (targetIsActive: boolean): FormData | null => {
        const isDraft = !targetIsActive
        const rawTitle = formData.title.trim()
        const trimmedTitle =
            rawTitle || (isDraft ? '(Draf Banner Tanpa Judul)' : '')
        const trimmedTarget = formData.targetUrl.trim()

        if (!isDraft) {
            let hasError = false
            if (!trimmedTitle) {
                setTitleError('Judul / deskripsi banner wajib diisi.')
                hasError = true
            } else {
                setTitleError(null)
            }

            if (!imageFileObj && !formData.imagePreview.trim()) {
                setImageError(true)
                setImageErrorMessage('Gambar banner wajib diunggah.')
                hasError = true
            } else {
                setImageError(false)
                setImageErrorMessage(null)
            }

            if (hasError) {
                setFormError(null)
                return null
            }
        }

        setTitleError(null)
        setImageError(false)
        setImageErrorMessage(null)
        setFormError(null)

        const payload = new FormData()
        payload.append('title', trimmedTitle)
        payload.append('target_url', trimmedTarget || '#')
        payload.append('sort_order', String(formData.sortOrder || 1))
        payload.append('is_active', String(targetIsActive))

        if (imageFileObj) {
            payload.append('image_file', imageFileObj)
        } else if (formData.imageUrl) {
            payload.append('existing_image_url', formData.imageUrl)
        }

        return payload
    }

    const handleSaveAdd = (targetIsActive: boolean) => {
        if (isPending) return

        const payload = buildValidatedPayload(targetIsActive)
        if (!payload) {
            setIsExitConfirmOpen(false)
            return
        }

        startTransition(async () => {
            const result = await createBannerAction(payload)
            if (!result.success) {
                setIsExitConfirmOpen(false)
                setFormError(
                    result.error || 'Gagal menyimpan banner baru.'
                )
                return
            }

            setIsExitConfirmOpen(false)
            setIsAddModalOpen(false)
            setFeedback({
                type: 'success',
                message: targetIsActive
                    ? 'Banner baru berhasil ditambahkan dan diterbitkan ke beranda.'
                    : 'Banner baru berhasil disimpan sebagai draf.',
            })
            router.refresh()
        })
    }

    const handleSaveEdit = (targetIsActive: boolean) => {
        if (isPending || !editingItem) return

        const payload = buildValidatedPayload(targetIsActive)
        if (!payload) {
            setIsExitConfirmOpen(false)
            return
        }

        payload.append('id', String(editingItem.id))

        startTransition(async () => {
            const result = await updateBannerAction(payload)
            if (!result.success) {
                setIsExitConfirmOpen(false)
                setFormError(
                    result.error || 'Gagal memperbarui konfigurasi banner.'
                )
                return
            }

            setIsExitConfirmOpen(false)
            setEditingItem(null)
            setEditInitialSnapshot(null)
            setFeedback({
                type: 'success',
                message: targetIsActive
                    ? 'Perubahan banner berhasil disimpan dan diterbitkan.'
                    : 'Draf banner berhasil disimpan.',
            })
            router.refresh()
        })
    }

    const handleDelete = (id: number) => {
        if (isPending) return

        startTransition(async () => {
            const result = await deleteBannerAction(id)
            if (!result.success) {
                setDeletingItem(null)
                setFeedback({
                    type: 'error',
                    message: result.error || 'Gagal menghapus banner.',
                })
                return
            }

            setBannerList((prev) => prev.filter((item) => item.id !== id))
            setDeletingItem(null)
            setFeedback({
                type: 'success',
                message: 'Banner berhasil dihapus secara permanen.',
            })
            router.refresh()
        })
    }

    const handleToggleStatus = (item: BannerItem) => {
        if (isPending) return
        const nextStatus = !item.isActive
        setTogglingId(item.id)

        startTransition(async () => {
            const result = await toggleBannerStatusAction(item.id, nextStatus)
            setTogglingId(null)
            if (!result.success) {
                setFeedback({
                    type: 'error',
                    message:
                        result.error ||
                        'Gagal mengubah status penayangan banner.',
                })
                return
            }

            setBannerList((prev) =>
                prev.map((b) =>
                    b.id === item.id ? { ...b, isActive: nextStatus } : b
                )
            )
            setFeedback({
                type: 'success',
                message: nextStatus
                    ? `Banner "${item.title}" berhasil diaktifkan di beranda.`
                    : `Banner "${item.title}" berhasil dinonaktifkan dari beranda.`,
            })
            router.refresh()
        })
    }

    const handleConfirmUnpublish = () => {
        if (!unpublishingItem || isPending) return
        const target = unpublishingItem
        startTransition(async () => {
            const result = await toggleBannerStatusAction(target.id, false)
            setUnpublishingItem(null)
            if (!result.success) {
                setFeedback({
                    type: 'error',
                    message: result.error || 'Gagal menonaktifkan banner.',
                })
                return
            }

            setBannerList((prev) =>
                prev.map((b) =>
                    b.id === target.id ? { ...b, isActive: false } : b
                )
            )
            setFeedback({
                type: 'success',
                message: `Banner "${target.title}" berhasil dinonaktifkan dari beranda.`,
            })
            router.refresh()
        })
    }

    const renderForm = (
        onSubmitAction: (targetIsActive: boolean) => void,
        onClose: () => void,
        isEditMode: boolean
    ) => (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmitAction(true)
            }}
            noValidate
            className="space-y-4 text-xs"
        >
            {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle
                        size={15}
                        className="shrink-0"
                        aria-hidden="true"
                    />
                    <span>{formError}</span>
                </div>
            )}

            {/* 1. Judul / Deskripsi Banner (Wajib) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-0.5">
                    Judul / Deskripsi Banner{' '}
                    <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                    Digunakan untuk identitas admin dan teks alternatif (SEO).
                </p>
                <input
                    type="text"
                    required
                    disabled={isPending}
                    placeholder="Contoh: Peringatan Hari Jadi Kota Sukabumi ke-112"
                    value={formData.title}
                    onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value })
                        if (titleError) setTitleError(null)
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 text-slate-800 text-xs disabled:opacity-60 transition-all ${
                        titleError
                            ? 'border-red-400 bg-red-50/40 focus:ring-red-400 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:ring-[#159447] focus:border-[#159447]'
                    }`}
                />
                {titleError && (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle size={13} className="shrink-0" />
                        {titleError}
                    </p>
                )}
            </div>

            {/* 2. Gambar Banner (Wajib) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-0.5">
                    Gambar Banner <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                    Gunakan gambar berasio lanskap (Misal: 1920x600 px, maks. 5 MB).
                </p>
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {formData.imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={formData.imagePreview}
                            alt="Preview banner"
                            className="w-full h-36 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow"
                            >
                                Ganti Gambar
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                    setImageFileObj(null)
                                    setFormData({
                                        ...formData,
                                        imageUrl: '',
                                        imagePreview: '',
                                    })
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = ''
                                }}
                                className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                                title="Hapus gambar"
                                aria-label="Hapus gambar"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                        }}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            imageError
                                ? 'border-red-400 bg-red-50/40'
                                : isDragging
                                  ? 'border-[#159447] bg-[#f0fdf4]'
                                  : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                        <UploadCloud
                            size={26}
                            className={`mx-auto mb-2 ${
                                imageError ? 'text-red-400' : 'text-slate-400'
                            }`}
                        />
                        <p className="text-xs font-semibold text-slate-700">
                            Tarik gambar ke sini atau{' '}
                            <span className="text-[#159447] underline">
                                klik untuk memilih
                            </span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            <span className="text-red-500 font-semibold">
                                Wajib diunggah
                            </span>{' '}
                            • PNG, JPG, WebP (Maks. 5 MB)
                        </p>
                    </div>
                )}
                {imageError && imageErrorMessage && (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle size={13} className="shrink-0" />
                        {imageErrorMessage}
                    </p>
                )}
            </div>

            {/* 3. Tautan Tujuan (Opsional) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-1">
                    Tautan Tujuan{' '}
                    <span className="text-slate-400 font-normal">
                        (Opsional)
                    </span>
                </label>
                <div className="relative">
                    <LinkIcon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="url"
                        disabled={isPending}
                        placeholder="https://sukabumikota.go.id/halaman-tujuan"
                        value={formData.targetUrl}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                targetUrl: e.target.value,
                            })
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs disabled:opacity-60"
                    />
                </div>
            </div>

            {/* 4. Urutan Tampil */}
            <div>
                <label className="block font-semibold text-[#172135] mb-1">
                    Urutan Tampil (Sort Order)
                </label>
                <input
                    type="number"
                    min={1}
                    disabled={isPending}
                    value={formData.sortOrder || ''}
                    onChange={(e) => {
                        const val = e.target.value
                        setFormData({
                            ...formData,
                            sortOrder: val === '' ? 0 : Math.max(1, parseInt(val, 10) || 1),
                        })
                    }}
                    onBlur={() => {
                        if (!formData.sortOrder || formData.sortOrder < 1) {
                            setFormData({ ...formData, sortOrder: 1 })
                        }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white text-slate-800 text-xs transition-all disabled:opacity-60"
                />
            </div>

            {/* 5. Status Penayangan */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-[#172135]">
                    Status Penayangan
                </label>

                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onSubmitAction(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold text-xs shadow-xs cursor-pointer transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#159447' }}
                >
                    {isPending ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <Send size={14} aria-hidden="true" />
                            <span>Terbitkan Banner</span>
                        </>
                    )}
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onSubmitAction(false)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <Save size={14} aria-hidden="true" />
                        <span>Simpan Draf</span>
                    </button>
                    <button
                        type="button"
                        disabled={isPending || !formData.imagePreview}
                        onClick={() => {
                            setPreviewItem({
                                id: editingItem?.id ?? 0,
                                title: formData.title.trim() || 'Pratinjau Banner',
                                imageUrl: formData.imagePreview,
                                targetUrl: formData.targetUrl.trim() || '#',
                                sortOrder: formData.sortOrder || 1,
                                isActive: isEditMode ? formData.isActive : false,
                                createdAt: editingItem?.createdAt ?? '',
                            })
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye size={14} aria-hidden="true" />
                        <span>Pratinjau</span>
                    </button>
                </div>
            </div>
        </form>
    )

    return (
        <div className="w-full space-y-6 pb-10">
            {/* Toast Feedback */}
            <ToastNotification
                message={feedback?.message}
                type={feedback?.type}
                onClose={() => setFeedback(null)}
            />

            {/* Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Kelola Banner Beranda
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Atur gambar slider utama, urutan tayang, dan tautan kampanye pada halaman beranda portal warga.
                    </p>
                </div>
                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle size={17} className="stroke-[2.2]" />
                        <span>Tambah Banner</span>
                    </button>
                </div>
            </div>

            {/* 3 Summary Cards (Total Banner, Aktif, Tidak Aktif) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <ImageIcon size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Total Banner
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {bannerList.length}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#159447] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Aktif
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {bannerList.filter((item) => item.isActive).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <EyeOff size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Tidak Aktif
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {
                                bannerList.filter((item) => !item.isActive)
                                    .length
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Cari judul banner..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCurrentPage(1)
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Status */}
                    <div className="relative z-30 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="flex items-center justify-between gap-3 min-w-[140px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <CheckCircle2 size={14} className="shrink-0 text-slate-500" aria-hidden="true" />
                                <span className="truncate">{statusFilter}</span>
                            </span>
                            <ChevronDown
                                size={14}
                                className={`shrink-0 transition-transform duration-200 ${
                                    isStatusOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        {isStatusOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsStatusOpen(false)}
                                />
                                <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                                    {statusOptions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => {
                                                setStatusFilter(s)
                                                setIsStatusOpen(false)
                                                setCurrentPage(1)
                                            }}
                                            className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                                                statusFilter === s
                                                    ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                            }`}
                                        >
                                            <span>{s}</span>
                                            {statusFilter === s && (
                                                <Check
                                                    size={13}
                                                    className="text-[#159447]"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {(Boolean(searchTerm.trim()) ||
                        statusFilter !== 'Semua Status') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('Semua Status')
                                setIsStatusOpen(false)
                                setCurrentPage(1)
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Tabel Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-20">
                                    URUTAN
                                </th>
                                <th className="py-4 px-4 text-left w-52">
                                    GAMBAR BANNER
                                </th>
                                <th className="py-4 px-4 text-left">
                                    JUDUL &amp; TAUTAN
                                </th>
                                <th className="py-4 px-4 text-center w-32">
                                    STATUS
                                </th>
                                <th className="py-4 px-4 text-center w-36">
                                    AKSI
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-12 text-center text-slate-400"
                                    >
                                        Tidak ada banner yang cocok dengan filter atau kata kunci.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 transition-colors group"
                                    >
                                        {/* URUTAN */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="font-bold text-[#172135] text-sm">
                                                {item.sortOrder}
                                            </span>
                                        </td>

                                        {/* GAMBAR BANNER */}
                                        <td className="py-4 px-4">
                                            {item.imageUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewItem(item)
                                                    }
                                                    title="Klik untuk pratinjau banner"
                                                    className="block rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-[#159447] transition-all cursor-pointer"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="w-40 h-14 object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-40 h-14 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                    <ImageIcon
                                                        size={20}
                                                        className="text-slate-300"
                                                    />
                                                </div>
                                            )}
                                        </td>

                                        {/* JUDUL & TAUTAN */}
                                        <td className="py-4 px-4">
                                            {item.isActive ? (
                                                <a
                                                    href="/#banner"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-[#172135] text-[13px] leading-snug hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 block"
                                                    title={`Lihat "${item.title}" di section banner beranda`}
                                                >
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    className="text-left font-bold text-[#172135] text-[13px] leading-snug hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 block"
                                                    title="Klik untuk mengedit banner tidak aktif"
                                                >
                                                    {item.title}
                                                </button>
                                            )}
                                            {item.targetUrl ? (
                                                <a
                                                    href={item.targetUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                                                    title={item.targetUrl}
                                                >
                                                    <LinkIcon
                                                        size={10}
                                                        className="shrink-0"
                                                    />
                                                    <span className="truncate max-w-[280px]">
                                                        {item.targetUrl}
                                                    </span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic mt-1 block">
                                                    Tanpa tautan
                                                </span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                                    Tidak Aktif
                                                </span>
                                            )}
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* 1. Mata (Lihat Pratinjau): Aktif HANYA jika status BUKAN aktif */}
                                                {!item.isActive ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewItem(item)
                                                        }
                                                        title="Lihat Pratinjau Banner"
                                                        aria-label="Lihat Pratinjau Banner"
                                                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                ) : (
                                                    <div
                                                        title="Judul banner dapat diklik untuk melihat tampilan di beranda"
                                                        className="inline-flex cursor-not-allowed"
                                                    >
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-60 flex items-center justify-center cursor-not-allowed pointer-events-none"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    title="Edit Banner"
                                                    aria-label="Edit Banner"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletingItem(item)
                                                    }
                                                    title="Hapus Banner"
                                                    aria-label="Hapus Banner"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                {/* 4. Unpublish (Turunkan Tayang): HANYA muncul jika status banner aktif */}
                                                {item.isActive && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isPending &&
                                                            togglingId === item.id
                                                        }
                                                        onClick={() =>
                                                            setUnpublishingItem(item)
                                                        }
                                                        title="Nonaktifkan Banner (Sembunyikan dari Beranda)"
                                                        aria-label="Nonaktifkan Banner"
                                                        className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {isPending &&
                                                        togglingId === item.id ? (
                                                            <Loader2
                                                                size={13}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Undo2 size={14} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Paginasi */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <div className="text-sm font-medium text-slate-600">
                        <span>
                            Menampilkan{' '}
                            <span className="font-bold text-[#172135]">
                                {startItem} - {endItem}
                            </span>{' '}
                            dari{' '}
                            <span className="font-bold text-[#172135]">
                                {filteredData.length}
                            </span>{' '}
                            banner
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
                                currentPage === 1
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-xs'
                            }`}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, idx) =>
                                page === '...' ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 font-semibold text-xs"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(page as number)
                                        }
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            currentPage === page
                                                ? 'bg-[#159447] text-white shadow-sm shadow-green-200 scale-105'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                currentPage === totalPages
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    : 'bg-[#159447] text-white hover:bg-[#127a3a] shadow-sm shadow-green-200'
                            }`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Pratinjau Banner */}
            {previewItem && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#172135] text-xs font-bold">
                                    Urutan #{previewItem.sortOrder}
                                </span>
                                {previewItem.isActive ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                        Tidak Aktif
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {previewItem.targetUrl && previewItem.targetUrl !== '#' ? (
                                <a
                                    href={previewItem.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block relative w-full aspect-[1400/315] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-95 transition-opacity cursor-pointer"
                                    title={`Buka tautan banner di tab baru: ${previewItem.targetUrl}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewItem.imageUrl}
                                        alt={previewItem.title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                </a>
                            ) : (
                                <div className="relative w-full aspect-[1400/315] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewItem.imageUrl}
                                        alt={previewItem.title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-[#172135] text-base">
                                    {previewItem.title}
                                </h3>
                                {previewItem.targetUrl ? (
                                    <a
                                        href={previewItem.targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                    >
                                        <ExternalLink size={13} />
                                        <span>{previewItem.targetUrl}</span>
                                    </a>
                                ) : (
                                    <p className="text-xs text-slate-400 italic mt-1">
                                        Tanpa tautan tujuan
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const target = previewItem
                                    setPreviewItem(null)
                                    openEditModal(target)
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <Pencil size={13} />
                                <span>Edit Banner</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white text-xs font-semibold transition-colors cursor-pointer"
                                style={{ backgroundColor: '#159447' }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Banner */}
            {isAddModalOpen && (
                <div
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) requestCloseAddModal()
                    }}
                    className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#159447] flex items-center justify-center shrink-0">
                                    <PlusCircle size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Tambah Banner Baru
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Unggah gambar dan konfigurasikan pengaturan tampil banner.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={requestCloseAddModal}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {renderForm(
                            handleSaveAdd,
                            requestCloseAddModal,
                            false
                        )}
                    </div>
                </div>
            )}

            {/* Modal Edit Banner */}
            {editingItem && (
                <div
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) requestCloseEditModal()
                    }}
                    className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#159447] flex items-center justify-center shrink-0">
                                    <Pencil size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Edit Banner
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Perbarui konfigurasi banner urutan #{editingItem.sortOrder}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={requestCloseEditModal}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {renderForm(
                            handleSaveEdit,
                            requestCloseEditModal,
                            true
                        )}
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deletingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
                            <AlertCircle size={28} className="text-red-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#172135] text-base tracking-tight">
                                Hapus Banner Ini?
                            </h4>
                            <p className="text-xs text-[#566276] mt-1.5 leading-relaxed">
                                Banner{' '}
                                <span className="font-semibold text-[#172135]">
                                    &ldquo;{deletingItem.title}&rdquo;
                                </span>{' '}
                                akan dihapus permanen dan tidak lagi ditampilkan di beranda.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setDeletingItem(null)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleDelete(deletingItem.id)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2
                                            size={13}
                                            className="animate-spin"
                                        />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <span>Hapus Banner</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Turunkan / Nonaktifkan Banner */}
            {unpublishingItem && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        if (!isPending) setUnpublishingItem(null)
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Lingkaran di Atas */}
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100 text-amber-600">
                                <Undo2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            {/* Judul Modal */}
                            <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                                Konfirmasi Turunkan Banner
                            </h3>

                            {/* Pesan Keterangan */}
                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menonaktifkan banner ini dari beranda?
                            </p>

                            {/* Preview Singkat Judul Banner */}
                            {unpublishingItem.title && (
                                <p className="mb-6 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{unpublishingItem.title}&rdquo;
                                </p>
                            )}

                            {/* Tombol Aksi Tidak & Ya */}
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setUnpublishingItem(null)}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Tidak
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={handleConfirmUnpublish}
                                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-white"
                                            />
                                            <span>Menurunkan...</span>
                                        </>
                                    ) : (
                                        <span>Ya</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmSaveDraftModal
                isOpen={isExitConfirmOpen}
                isSaving={isPending}
                isPublished={Boolean(editingItem?.isActive)}
                onConfirmSaveDraft={() =>
                    editingItem
                        ? handleSaveEdit(editingItem.isActive)
                        : handleSaveAdd(false)
                }
                onDiscard={() => {
                    setIsExitConfirmOpen(false)
                    setEditingItem(null)
                    setEditInitialSnapshot(null)
                    setIsAddModalOpen(false)
                }}
                onCancel={() => setIsExitConfirmOpen(false)}
            />
        </div>
    )
}
