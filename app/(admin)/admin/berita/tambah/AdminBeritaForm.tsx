'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Bold,
    Italic,
    Underline,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link2,
    Undo2,
    Redo2,
    Maximize2,
    ImageIcon,
    CloudUpload,
    Trash2,
    Plus,
    Send,
    Save,
    Eye,
    User,
    Clock3,
    AlignLeft,
    FileText,
    X,
    Search,
    ChevronDown,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Lock,
} from 'lucide-react'
import { OFFICIAL_CATEGORIES } from '@/lib/constants/categories'
import {
    getStatusLabel,
    STATUS_COLORS,
    type BeritaEditData,
    type UserRole,
} from '@/lib/types/berita'
import {
    createBeritaAction,
    updateBeritaAction,
    type BeritaActionType,
} from '../actions'

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
    icon: Icon,
    label,
    active = false,
    onClick,
}: {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer ${active ? 'bg-slate-200 text-slate-800' : ''}`}
        >
            <Icon size={14} strokeWidth={2} />
        </button>
    )
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const overflowCls = className.includes('overflow-') ? '' : 'overflow-hidden'
    return (
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs ${overflowCls} ${className}`}>
            {children}
        </div>
    )
}

// ─── Field Label ──────────────────────────────────────────────────────────────
function FieldLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#172135]">{children}</label>
            {right && <span className="text-[11px] text-slate-400 font-medium">{right}</span>}
        </div>
    )
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function extractWibParts(isoDate?: string | null) {
    const target = isoDate ? new Date(isoDate) : new Date()
    const validDate = Number.isNaN(target.getTime()) ? new Date() : target
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(validDate)
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
    const hour = get('hour') === '24' ? '00' : get('hour')
    return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        time: `${hour}:${get('minute')}`,
    }
}

function getRolePositionLabel(role?: UserRole): string {
    if (role === 'REPORTER') return 'Reporter'
    if (role === 'ADMIN_BERITA') return 'Admin Berita'
    return 'Super Admin'
}

interface AdminBeritaFormProps {
    initialData?: BeritaEditData | null
    notFoundId?: number | null
    availableCategories?: string[]
}

