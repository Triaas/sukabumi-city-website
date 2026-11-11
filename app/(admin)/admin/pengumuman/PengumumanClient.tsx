'use client'

import { useState, useMemo, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    PlusCircle,
    Search,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash2,
    Undo2,
    X,
    Check,
    AlertCircle,
    CheckCircle2,
    Paperclip,
    FileText,
    Download,
    ExternalLink,
    UploadCloud,
    Megaphone,
    User,
    Image as ImageIcon,
    Loader2,
    Send,
    Save,
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import {
    createPengumumanAction,
    updatePengumumanAction,
    deletePengumumanAction,
    unpublishPengumumanAction,
    type PengumumanItem,
} from '@/lib/pengumuman/actions'

export type { PengumumanItem }

const statusOptions = ['Semua Status', 'Diterbitkan', 'Draf']

const indonesianMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
]

function parseIndoToDateInput(indoStr: string): string {
    if (!indoStr || indoStr === '-') return ''
    const parts = indoStr.trim().split(' ')
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const mKey = parts[1].toLowerCase().slice(0, 3)
        const monthMap: Record<string, string> = {
            jan: '01',
            feb: '02',
            mar: '03',
            apr: '04',
            mei: '05',
            jun: '06',
            jul: '07',
            agu: '08',
            sep: '09',
            okt: '10',
            nov: '11',
            des: '12',
        }
        const month = monthMap[mKey] || '01'
        const year = parts[2]
        return `${year}-${month}-${day}`
    }
    return ''
}

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

function getTodayDate(): string {
    return extractWibParts().date
}

function getCurrentTime(): string {
    return extractWibParts().time
}

function getAttachmentDisplayName(pathOrName: string | null | undefined): string {
    if (!pathOrName) return ''
    const parts = pathOrName.split('/')
    return parts[parts.length - 1] || pathOrName
}