export default function AdminBeritaForm({
    initialData = null,
    notFoundId = null,
    availableCategories = [...OFFICIAL_CATEGORIES],
}: AdminBeritaFormProps) {
    const router = useRouter()
    const isEditMode = Boolean(initialData)
    const [activeId, setActiveId] = useState<number | null>(initialData?.id ?? null)

    const [title, setTitle] = useState(initialData?.title ?? '')

    // Konteks Sesi Pengguna (Default Admin)
    const [currentUserRole] = useState<UserRole>('SUPER_ADMIN')
    const currentUserName = 'Trias Firmansyah'

    const getNowWib = () => extractWibParts()
    const [nowWib, setNowWib] = useState<{ date: string; time: string } | null>(null)
    const [publishDate, setPublishDate] = useState('')
    const [publishTime, setPublishTime] = useState('')

    useEffect(() => {
        const initialNow = getNowWib()
        setNowWib(initialNow)
        if (initialData?.published_at) {
            const existingWib = extractWibParts(initialData.published_at)
            setPublishDate(existingWib.date)
            setPublishTime(existingWib.time)
        } else {
            setPublishDate(initialNow.date)
            setPublishTime(initialNow.time)
        }
        const id = setInterval(() => setNowWib(getNowWib()), 30000)
        return () => clearInterval(id)
    }, [initialData?.published_at])

    const handlePublishDateChange = (value: string) => {
        const now = getNowWib()
        const date = value > now.date ? now.date : value
        setPublishDate(date)
        if (date === now.date && publishTime > now.time) setPublishTime(now.time)
    }
    const handlePublishTimeChange = (value: string) => {
        const now = getNowWib()
        setPublishTime(publishDate === now.date && value > now.time ? now.time : value)
    }

    const reporterName = isEditMode && initialData
        ? initialData.author_name
        : currentUserName
    const reporterRoleLabel = isEditMode && initialData
        ? getRolePositionLabel(initialData.author_role)
        : getRolePositionLabel(currentUserRole)
    const reporterInitials =
        reporterName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join('') || 'AD'

    const [caption, setCaption] = useState(initialData?.caption ?? '')
    const [sourceCredit, setSourceCredit] = useState(initialData?.source_credit ?? '')
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        if (initialData?.categories && initialData.categories.length > 0) {
            return initialData.categories
        }
        if (initialData?.category_name && initialData.category_name.trim()) {
            return initialData.category_name
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean)
        }
        return []
    })
    const [tagSearch, setTagSearch] = useState('')
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
    const tagDropdownRef = useRef<HTMLDivElement>(null)

    // Image Upload State (menyimpan file fisik + preview lokal atau URL eksisting)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.image_url ?? null
    )
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
        initialData?.image_url ?? null
    )
    const [imageFileName, setImageFileName] = useState<string>(() => {
        if (initialData?.image_url) {
            const parts = initialData.image_url.split('/')
            return parts[parts.length - 1] || 'Gambar sampul tersimpan'
        }
        return ''
    })
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Submission & Feedback State
    const [submittingAction, setSubmittingAction] = useState<
        'DRAFT' | 'SUBMIT' | 'PUBLISH' | 'PREVIEW' | null
    >(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(
        notFoundId ? `Data naskah berita dengan ID #${notFoundId} tidak ditemukan.` : null
    )
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!successMessage) return
        const timer = setTimeout(() => setSuccessMessage(null), 5000)
        return () => clearTimeout(timer)
    }, [successMessage])

    useEffect(() => {
        if (!errorMessage || notFoundId) return
        const timer = setTimeout(() => setErrorMessage(null), 5000)
        return () => clearTimeout(timer)
    }, [errorMessage, notFoundId])

    const applySelectedFile = (file: File) => {
        setErrorMessage(null)

        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            setErrorMessage('Format berkas tidak didukung. Gunakan format JPG, PNG, atau WebP.')
            return
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrorMessage('Ukuran berkas gambar melebihi batas maksimal 5 MB.')
            return
        }

        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview)
        }

        setImageFile(file)
        setExistingImageUrl(null)
        setImagePreview(URL.createObjectURL(file))
        setImageFileName(file.name)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            applySelectedFile(file)
        }
    }

    const handleRemoveImage = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview)
        }
        setImageFile(null)
        setExistingImageUrl(null)
        setImagePreview(null)
        setImageFileName('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            applySelectedFile(file)
        }
    }

    // Editor & Word Count State
    const editorRef = useRef<HTMLDivElement>(null)
    const [wordCount, setWordCount] = useState(0)

    const updateWordCount = () => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || ''
            const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
            setWordCount(words.length)
        }
    }

    // Pre-fill konten HTML editor saat Edit Mode
    useEffect(() => {
        if (editorRef.current && initialData?.content) {
            editorRef.current.innerHTML = initialData.content
            updateWordCount()
        }
    }, [initialData?.id, initialData?.content])

    const execFormat = (command: string, value: string = '') => {
        document.execCommand(command, false, value)
        editorRef.current?.focus()
        updateWordCount()
    }

    const handleLink = () => {
        const url = prompt('Masukkan URL tautan:', 'https://')
        if (url) {
            execFormat('createLink', url)
        }
    }

    const charCount = title.length

    const removeTag = (tagToRemove: string) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove))
    }

    const selectTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags((prev) => [...prev, tag])
        }
        setTagSearch('')
        setIsTagDropdownOpen(false)
    }

    const [categoryList, setCategoryList] = useState<string[]>(availableCategories)
    const [isAddingInlineCategory, setIsAddingInlineCategory] = useState(false)
    const [inlineCategoryInput, setInlineCategoryInput] = useState('')

    const trimmedTagSearch = tagSearch.trim().replace(/\s+/g, ' ')
    const exactCategoryMatch = categoryList.find(
        (cat) => cat.toLowerCase() === trimmedTagSearch.toLowerCase()
    )

    // Kategori baru disimpan lokal dulu; baris di public.categories dibuat server saat naskah disimpan
    const handleCreateCategory = () => {
        if (!trimmedTagSearch || trimmedTagSearch.length > 30 || currentUserRole === 'REPORTER') return
        if (exactCategoryMatch) {
            selectTag(exactCategoryMatch)
            return
        }
        setCategoryList((prev) =>
            [...prev, trimmedTagSearch].sort((a, b) => a.localeCompare(b, 'id'))
        )
        selectTag(trimmedTagSearch)
    }

    const handleSaveInlineCategory = () => {
        const trimmed = inlineCategoryInput.trim().replace(/\s+/g, ' ')
        if (!trimmed || trimmed.length > 30 || currentUserRole === 'REPORTER') return

        const existing = categoryList.find(
            (cat) => cat.toLowerCase() === trimmed.toLowerCase()
        )

        if (existing) {
            selectTag(existing)
        } else {
            setCategoryList((prev) =>
                [...prev, trimmed].sort((a, b) => a.localeCompare(b, 'id'))
            )
            selectTag(trimmed)
        }

        setInlineCategoryInput('')
        setIsAddingInlineCategory(false)
    }

    const filteredCategories = categoryList.filter(
        (cat) =>
            !selectedTags.includes(cat) &&
            cat.toLowerCase().includes(tagSearch.toLowerCase().trim())
    )

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
                setIsTagDropdownOpen(false)
            }
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsTagDropdownOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        const anchor = target.closest('a')
        if (anchor && anchor.href) {
            e.preventDefault()
            window.open(anchor.href, '_blank', 'noopener,noreferrer')
        }
    }

    // Handler Submit ke Server Action (Create atau Update)
    const handleSubmit = async (actionType: BeritaActionType, openPreview = false) => {
        if (submittingAction) return

        setErrorMessage(null)
        setSuccessMessage(null)

        const trimmedTitle = title.trim()
        const editorHtml = editorRef.current?.innerHTML?.trim() || ''
        const editorText = editorRef.current?.innerText?.trim() || ''
        const hasAnyImage = Boolean(imageFile || existingImageUrl)
        const trimmedCaption = caption.trim()
        const trimmedSourceCredit = sourceCredit.trim()

        if (!trimmedTitle) {
            setErrorMessage('Judul berita utama wajib diisi.')
            return
        }

        if (!hasAnyImage) {
            setErrorMessage('Gambar utama berita wajib diunggah.')
            return
        }

        if (!trimmedCaption) {
            setErrorMessage('Keterangan / caption foto wajib diisi.')
            return
        }

        if (!trimmedSourceCredit) {
            setErrorMessage('Sumber foto / atribusi wajib diisi.')
            return
        }

        if (!editorText) {
            setErrorMessage('Naskah narasi berita wajib diisi.')
            return
        }

        if (selectedTags.length === 0) {
            setErrorMessage('Pilih minimal 1 kategori berita.')
            return
        }

        if (currentUserRole !== 'REPORTER') {
            if (!publishDate) {
                setErrorMessage('Tanggal publikasi wajib diisi.')
                return
            }
            if (!publishTime) {
                setErrorMessage('Waktu publikasi (WIB) wajib diisi.')
                return
            }
        }

        try {
            setSubmittingAction(openPreview ? 'PREVIEW' : actionType)

            const formData = new FormData()
            formData.append('title', trimmedTitle)
            formData.append('content', editorHtml)
            formData.append(
                'category_id',
                selectedTags.join(',') ||
                    (initialData?.category_id ? String(initialData.category_id) : '')
            )
            selectedTags.forEach((tag) => formData.append('categories', tag))
            formData.append('caption', caption.trim())
            formData.append('source_credit', sourceCredit.trim())
            formData.append('action_type', actionType)
            formData.append('author_name', reporterName)
            formData.append('user_role', currentUserRole)
            formData.append('publish_date', publishDate)
            formData.append('publish_time', publishTime)

            if (imageFile) {
                formData.append('image', imageFile)
            } else if (existingImageUrl) {
                formData.append('existing_image_url', existingImageUrl)
            }

            const result = activeId
                ? await updateBeritaAction(activeId, formData)
                : await createBeritaAction(formData)

            if (!result.success) {
                setErrorMessage(result.error || 'Gagal menyimpan berita.')
                setSubmittingAction(null)
                return
            }

            if (result.id && !activeId) {
                setActiveId(result.id)
            }

            if (openPreview && result.slug) {
                window.open(`/berita/${result.slug}?preview=true`, '_blank', 'noopener,noreferrer')
                setSuccessMessage('Draf berita disimpan dan dibuka di tab pratinjau baru.')
                setSubmittingAction(null)
                return
            }

            const notifParam =
                actionType === 'DRAFT'
                    ? activeId
                        ? 'draft_updated'
                        : 'draft_saved'
                    : currentUserRole === 'REPORTER'
                      ? 'submitted'
                      : activeId
                        ? 'published_updated'
                        : 'published'

            router.push(`/admin/berita?notif=${notifParam}`)
            router.refresh()
        } catch (err: unknown) {
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : 'Terjadi kesalahan saat menghubungi server.'
            )
            setSubmittingAction(null)
        }
    }

    const currentStatus = initialData?.status ?? 'DRAFT'
    const statusBadgeStyle = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.DRAFT
    const statusBadgeText = isEditMode
        ? `Status: ${getStatusLabel(currentStatus, 'ADMIN_BERITA')}`
        : 'Status: Draf Baru'

    return (
        <div className="w-full space-y-6 pb-10">

            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Link
                            href="/admin/berita"
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#159447] transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Kelola Berita
                        </Link>
                        <span className="text-[11px] font-semibold text-slate-300">/</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                            {isEditMode ? 'Edit & Review Naskah' : 'Publikasi Baru'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        {isEditMode ? 'Edit & Tinjau Publikasi Berita' : 'Tulis Publikasi Baru'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed mt-1">
                        {isEditMode
                            ? 'Tinjau kembali naskah berita, perbarui dokumentasi visual bila diperlukan, dan terbitkan ke portal publik.'
                            : 'Lengkapi naskah narasi, unggah dokumentasi visual, dan atur jadwal rilis berita ke portal publik.'}
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                    <div
                        className={`inline-flex items-center gap-2.5 px-3.5 py-2 border rounded-full shadow-2xs transition-all ${
                            isEditMode
                                ? `${statusBadgeStyle.bg} ${statusBadgeStyle.border}`
                                : 'bg-amber-50 border-amber-200'
                        }`}
                    >
                        <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isEditMode
                                    ? statusBadgeStyle.dot
                                    : 'bg-amber-500 animate-pulse'
                            }`}
                        />
                        <span
                            className={`text-[13px] font-bold tracking-tight ${
                                isEditMode ? statusBadgeStyle.text : 'text-amber-700'
                            }`}
                        >
                            {statusBadgeText}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notifikasi Pop-up Toast Error / Sukses */}
            {errorMessage && (
                <div
                    role="alert"
                    className="fixed top-6 right-6 z-[110] max-w-md w-[calc(100vw-3rem)] sm:w-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[15px] font-semibold shadow-xl animate-in fade-in slide-in-from-top-3 duration-200"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle size={21} className="shrink-0 text-red-500" aria-hidden="true" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        aria-label="Tutup notifikasi"
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed top-6 right-6 z-[110] max-w-md w-[calc(100vw-3rem)] sm:w-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[15px] font-semibold shadow-xl animate-in fade-in slide-in-from-top-3 duration-200"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={21} className="shrink-0 text-emerald-600" aria-hidden="true" />
                        <span>{successMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        aria-label="Tutup notifikasi"
                        className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* ── MAIN GRID ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ════════════════════════════════════════════════════════
                    KOLOM KIRI — lg:col-span-8
                ════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-8 space-y-6">

                    {/* A. Judul Berita Utama */}
                    <Card>
                        <div className="p-5">
                            <FieldLabel
                                right={
                                    <span className={charCount > 100 ? 'text-amber-500 font-semibold' : ''}>
                                        {charCount} / 120 Karakter
                                    </span>
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <FileText size={14} className="text-[#159447]" />
                                    Judul Berita Utama <span className="text-red-500 ml-0.5">*</span>
                                </span>
                            </FieldLabel>

                            <input
                                type="text"
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Pemerintah Luncurkan Sistem Satu Data Terpadu untuk Pelayanan..."
                                className="w-full bg-[#f8fafc] text-lg font-bold text-[#172135] placeholder:text-slate-300 placeholder:font-normal border-0 border-b-2 border-transparent focus:border-[#159447] focus:bg-white outline-none rounded-xl px-4 py-3 transition-all duration-200"
                            />

                            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                                Pastikan judul tidak melebihi 120 karakter untuk optimalisasi indeks pencarian publik dan portal berita seluler.
                            </p>
                        </div>
                    </Card>

                    {/* B. Gambar Utama Berita */}
                    <Card>
                        <div className="p-5">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <div className="flex items-center justify-between mb-1">
                                <FieldLabel>
                                    <span className="flex items-center gap-2">
                                        <ImageIcon size={14} className="text-[#159447]" />
                                        Gambar Utama Berita <span className="text-red-500 ml-0.5">*</span>
                                    </span>
                                </FieldLabel>
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    Batas 5 MB
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                                Format disarankan: JPG, PNG, atau WebP rasio 16:9 beresolusi minimal 1280×720 px.
                            </p>

                            {/* Image Preview OR Upload Placeholder */}
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview gambar berita"
                                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                    {/* File name — bottom left */}
                                    {imageFileName && (
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg max-w-[80%] truncate">
                                            <ImageIcon size={12} className="shrink-0" />
                                            <span className="truncate">{imageFileName}</span>
                                        </div>
                                    )}

                                    {/* Actions — bottom right: HANYA ikon Trash */}
                                    <div className="absolute bottom-3 right-3">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            title="Hapus gambar"
                                            className="flex items-center justify-center w-8 h-8 bg-white/95 hover:bg-red-50 rounded-lg shadow-sm text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full aspect-video sm:aspect-[21/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
                                        isDragging
                                            ? 'border-[#159447] bg-[#f0fdf4]'
                                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                                        <ImageIcon size={22} className="text-slate-400" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 max-w-sm mb-1 leading-relaxed">
                                        Tarik dan lepas gambar ke area ini, atau klik tombol untuk mengunggah dari perangkat Anda.
                                    </p>
                                    <p className="text-[11px] text-slate-400 mb-3.5">
                                        Mendukung file JPG, PNG, atau WebP (Rasio 16:9, Maks. 5 MB)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                                    >
                                        <CloudUpload size={14} className="text-[#159447]" />
                                        <span>Pilih Berkas</span>
                                    </button>
                                </div>
                            )}

                            {/* Caption & Source */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                        Keterangan / Caption Foto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Wakil Gubernur bersama Kepala Dinas..."
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                        Sumber Foto / Atribusi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sourceCredit}
                                        onChange={(e) => setSourceCredit(e.target.value)}
                                        placeholder="Biro Administrasi Pimpinan & Humas"
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* C. Naskah Narasi Lengkap */}
                    <Card>
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <AlignLeft size={14} className="text-[#159447]" />
                                <span className="text-xs font-bold text-[#172135]">
                                    Naskah Narasi Lengkap <span className="text-red-500">*</span>
                                </span>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="px-4 py-2 border-b border-slate-100 bg-[#fafafa]">
                            <div className="flex flex-wrap items-center gap-0.5">
                                <ToolbarBtn
                                    icon={Bold}
                                    label="Bold"
                                    onClick={() => execFormat('bold')}
                                />
                                <ToolbarBtn
                                    icon={Italic}
                                    label="Italic"
                                    onClick={() => execFormat('italic')}
                                />
                                <ToolbarBtn
                                    icon={Underline}
                                    label="Underline"
                                    onClick={() => execFormat('underline')}
                                />
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={Heading2}
                                    label="Heading 2"
                                    onClick={() => execFormat('formatBlock', 'H2')}
                                />
                                <ToolbarBtn
                                    icon={Heading3}
                                    label="Heading 3"
                                    onClick={() => execFormat('formatBlock', 'H3')}
                                />
                                <button
                                    type="button"
                                    title="Format Paragraf Normal"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => execFormat('formatBlock', 'P')}
                                    className="flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                                >
                                    Paragraf
                                </button>
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={List}
                                    label="Bullet List"
                                    onClick={() => execFormat('insertUnorderedList')}
                                />
                                <ToolbarBtn
                                    icon={ListOrdered}
                                    label="Numbered List"
                                    onClick={() => execFormat('insertOrderedList')}
                                />
                                <ToolbarBtn
                                    icon={Quote}
                                    label="Blockquote"
                                    onClick={() => execFormat('formatBlock', 'BLOCKQUOTE')}
                                />
                                <ToolbarBtn
                                    icon={Link2}
                                    label="Tautan"
                                    onClick={handleLink}
                                />
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={Undo2}
                                    label="Undo"
                                    onClick={() => execFormat('undo')}
                                />
                                <ToolbarBtn
                                    icon={Redo2}
                                    label="Redo"
                                    onClick={() => execFormat('redo')}
                                />
                                <ToolbarBtn
                                    icon={Maximize2}
                                    label="Layar Penuh"
                                    onClick={() => {
                                        if (editorRef.current) {
                                            if (!document.fullscreenElement) {
                                                editorRef.current.requestFullscreen?.()
                                            } else {
                                                document.exitFullscreen?.()
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div
                            ref={editorRef}
                            onInput={updateWordCount}
                            onClick={handleEditorClick}
                            data-placeholder="Tulis naskah berita lengkap di sini..."
                            className="px-5 py-5 min-h-[320px] bg-[#f8fafc] text-sm leading-relaxed text-slate-700 editor-content [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-800 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none"
                            suppressContentEditableWarning
                            contentEditable
                            style={{ outline: 'none' }}
                        />

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
                            <span className="text-[11px] text-slate-500 font-medium">{wordCount} Kata</span>
                        </div>
                    </Card>
                </div>

                {/* ════════════════════════════════════════════════════════
                    KOLOM KANAN — lg:col-span-4
                ════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-4 space-y-6">

                    {/* A. Jadwal Publikasi Publik */}
                    {currentUserRole !== 'REPORTER' && (
                        <Card>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-3.5">
                                    <Clock3 size={14} className="text-[#159447]" />
                                    <span className="text-xs font-bold text-[#172135]">
                                        Jadwal Publikasi Publik <span className="text-red-500">*</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                            Tanggal <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={publishDate}
                                            max={nowWib?.date}
                                            onChange={(e) => handlePublishDateChange(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                            Waktu (WIB) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={publishTime}
                                            max={nowWib && publishDate === nowWib.date ? nowWib.time : undefined}
                                            onChange={(e) => handlePublishTimeChange(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                                    Berita akan muncul langsung di feeds aplikasi warga dan portal utama sesuai jadwal. Tanggal & waktu tidak boleh melebihi waktu saat ini.
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* B. Jurnalis / Reporter (UI Penguncian Penulis) */}
                    <Card>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-[#159447]" />
                                    <span className="text-xs font-bold text-[#172135]">Jurnalis / Reporter</span>
                                </div>
                                {isEditMode && (
                                    <span
                                        title="Nama penulis asli dikunci dan tidak dapat diubah"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500"
                                    >
                                        <Lock size={11} className="text-slate-400" />
                                        <span>Read-only</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl">
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center text-xs font-bold shrink-0">
                                    {reporterInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#172135] truncate">
                                        {reporterName}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {reporterRoleLabel}
                                    </p>
                                </div>
                                {isEditMode && (
                                    <Lock
                                        size={14}
                                        className="text-slate-400 shrink-0"
                                        aria-label="Penulis terkunci"
                                    />
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                                {isEditMode
                                    ? 'Penulis asli naskah bersifat tetap (Read-only) dan tidak berubah meskipun disunting oleh Admin.'
                                    : 'Terisi otomatis dari sesi admin yang sedang aktif.'}
                            </p>
                        </div>
                    </Card>

                    {/* C. Tag Kategori Berita */}
                    <Card className="overflow-visible relative z-20">
                        <div className="p-4" ref={tagDropdownRef}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-[#159447]" />
                                    <span className="text-xs font-bold text-[#172135]">
                                        Tag Kategori Berita <span className="text-red-500">*</span>
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    {selectedTags.length} Dipilih
                                </span>
                            </div>

                            {/* Area Selected Tags */}
                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {selectedTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]"
                                        >
                                            <span>#{tag.replace(/\s/g, '')}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                title={`Hapus tag ${tag}`}
                                                className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:bg-[#16a34a]/20 text-[#16a34a] transition-colors cursor-pointer"
                                            >
                                                <X size={10} strokeWidth={2.5} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Input & Dropdown */}
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        maxLength={30}
                                        value={tagSearch}
                                        onChange={(e) => {
                                            setTagSearch(e.target.value)
                                            if (!isTagDropdownOpen) setIsTagDropdownOpen(true)
                                        }}
                                        onFocus={() => setIsTagDropdownOpen(true)}
                                        placeholder="Cari atau pilih kategori..."
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180 text-[#159447]' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* List Dropdown */}
                                {isTagDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-1.5 overscroll-contain">
                                        {filteredCategories.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {filteredCategories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => selectTag(cat)}
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#f0fdf4] hover:text-[#159447] transition-colors flex items-center justify-between cursor-pointer group"
                                                    >
                                                        <span>{cat}</span>
                                                        <Plus
                                                            size={12}
                                                            className="text-slate-300 group-hover:text-[#159447] transition-colors"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : trimmedTagSearch && !exactCategoryMatch ? (
                                            currentUserRole !== 'REPORTER' ? (
                                                trimmedTagSearch.length > 30 ? (
                                                    <div className="px-3 py-3 text-center">
                                                        <p className="text-xs text-amber-700 font-medium">
                                                            Nama kategori maksimal 30 karakter ({trimmedTagSearch.length}/30).
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateCategory}
                                                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#12803d] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] active:bg-[#bbf7d0] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#159447] transition-colors flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Plus size={14} aria-hidden="true" className="shrink-0" />
                                                        <span className="min-w-0 break-words">
                                                            Buat Kategori Baru: &ldquo;{trimmedTagSearch}&rdquo;
                                                        </span>
                                                    </button>
                                                )
                                            ) : (
                                                <div className="px-3 py-4 text-center">
                                                    <p className="text-xs text-slate-500 break-words">
                                                        Kategori &ldquo;{trimmedTagSearch}&rdquo; tidak ditemukan. Hanya Admin yang dapat menambahkan kategori baru.
                                                    </p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="px-3 py-4 text-center">
                                                <p className="text-xs text-slate-500">
                                                    {exactCategoryMatch
                                                        ? `Kategori "${exactCategoryMatch}" sudah dipilih`
                                                        : 'Semua kategori sudah dipilih'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Kontrol Inline Tambah Kategori Baru (Khusus Admin) */}
                            {currentUserRole !== 'REPORTER' && (
                                <div className="mt-3 pt-2.5 border-t border-slate-100">
                                    {!isAddingInlineCategory ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingInlineCategory(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#159447] hover:text-[#12803d] transition-colors cursor-pointer"
                                        >
                                            <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
                                            <span>Tambah Kategori Baru</span>
                                        </button>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    maxLength={30}
                                                    value={inlineCategoryInput}
                                                    onChange={(e) => setInlineCategoryInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleSaveInlineCategory()
                                                        } else if (e.key === 'Escape') {
                                                            setIsAddingInlineCategory(false)
                                                            setInlineCategoryInput('')
                                                        }
                                                    }}
                                                    placeholder="Nama kategori baru (maks. 30)..."
                                                    autoFocus
                                                    className="flex-1 bg-[#f8fafc] border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSaveInlineCategory}
                                                    disabled={!inlineCategoryInput.trim() || inlineCategoryInput.trim().length > 30}
                                                    className="px-2.5 py-1.5 bg-[#159447] hover:bg-[#12803d] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Simpan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingInlineCategory(false)
                                                        setInlineCategoryInput('')
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                                                    title="Batal"
                                                    aria-label="Batal"
                                                >
                                                    <X size={14} aria-hidden="true" />
                                                </button>
                                            </div>
                                            {inlineCategoryInput.trim().length > 30 && (
                                                <p className="text-[10px] text-red-500">Maksimal 30 karakter.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* D. Action Buttons */}
                    <div className="space-y-2.5">
                        {/* Tombol Utama: Terbitkan Berita / Simpan & Terbitkan */}
                        <button
                            type="button"
                            disabled={submittingAction !== null}
                            onClick={() =>
                                handleSubmit(
                                    currentUserRole === 'REPORTER' ? 'SUBMIT' : 'PUBLISH'
                                )
                            }
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            style={{ backgroundColor: '#159447' }}
                        >
                            {submittingAction === 'PUBLISH' || submittingAction === 'SUBMIT' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>
                                        {currentUserRole === 'REPORTER'
                                            ? 'Kirim Draf untuk Review'
                                            : isEditMode
                                              ? currentStatus === 'PUBLISHED'
                                                  ? 'Simpan & Perbarui Tayangan'
                                                  : 'Terbitkan Berita'
                                              : 'Terbitkan Berita'}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Secondary */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                disabled={submittingAction !== null}
                                onClick={() => handleSubmit('DRAFT')}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                {submittingAction === 'DRAFT' ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        <span>Simpan Draf</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={submittingAction !== null}
                                onClick={() => handleSubmit('DRAFT', true)}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                {submittingAction === 'PREVIEW' ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Membuka...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye size={14} />
                                        <span>Pratinjau</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
                {/* ─── End Kolom Kanan ─────────────────────────────────── */}

            </div>
        </div>
    )
}