function stripHtmlTags(html: string): string {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDateInputToIndo(dateStr: string): string {
    if (!dateStr) return '-'
    const parts = dateStr.split('-')
    if (parts.length === 3) {
        const year = parts[0]
        const monthIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        const monthName = indonesianMonths[monthIdx] || parts[1]
        return `${day} ${monthName} ${year}`
    }
    return dateStr
}

function formatTimeWithWib(timeStr: string): string {
    if (!timeStr) return '-'
    return timeStr.includes('WIB') ? timeStr : `${timeStr} WIB`
}

interface PengumumanClientProps {
    initialData: PengumumanItem[]
}

export default function PengumumanClient({
    initialData,
}: PengumumanClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [pengumumanList, setPengumumanList] =
        useState<PengumumanItem[]>(initialData)

    useEffect(() => {
        setPengumumanList(initialData)
    }, [initialData])

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    // Rentang Waktu State
    const [dateFilter, setDateFilter] = useState('Semua Waktu')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDateOpen, setIsDateOpen] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<PengumumanItem | null>(null)
    const [previewItem, setPreviewItem] = useState<PengumumanItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<PengumumanItem | null>(null)
    const [unpublishingItem, setUnpublishingItem] = useState<PengumumanItem | null>(null)

    // Floating Toast Feedback
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    useEffect(() => {
        if (!feedback) return
        const timer = setTimeout(() => {
            setFeedback(null)
        }, 5000)
        return () => clearTimeout(timer)
    }, [feedback])

    // Form State (Tambah & Edit)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        publishDate: '',
        publishTime: '',
        authorName: 'Trias Firmansyah',
        authorRole: 'Admin',
        status: 'Diterbitkan' as PengumumanItem['status'],
        attachment: null as string | null,
        thumbnailUrl: null as string | null,
    })

    const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null
    )
    const [submittingStatus, setSubmittingStatus] = useState<
        'Diterbitkan' | 'Draf' | 'Preview' | null
    >(null)
    const [formError, setFormError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const editFileInputRef = useRef<HTMLInputElement>(null)
    const thumbnailInputRef = useRef<HTMLInputElement>(null)
    const editThumbnailInputRef = useRef<HTMLInputElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [attachmentError, setAttachmentError] = useState(false)

    // ─── Filter & Search Logic ────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        const query = searchTerm.toLowerCase().trim()
        return pengumumanList.filter((item) => {
            const plainContent = stripHtmlTags(item.content).toLowerCase()
            const matchSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                plainContent.includes(query) ||
                item.author.name.toLowerCase().includes(query)

            const matchStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter

            let matchDate = true
            if (dateFilter === 'Bulan Ini') {
                const months: Record<string, number> = {
                    jan: 0,
                    feb: 1,
                    mar: 2,
                    apr: 3,
                    mei: 4,
                    jun: 5,
                    jul: 6,
                    agu: 7,
                    sep: 8,
                    okt: 9,
                    nov: 10,
                    des: 11,
                }
                const parts = item.date.trim().split(' ')
                if (parts.length === 3) {
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const itemMonth = months[mKey]
                    const itemYear = parseInt(parts[2], 10)
                    const now = new Date()
                    matchDate =
                        itemMonth === now.getMonth() &&
                        itemYear === now.getFullYear()
                }
            } else if (dateFilter === 'Pilih Tanggal (Kustom)') {
                const months: Record<string, number> = {
                    jan: 0,
                    feb: 1,
                    mar: 2,
                    apr: 3,
                    mei: 4,
                    jun: 5,
                    jul: 6,
                    agu: 7,
                    sep: 8,
                    okt: 9,
                    nov: 10,
                    des: 11,
                }
                const parts = item.date.trim().split(' ')
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10)
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const month = months[mKey] ?? 0
                    const year = parseInt(parts[2], 10)
                    const itemTimestamp = new Date(year, month, day).getTime()

                    if (startDate) {
                        const start = new Date(startDate).setHours(0, 0, 0, 0)
                        if (itemTimestamp < start) matchDate = false
                    }
                    if (endDate) {
                        const end = new Date(endDate).setHours(23, 59, 59, 999)
                        if (itemTimestamp > end) matchDate = false
                    }
                }
            }

            return matchSearch && matchStatus && matchDate
        })
    }, [
        pengumumanList,
        searchTerm,
        statusFilter,
        dateFilter,
        startDate,
        endDate,
    ])

    // Pagination Calculation
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

    // ─── Modal Handlers ───────────────────────────────────────────────────────
    const [nowWib, setNowWib] = useState<{ date: string; time: string } | null>(null)

    useEffect(() => {
        const getNowWib = () => extractWibParts()
        setNowWib(getNowWib())
        const id = setInterval(() => setNowWib(getNowWib()), 30000)
        return () => clearInterval(id)
    }, [])

    const handlePublishDateChange = (value: string) => {
        const now = extractWibParts()
        const clampedDate = value > now.date ? now.date : value
        setFormData((prev) => {
            const nextTime =
                clampedDate === now.date && prev.publishTime > now.time
                    ? now.time
                    : prev.publishTime
            return {
                ...prev,
                publishDate: clampedDate,
                publishTime: nextTime,
            }
        })
    }

    const handlePublishTimeChange = (value: string) => {
        const now = extractWibParts()
        setFormData((prev) => {
            const clampedTime =
                prev.publishDate === now.date && value > now.time ? now.time : value
            return {
                ...prev,
                publishTime: clampedTime,
            }
        })
    }

    const openAddModal = () => {
        setAttachmentError(false)
        setFormError(null)
        setAttachmentFile(null)
        setThumbnailFile(null)
        setThumbnailPreview(null)
        setSubmittingStatus(null)
        const now = extractWibParts()
        setFormData({
            title: '',
            content: '',
            publishDate: now.date,
            publishTime: now.time,
            authorName: 'Trias Firmansyah',
            authorRole: 'Admin',
            status: 'Diterbitkan',
            attachment: null,
            thumbnailUrl: null,
        })
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: PengumumanItem) => {
        setAttachmentError(false)
        setFormError(null)
        setAttachmentFile(null)
        setThumbnailFile(null)
        setThumbnailPreview(item.thumbnail_url || null)
        setSubmittingStatus(null)
        setEditingItem(item)

        const now = extractWibParts()
        let dateInput = parseIndoToDateInput(item.date) || now.date
        if (dateInput > now.date) {
            dateInput = now.date
        }
        let timeInput =
            item.time && item.time !== '-'
                ? item.time.replace(' WIB', '').trim()
                : now.time
        if (dateInput === now.date && timeInput > now.time) {
            timeInput = now.time
        }

        setFormData({
            title: item.title,
            content: item.content,
            publishDate: dateInput,
            publishTime: timeInput,
            authorName: item.author.name || 'Trias Firmansyah',
            authorRole: item.author.role || 'Admin',
            status: item.status,
            attachment: item.attachment_url || item.attachment,
            thumbnailUrl: item.thumbnail_url || null,
        })
    }

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowed = ['image/jpeg', 'image/jpg', 'image/png']
        if (!allowed.includes(file.type.toLowerCase())) {
            setFormError('Thumbnail hanya mendukung gambar format JPG atau PNG.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setFormError('Ukuran gambar thumbnail maksimal 5 MB.')
            return
        }

        setFormError(null)
        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview(null)
        setFormData((prev) => ({ ...prev, thumbnailUrl: null }))
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
        if (editThumbnailInputRef.current)
            editThumbnailInputRef.current.value = ''
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAttachmentFile(file)
            setFormData((prev) => ({ ...prev, attachment: file.name }))
            setAttachmentError(false)
            setFormError(null)
        }
    }

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.name.toLowerCase().endsWith('.pdf')) {
            setAttachmentFile(file)
            setFormData((prev) => ({ ...prev, attachment: file.name }))
            setAttachmentError(false)
            setFormError(null)
        }
    }

    const handleSaveAdd = (
        targetStatus: 'Diterbitkan' | 'Draf' = 'Diterbitkan',
        openPreview = false
    ) => {
        if (isPending) return

        const trimmedTitle = formData.title.trim()
        const plainContent = stripHtmlTags(formData.content)

        if (!trimmedTitle) {
            setFormError('Judul pengumuman wajib diisi.')
            return
        }
        if (!plainContent) {
            setFormError('Isi pengumuman wajib diisi.')
            return
        }
        if (!attachmentFile && !formData.attachment) {
            setAttachmentError(true)
            return
        }

        setAttachmentError(false)
        setFormError(null)
        setSubmittingStatus(openPreview ? 'Preview' : targetStatus)

        const payload = new FormData()
        payload.append('title', trimmedTitle)
        payload.append('content', formData.content)
        payload.append('status', targetStatus)
        payload.append('publish_date', formData.publishDate)
        payload.append('publish_time', formData.publishTime)

        if (thumbnailFile) {
            payload.append('thumbnail', thumbnailFile)
        } else if (formData.thumbnailUrl) {
            payload.append('existing_thumbnail_url', formData.thumbnailUrl)
        }

        if (attachmentFile) {
            payload.append('attachment', attachmentFile)
        } else if (formData.attachment) {
            payload.append('existing_attachment_url', formData.attachment)
        }

        startTransition(async () => {
            const result = await createPengumumanAction(payload)
            setSubmittingStatus(null)
            if (!result.success) {
                setFormError(
                    result.error || 'Gagal menyimpan pengumuman baru.'
                )
                return
            }

            if (openPreview && result.slug) {
                window.open(
                    `/pengumuman/${result.slug}?preview=true`,
                    '_blank',
                    'noopener,noreferrer'
                )
                setIsAddModalOpen(false)
                setFeedback({
                    type: 'success',
                    message:
                        'Draf pengumuman disimpan dan dibuka di tab pratinjau baru.',
                })
                router.refresh()
                return
            }

            setIsAddModalOpen(false)
            setFeedback({
                type: 'success',
                message:
                    targetStatus === 'Diterbitkan'
                        ? 'Pengumuman baru berhasil diterbitkan.'
                        : 'Draf pengumuman berhasil disimpan.',
            })
            router.refresh()
        })
    }

    const handleSaveEdit = (
        targetStatus: 'Diterbitkan' | 'Draf' = 'Diterbitkan',
        openPreview = false
    ) => {
        if (isPending || !editingItem) return

        const trimmedTitle = formData.title.trim()
        const plainContent = stripHtmlTags(formData.content)

        if (!trimmedTitle) {
            setFormError('Judul pengumuman wajib diisi.')
            return
        }
        if (!plainContent) {
            setFormError('Isi pengumuman wajib diisi.')
            return
        }
        if (!attachmentFile && !formData.attachment) {
            setAttachmentError(true)
            return
        }

        setAttachmentError(false)
        setFormError(null)
        setSubmittingStatus(openPreview ? 'Preview' : targetStatus)

        const payload = new FormData()
        payload.append('id', String(editingItem.id))
        payload.append('title', trimmedTitle)
        payload.append('content', formData.content)
        payload.append('status', targetStatus)
        payload.append('publish_date', formData.publishDate)
        payload.append('publish_time', formData.publishTime)

        if (thumbnailFile) {
            payload.append('thumbnail', thumbnailFile)
        } else if (formData.thumbnailUrl) {
            payload.append('existing_thumbnail_url', formData.thumbnailUrl)
        }

        if (attachmentFile) {
            payload.append('attachment', attachmentFile)
        } else if (formData.attachment) {
            payload.append('existing_attachment_url', formData.attachment)
        }

        startTransition(async () => {
            const result = await updatePengumumanAction(
                editingItem.id,
                payload
            )
            setSubmittingStatus(null)
            if (!result.success) {
                setFormError(
                    result.error || 'Gagal memperbarui pengumuman.'
                )
                return
            }

            if (openPreview && result.slug) {
                window.open(
                    `/pengumuman/${result.slug}?preview=true`,
                    '_blank',
                    'noopener,noreferrer'
                )
                setEditingItem(null)
                setFeedback({
                    type: 'success',
                    message:
                        'Perubahan pengumuman disimpan dan dibuka di tab pratinjau baru.',
                })
                router.refresh()
                return
            }

            setEditingItem(null)
            setFeedback({
                type: 'success',
                message:
                    targetStatus === 'Diterbitkan'
                        ? 'Perubahan pengumuman berhasil disimpan dan diterbitkan.'
                        : 'Draf pengumuman berhasil disimpan.',
            })
            router.refresh()
        })
    }

    const handleDelete = (id: number) => {
        if (isPending) return

        startTransition(async () => {
            const result = await deletePengumumanAction(id)
            if (!result.success) {
                setDeletingItem(null)
                setFeedback({
                    type: 'error',
                    message: result.error || 'Gagal menghapus pengumuman.',
                })
                return
            }

            setPengumumanList((prev) => prev.filter((item) => item.id !== id))
            setDeletingItem(null)
            setFeedback({
                type: 'success',
                message: 'Pengumuman berhasil dihapus.',
            })
            router.refresh()
        })
    }

    const handleUnpublish = (id: number) => {
        if (isPending) return

        startTransition(async () => {
            const result = await unpublishPengumumanAction(id)
            if (!result.success) {
                setUnpublishingItem(null)
                setFeedback({
                    type: 'error',
                    message:
                        result.error ||
                        'Gagal menurunkan penayangan pengumuman.',
                })
                return
            }

            setPengumumanList((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              status: 'Draf',
                          }
                        : item
                )
            )
            setUnpublishingItem(null)
            setFeedback({
                type: 'success',
                message: 'Pengumuman berhasil diturunkan ke draf.',
            })
            router.refresh()
        })
    }

    return (
        <div className="w-full space-y-6 pb-10">
            {/* NOTIFIKASI POP-UP TOAST */}
            {feedback && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`fixed top-6 right-6 z-[110] max-w-md w-[calc(100vw-3rem)] sm:w-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border text-[15px] font-semibold shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {feedback.type === 'success' ? (
                            <CheckCircle2
                                size={21}
                                className="shrink-0 text-emerald-600"
                                aria-hidden="true"
                            />
                        ) : (
                            <AlertCircle
                                size={21}
                                className="shrink-0 text-red-500"
                                aria-hidden="true"
                            />
                        )}
                        <span>{feedback.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        aria-label="Tutup notifikasi"
                        className="text-slate-500 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Kelola Pengumuman Resmi
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Distribusikan edaran, kebijakan, dan himbauan terkini secara luas kepada warga kota.
                    </p>
                </div>

                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tambah Pengumuman Baru</span>
                    </button>
                </div>
            </div>

            {/* 2. RINGKASAN STATISTIK */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Total Pengumuman</p>
                        <p className="text-xl font-bold text-[#172135]">{pengumumanList.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#159447] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Diterbitkan</p>
                        <p className="text-xl font-bold text-[#172135]">
                            {pengumumanList.filter((item) => item.status === 'Diterbitkan').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Pencil size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Draf</p>
                        <p className="text-xl font-bold text-[#172135]">
                            {pengumumanList.filter((item) => item.status === 'Draf').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. CARD PENCARIAN & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    {/* Input Search */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Cari judul pengumuman atau penulis..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Grup Dropdown Filter (Status & Rentang Waktu) */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Dropdown Status */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStatusOpen(!isStatusOpen)
                                    setIsDateOpen(false)
                                }}
                                className="flex items-center justify-between gap-3 min-w-[130px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                            >
                                <span className="truncate">{statusFilter}</span>
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
                                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30">
                                        {statusOptions.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(s)
                                                    setIsStatusOpen(false)
                                                    setCurrentPage(1)
                                                }}
                                                className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                                    statusFilter === s
                                                        ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dropdown Tanggal / Rentang Waktu */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDateOpen(!isDateOpen)
                                    setIsStatusOpen(false)
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#159447] hover:text-[#159447] transition-all whitespace-nowrap cursor-pointer"
                            >
                                <Calendar size={14} className="text-slate-500" />
                                <span>{dateFilter}</span>
                                <ChevronDown
                                    size={13}
                                    className={`text-slate-400 transition-transform duration-200 ${
                                        isDateOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {isDateOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setIsDateOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 text-xs">
                                        <div className="space-y-0.5">
                                            {[
                                                'Semua Waktu',
                                                'Bulan Ini',
                                                'Pilih Tanggal (Kustom)',
                                            ].map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => {
                                                        setDateFilter(opt)
                                                        if (
                                                            opt ===
                                                                'Semua Waktu' ||
                                                            opt === 'Bulan Ini'
                                                        ) {
                                                            setStartDate('')
                                                            setEndDate('')
                                                            setIsDateOpen(false)
                                                            setCurrentPage(1)
                                                        }
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                                        dateFilter === opt
                                                            ? 'text-[#159447] font-bold bg-[#f0fdf4]'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    <span>{opt}</span>
                                                    {dateFilter === opt && (
                                                        <Check
                                                            size={14}
                                                            className="text-[#159447]"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {dateFilter ===
                                            'Pilih Tanggal (Kustom)' && (
                                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600">
                                                        Mulai Tanggal
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) =>
                                                            setStartDate(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] bg-white mt-1 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600">
                                                        Sampai Tanggal
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) =>
                                                            setEndDate(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] bg-white mt-1 cursor-pointer"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDateOpen(false)
                                                        setCurrentPage(1)
                                                    }}
                                                    className="w-full mt-2 py-1.5 px-3 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer text-center shadow-xs"
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TABEL DATA PENGUMUMAN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-left">
                                    JUDUL PENGUMUMAN
                                </th>
                                <th className="py-4 px-4 text-center w-36">
                                    LAMPIRAN
                                </th>
                                <th className="py-4 px-4 text-center w-28">
                                    STATUS
                                </th>
                                <th className="py-4 px-4 text-left w-36">
                                    PUBLIKASI
                                </th>
                                <th className="py-4 px-4 text-left w-48">
                                    PENULIS
                                </th>
                                <th className="py-4 px-4 text-center w-28">
                                    AKSI
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-12 text-center text-slate-400"
                                    >
                                        Tidak ada pengumuman yang cocok dengan filter atau kata kunci.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 transition-colors group"
                                    >
                                        {/* NO */}
                                        <td className="py-4 px-4 text-center font-semibold text-slate-400 text-xs">
                                            {(currentPage - 1) * rowsPerPage +
                                                index +
                                                1}
                                        </td>

                                        {/* JUDUL PENGUMUMAN */}
                                        <td className="py-4 px-4 text-left">
                                            <a
                                                href={
                                                    item.status === 'Diterbitkan'
                                                        ? `/pengumuman/${item.slug}`
                                                        : `/pengumuman/${item.slug}?preview=true`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-[#172135] text-xs sm:text-[13px] hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 leading-relaxed"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </a>
                                        </td>

                                        {/* LAMPIRAN */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.attachment_url ||
                                            item.attachment ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewItem(item)
                                                    }
                                                    title={getAttachmentDisplayName(
                                                        item.attachment_url ||
                                                            item.attachment
                                                    )}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/90 hover:bg-slate-200 transition-colors cursor-pointer"
                                                >
                                                    <Paperclip
                                                        size={13}
                                                        className="text-slate-500 shrink-0"
                                                    />
                                                    <span>PDF</span>
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
                                                    Belum Ada
                                                </span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.status === 'Diterbitkan' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    Diterbitkan
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                                    Draf
                                                </span>
                                            )}
                                        </td>

                                        {/* PUBLIKASI */}
                                        <td className="py-4 px-4 text-left whitespace-nowrap">
                                            <div className="font-bold text-[#172135] text-xs">
                                                {item.date}
                                            </div>
                                            <div className="text-[11px] text-[#566276] mt-0.5">
                                                {item.time}
                                            </div>
                                        </td>

                                        {/* PENULIS */}
                                        <td className="py-4 px-4 text-left">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${item.author.avatarBg}`}
                                                >
                                                    {item.author.avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#172135] text-xs truncate">
                                                        {item.author.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#566276] truncate">
                                                        {item.author.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* 1. Mata (Lihat Detail / Pratinjau): Aktif HANYA jika status BUKAN 'Diterbitkan' */}
                                                {item.status !== 'Diterbitkan' ? (
                                                    <a
                                                        href={`/pengumuman/${item.slug}?preview=true`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Pratinjau Pengumuman"
                                                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#159447] hover:border-[#159447]/40 hover:bg-green-50/50 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={14} />
                                                    </a>
                                                ) : (
                                                    <div
                                                        title="Judul pengumuman dapat diklik untuk melihat detail pengumuman"
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

                                                {/* 2. Pena (Edit): SELALU AKTIF di semua status */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    title="Edit Pengumuman"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                {/* 3. Tong Sampah (Hapus): SELALU AKTIF di semua status */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletingItem(item)
                                                    }
                                                    title="Hapus Pengumuman"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                {/* 4. Unpublish (Turunkan Tayang): HANYA muncul jika status === 'Diterbitkan' */}
                                                {item.status === 'Diterbitkan' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setUnpublishingItem(
                                                                item
                                                            )
                                                        }
                                                        title="Turunkan Tayang ke Draf (Unpublish)"
                                                        className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Undo2 size={14} />
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

                {/* 4. FOOTER PAGINASI */}
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
                            pengumuman
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

            {/* 5. MODAL: TAMBAH PENGUMUMAN BARU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#159447] flex items-center justify-center shrink-0">
                                    <Megaphone size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Tambah Pengumuman Baru
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Publikasikan edaran atau kebijakan kedinasan daerah.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={isPending}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveAdd('Diterbitkan')
                            }}
                            className="space-y-4 text-xs"
                        >
                            {/* 1. Judul Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Pengumuman{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Jadwal Pemadaman Listrik Sementara..."
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Isi Pengumuman (Rich Text Editor) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Isi Pengumuman{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(html) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            content: html,
                                        }))
                                    }
                                    placeholder="Tuliskan naskah pengumuman atau instruksi edaran selengkapnya di sini..."
                                />
                            </div>

                            {/* 3. Thumbnail Kartu Depan (thumbnail_url) */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-semibold text-[#172135]">
                                        Gambar Thumbnail (JPG/PNG)
                                    </label>
                                    <span className="text-[11px] font-medium text-slate-500">
                                        Hanya untuk gambar kartu depan
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    ref={thumbnailInputRef}
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                                {thumbnailPreview ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Preview thumbnail"
                                                className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {thumbnailFile?.name ||
                                                        getAttachmentDisplayName(
                                                            formData.thumbnailUrl
                                                        )}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    Hanya untuk gambar kartu depan
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveThumbnail}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Hapus thumbnail"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() =>
                                            thumbnailInputRef.current?.click()
                                        }
                                        className="border-2 border-dashed border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300 rounded-xl p-3.5 text-center cursor-pointer transition-all"
                                    >
                                        <ImageIcon
                                            size={18}
                                            className="mx-auto mb-1 text-slate-400"
                                        />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Klik untuk memilih gambar thumbnail{' '}
                                            <span className="text-[#159447] underline">
                                                (JPG / PNG)
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            Hanya untuk gambar kartu depan • Format JPG/PNG (Maks. 5 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 4. Jadwal Publikasi Publik (Grid 2 Kolom) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Jadwal Publikasi Publik
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Tanggal Publikasi
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.publishDate}
                                            max={nowWib?.date || extractWibParts().date}
                                            onChange={(e) =>
                                                handlePublishDateChange(e.target.value)
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Waktu Publikasi (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.publishTime}
                                            max={
                                                (nowWib?.date || extractWibParts().date) === formData.publishDate
                                                    ? (nowWib?.time || extractWibParts().time)
                                                    : undefined
                                            }
                                            onChange={(e) =>
                                                handlePublishTimeChange(e.target.value)
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                    Tanggal & waktu tidak boleh melebihi waktu saat ini.
                                </p>
                            </div>

                            {/* 5. Lampiran Dokumen (PDF) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Lampiran Dokumen (PDF){' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {formData.attachment ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {getAttachmentDisplayName(
                                                        formData.attachment
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    Dokumen PDF Terlampir
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttachmentFile(null)
                                                setFormData({
                                                    ...formData,
                                                    attachment: null,
                                                })
                                                if (fileInputRef.current)
                                                    fileInputRef.current.value =
                                                        ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Hapus berkas"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                            attachmentError &&
                                            !formData.attachment
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                  ? 'border-[#159447] bg-[#f0fdf4]'
                                                  : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud
                                            size={20}
                                            className={`mx-auto mb-1.5 ${
                                                attachmentError &&
                                                !formData.attachment
                                                    ? 'text-red-400'
                                                    : 'text-slate-400'
                                            }`}
                                        />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau{' '}
                                            <span className="text-[#159447] underline">
                                                klik untuk memilih
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            <span className="text-red-500 font-semibold">
                                                Wajib dilampirkan
                                            </span>{' '}
                                            • Format PDF (Maks. 10 MB)
                                        </p>
                                    </div>
                                )}
                                {attachmentError && !formData.attachment && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle
                                            size={13}
                                            className="shrink-0"
                                        />
                                        Berkas dokumen lampiran (PDF) wajib diunggah.
                                    </p>
                                )}
                            </div>

                            {/* 6. Penulis / Admin (Read-only) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Penulis / Admin
                                </label>
                                <div className="flex items-center gap-3 px-3.5 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#172135] truncate">
                                            {formData.authorName ||
                                                'Trias Firmansyah'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {formData.authorRole || 'Admin'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                    Terisi otomatis dari sesi admin yang sedang aktif.
                                </p>
                            </div>

                            {/* 7. Status Publikasi & Aksi */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                <label className="block font-semibold text-[#172135]">
                                    Status Publikasi
                                </label>

                                {/* Tombol Utama: Terbitkan Pengumuman */}
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleSaveAdd('Diterbitkan')}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    {isPending && submittingStatus === 'Diterbitkan' ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Terbitkan Pengumuman</span>
                                        </>
                                    )}
                                </button>

                                {/* Secondary Action Buttons: Simpan Draf & Pratinjau */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleSaveAdd('Draf')}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending && submittingStatus === 'Draf' ? (
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
                                        disabled={isPending}
                                        onClick={() => handleSaveAdd('Draf', true)}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending && submittingStatus === 'Preview' ? (
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

                            {/* Tombol Batal Modal */}
                            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    disabled={isPending}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. MODAL: EDIT PENGUMUMAN */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#159447] flex items-center justify-center shrink-0">
                                    <Pencil size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Edit Pengumuman
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Perbarui data pengumuman nomor #{editingItem.no}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                disabled={isPending}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveEdit(editingItem.status)
                            }}
                            className="space-y-4 text-xs"
                        >
                            {/* 1. Judul Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Pengumuman{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Isi Pengumuman (Rich Text Editor) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Isi Pengumuman{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(html) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            content: html,
                                        }))
                                    }
                                    placeholder="Tuliskan naskah pengumuman atau instruksi edaran selengkapnya di sini..."
                                />
                            </div>

                            {/* 3. Thumbnail Kartu Depan (thumbnail_url) */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-semibold text-[#172135]">
                                        Gambar Thumbnail (JPG/PNG)
                                    </label>
                                    <span className="text-[11px] font-medium text-slate-500">
                                        Hanya untuk gambar kartu depan
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    ref={editThumbnailInputRef}
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                                {thumbnailPreview ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Preview thumbnail"
                                                className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {thumbnailFile?.name ||
                                                        getAttachmentDisplayName(
                                                            formData.thumbnailUrl
                                                        )}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    Hanya untuk gambar kartu depan
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveThumbnail}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Hapus thumbnail"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() =>
                                            editThumbnailInputRef.current?.click()
                                        }
                                        className="border-2 border-dashed border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300 rounded-xl p-3.5 text-center cursor-pointer transition-all"
                                    >
                                        <ImageIcon
                                            size={18}
                                            className="mx-auto mb-1 text-slate-400"
                                        />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Klik untuk memilih gambar thumbnail{' '}
                                            <span className="text-[#159447] underline">
                                                (JPG / PNG)
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            Hanya untuk gambar kartu depan • Format JPG/PNG (Maks. 5 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 4. Jadwal Publikasi Publik (Grid 2 Kolom) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Jadwal Publikasi Publik
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Tanggal Publikasi
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.publishDate}
                                            max={nowWib?.date || extractWibParts().date}
                                            onChange={(e) =>
                                                handlePublishDateChange(e.target.value)
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Waktu Publikasi (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.publishTime}
                                            max={
                                                (nowWib?.date || extractWibParts().date) === formData.publishDate
                                                    ? (nowWib?.time || extractWibParts().time)
                                                    : undefined
                                            }
                                            onChange={(e) =>
                                                handlePublishTimeChange(e.target.value)
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                    Tanggal & waktu tidak boleh melebihi waktu saat ini.
                                </p>
                            </div>

                            {/* 5. Lampiran Dokumen (PDF) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Lampiran Dokumen (PDF){' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    ref={editFileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {formData.attachment ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {getAttachmentDisplayName(
                                                        formData.attachment
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    Dokumen PDF Terlampir
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttachmentFile(null)
                                                setFormData({
                                                    ...formData,
                                                    attachment: null,
                                                })
                                                if (editFileInputRef.current)
                                                    editFileInputRef.current.value =
                                                        ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Hapus berkas"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
                                        onClick={() =>
                                            editFileInputRef.current?.click()
                                        }
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                            attachmentError &&
                                            !formData.attachment
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                  ? 'border-[#159447] bg-[#f0fdf4]'
                                                  : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud
                                            size={20}
                                            className={`mx-auto mb-1.5 ${
                                                attachmentError &&
                                                !formData.attachment
                                                    ? 'text-red-400'
                                                    : 'text-slate-400'
                                            }`}
                                        />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau{' '}
                                            <span className="text-[#159447] underline">
                                                klik untuk memilih
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            <span className="text-red-500 font-semibold">
                                                Wajib dilampirkan
                                            </span>{' '}
                                            • Format PDF (Maks. 10 MB)
                                        </p>
                                    </div>
                                )}
                                {attachmentError && !formData.attachment && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle
                                            size={13}
                                            className="shrink-0"
                                        />
                                        Berkas dokumen lampiran (PDF) wajib diunggah.
                                    </p>
                                )}
                            </div>

                            {/* 6. Penulis / Admin (Read-only) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Penulis / Admin
                                </label>
                                <div className="flex items-center gap-3 px-3.5 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#172135] truncate">
                                            {formData.authorName ||
                                                'Trias Firmansyah'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {formData.authorRole || 'Admin'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                    Terisi otomatis dari sesi admin yang sedang aktif.
                                </p>
                            </div>

                            {/* 7. Status Publikasi & Aksi */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                <label className="block font-semibold text-[#172135]">
                                    Status Publikasi
                                </label>

                                {/* Tombol Utama: Terbitkan / Simpan & Perbarui Tayangan */}
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleSaveEdit('Diterbitkan')}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    {isPending && submittingStatus === 'Diterbitkan' ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>
                                                {editingItem.status === 'Diterbitkan'
                                                    ? 'Simpan & Perbarui Tayangan'
                                                    : 'Terbitkan Pengumuman'}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Secondary Action Buttons: Simpan Draf & Pratinjau */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleSaveEdit('Draf')}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending && submittingStatus === 'Draf' ? (
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
                                        disabled={isPending}
                                        onClick={() => handleSaveEdit(editingItem.status, true)}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending && submittingStatus === 'Preview' ? (
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

                            {/* Tombol Batal Modal */}
                            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    disabled={isPending}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 7. MODAL: LIHAT / PREVIEW DETAIL PENGUMUMAN */}
            {previewItem && (
                <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                                        previewItem.status === 'Diterbitkan'
                                            ? 'bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a]'
                                            : 'bg-[#fffbeb] border border-[#fef3c7] text-[#d97706]'
                                    }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            previewItem.status === 'Diterbitkan'
                                                ? 'bg-[#16a34a]'
                                                : 'bg-[#d97706]'
                                        }`}
                                    />
                                    {previewItem.status}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {previewItem.date} ({previewItem.time})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Judul & Penulis */}
                        <div>
                            <h2 className="text-lg font-bold text-[#172135] tracking-tight leading-snug">
                                {previewItem.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${previewItem.author.avatarBg}`}
                                >
                                    {previewItem.author.avatar}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">
                                    {previewItem.author.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    ({previewItem.author.role})
                                </span>
                            </div>
                        </div>

                        {/* Preview Berkas PDF Lampiran */}
                        {(() => {
                            let pdfUrl =
                                previewItem.attachment_url ||
                                previewItem.attachment ||
                                ''
                            if (pdfUrl) {
                                pdfUrl = pdfUrl
                                    .replace('https://portal.sukabumikota.go.id', '')
                                    .replace('http://portal.sukabumikota.go.id', '')
                            }
                            return pdfUrl ? (
                                <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col shadow-inner">
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full flex-1 border-0"
                                        title={`Lampiran - ${previewItem.title}`}
                                    />
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                                    Berkas lampiran PDF tidak ditemukan.
                                </div>
                            )
                        })()}

                        {/* Footer Modal */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            {(() => {
                                const rawUrl =
                                    previewItem.attachment_url ||
                                    previewItem.attachment ||
                                    ''
                                const pdfUrl = rawUrl
                                    ? rawUrl
                                          .replace('https://portal.sukabumikota.go.id', '')
                                          .replace('http://portal.sukabumikota.go.id', '')
                                    : null
                                return pdfUrl ? (
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#159447] bg-white px-4 py-2 text-xs font-bold text-[#159447] transition-all hover:bg-[#f0fdf4] hover:shadow-xs active:scale-[0.99] cursor-pointer"
                                    >
                                        <span>Buka di Tab Baru</span>
                                        <ExternalLink size={14} className="stroke-[2.2]" />
                                    </a>
                                ) : (
                                    <div />
                                )
                            })()}
                            {/* <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-[#566276] cursor-pointer"
                            >
                                Tutup
                            </button> */}
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: KONFIRMASI HAPUS */}
            {deletingItem !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        if (!isPending) setDeletingItem(null)
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 text-red-600">
                                <Trash2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                                Konfirmasi Hapus
                            </h3>

                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menghapus pengumuman ini?
                            </p>

                            {deletingItem.title && (
                                <p className="mb-6 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{deletingItem.title}&rdquo;
                                </p>
                            )}

                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setDeletingItem(null)}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Tidak
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleDelete(deletingItem.id)}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-white"
                                            />
                                            <span>Menghapus...</span>
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

            {/* 9. MODAL: KONFIRMASI TURUNKAN PENGUMUMAN (UNPUBLISH) */}
            {unpublishingItem !== null && (
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
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100 text-amber-600">
                                <Undo2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                                Konfirmasi Turunkan Pengumuman
                            </h3>

                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menurunkan pengumuman ini kembali ke draf?
                            </p>

                            {unpublishingItem.title && (
                                <p className="mb-6 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{unpublishingItem.title}&rdquo;
                                </p>
                            )}

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
                                    onClick={() => handleUnpublish(unpublishingItem.id)}
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
        </div>
    )
}

