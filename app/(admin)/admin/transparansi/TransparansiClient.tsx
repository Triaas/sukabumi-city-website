'use client'

import { useState, useMemo, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ToastNotification from '@/components/ToastNotification'
import ConfirmSaveDraftModal from '@/components/ConfirmSaveDraftModal'
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
    UploadCloud,
    Loader2,
    Send,
    Save,
} from 'lucide-react'
import {
    createTransparansiAction,
    updateTransparansiAction,
    deleteTransparansiAction,
    unpublishTransparansiAction,
    type TransparansiItem,
} from '@/lib/transparansi/actions'

export type { TransparansiItem }

export const initialTransparansi: TransparansiItem[] = []

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

const monthMap: Record<string, number> = {
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

function getTodayDateWIB(): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date())

    const year = parts.find((p) => p.type === 'year')?.value || ''
    const month = parts.find((p) => p.type === 'month')?.value || ''
    const day = parts.find((p) => p.type === 'day')?.value || ''

    return `${year}-${month}-${day}`
}

function parseIndoToDateInput(indoStr: string): string {
    if (!indoStr || indoStr === '-') return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(indoStr.trim())) return indoStr.trim()
    const parts = indoStr.trim().split(' ')
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const mKey = parts[1].toLowerCase().slice(0, 3)
        const monthNum =
            monthMap[mKey] !== undefined
                ? String(monthMap[mKey] + 1).padStart(2, '0')
                : '01'
        const year = parts[2]
        return `${year}-${monthNum}-${day}`
    }
    return ''
}

function formatYmdToIndoShort(ymd: string): string {
    if (!ymd) return '-'
    const parts = ymd.trim().split('-')
    if (parts.length === 3) {
        const year = parts[0]
        const monthIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        return `${String(day).padStart(2, '0')} ${indonesianMonths[monthIdx] || parts[1]} ${year}`
    }
    return ymd
}

function parseDateToTimestamp(dateStr: string): number {
    if (!dateStr || dateStr === '-') return 0
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
        return new Date(`${dateStr.trim()}T00:00:00+07:00`).getTime()
    }
    const parts = dateStr.trim().split(' ')
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const mKey = parts[1].toLowerCase().slice(0, 3)
        const month = monthMap[mKey] ?? 0
        const year = parseInt(parts[2], 10)
        return new Date(year, month, day).getTime()
    }
    return 0
}

function getPdfDisplayName(pathOrName: string | null | undefined): string {
    if (!pathOrName) return ''
    const parts = pathOrName.split('/')
    return parts[parts.length - 1] || pathOrName
}

interface TransparansiClientProps {
    initialData: TransparansiItem[]
}

export default function TransparansiClient({
    initialData,
}: TransparansiClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [transparansiList, setTransparansiList] =
        useState<TransparansiItem[]>(initialData)

    useEffect(() => {
        setTransparansiList(initialData)
    }, [initialData])

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    const [dateFilter, setDateFilter] = useState('Semua Waktu')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDateOpen, setIsDateOpen] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [previewItem, setPreviewItem] = useState<TransparansiItem | null>(null)
    const [attachmentPreviewItem, setAttachmentPreviewItem] =
        useState<TransparansiItem | null>(null)
    const [editingItem, setEditingItem] = useState<TransparansiItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<TransparansiItem | null>(null)
    const [unpublishingItem, setUnpublishingItem] =
        useState<TransparansiItem | null>(null)
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
    const [editInitialSnapshot, setEditInitialSnapshot] = useState<{
        title: string
        effectiveDate: string
        description: string
        pdfFile: string
    } | null>(null)

    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const [todayWib, setTodayWib] = useState<string>(() => getTodayDateWIB())

    useEffect(() => {
        setTodayWib(getTodayDateWIB())
        const id = setInterval(() => setTodayWib(getTodayDateWIB()), 30000)
        return () => clearInterval(id)
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        effectiveDate: '',
        description: '',
        status: 'Diterbitkan' as TransparansiItem['status'],
        pdfFile: '',
    })

    const [pdfFileObj, setPdfFileObj] = useState<File | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [pdfError, setPdfError] = useState(false)
    const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null)
    const [submittingStatus, setSubmittingStatus] = useState<
        'Diterbitkan' | 'Draf' | 'Preview' | null
    >(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const editFileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (previewItem) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [previewItem])

    const hasEditChanges = Boolean(
        editingItem &&
            editInitialSnapshot &&
            (formData.title !== editInitialSnapshot.title ||
                formData.effectiveDate !== editInitialSnapshot.effectiveDate ||
                formData.description !== editInitialSnapshot.description ||
                pdfFileObj !== null ||
                formData.pdfFile !== editInitialSnapshot.pdfFile)
    )

    const hasAddChanges = Boolean(
        isAddModalOpen &&
            (formData.title.trim().length > 0 ||
                formData.description.trim().length > 0 ||
                pdfFileObj !== null ||
                formData.pdfFile.trim().length > 0)
    )

    const requestCloseAddModal = () => {
        if (isPending) return
        if (hasAddChanges) {
            setIsExitConfirmOpen(true)
            return
        }
        setIsAddModalOpen(false)
    }

    const requestCloseEditModal = () => {
        if (isPending) return
        if (hasEditChanges) {
            setIsExitConfirmOpen(true)
            return
        }
        setEditingItem(null)
        setEditInitialSnapshot(null)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || isPending) return
            if (isExitConfirmOpen) setIsExitConfirmOpen(false)
            else if (unpublishingItem) setUnpublishingItem(null)
            else if (deletingItem) setDeletingItem(null)
            else if (attachmentPreviewItem) setAttachmentPreviewItem(null)
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
        attachmentPreviewItem,
        previewItem,
        editingItem,
        isAddModalOpen,
        hasEditChanges,
        hasAddChanges,
    ])

    const filteredData = useMemo(() => {
        const query = searchTerm.toLowerCase().trim()
        return transparansiList.filter((item) => {
            const matchSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                (item.description &&
                    item.description.toLowerCase().includes(query))

            const matchStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter

            let matchDate = true
            if (dateFilter === 'Bulan Ini') {
                const ymd =
                    item.effective_date ||
                    parseIndoToDateInput(item.effectiveDate)
                if (ymd) {
                    const [yStr, mStr] = ymd.split('-')
                    const currentWib = getTodayDateWIB().split('-')
                    matchDate =
                        yStr === currentWib[0] && mStr === currentWib[1]
                }
            } else if (dateFilter === 'Pilih Tanggal (Kustom)') {
                const itemTimestamp = parseDateToTimestamp(
                    item.effective_date || item.effectiveDate
                )
                if (startDate) {
                    const start = new Date(`${startDate}T00:00:00+07:00`).getTime()
                    if (itemTimestamp < start) matchDate = false
                }
                if (endDate) {
                    const end = new Date(`${endDate}T23:59:59.999+07:00`).getTime()
                    if (itemTimestamp > end) matchDate = false
                }
            }

            return matchSearch && matchStatus && matchDate
        })
    }, [
        transparansiList,
        searchTerm,
        statusFilter,
        dateFilter,
        startDate,
        endDate,
    ])

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
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

    const handlePrevDocument = () => {
        if (previewItem) {
            const currentIndex = transparansiList.findIndex(
                (doc) => doc.id === previewItem.id
            )
            if (currentIndex > 0) {
                setPreviewItem(transparansiList[currentIndex - 1])
            }
        }
    }

    const handleNextDocument = () => {
        if (previewItem) {
            const currentIndex = transparansiList.findIndex(
                (doc) => doc.id === previewItem.id
            )
            if (currentIndex < transparansiList.length - 1) {
                setPreviewItem(transparansiList[currentIndex + 1])
            }
        }
    }

    const getCurrentDocumentIndex = () => {
        if (previewItem) {
            return (
                transparansiList.findIndex((doc) => doc.id === previewItem.id) +
                1
            )
        }
        return 0
    }

    const handleEffectiveDateChange = (value: string) => {
        const maxDate = getTodayDateWIB()
        const clamped = value && value > maxDate ? maxDate : value
        setFormData((prev) => ({
            ...prev,
            effectiveDate: clamped,
        }))
    }

    const openAddModal = () => {
        const maxDate = getTodayDateWIB()
        setTodayWib(maxDate)
        setFormError(null)
        setPdfError(false)
        setPdfFileObj(null)
        setFormData({
            title: '',
            effectiveDate: maxDate,
            description: '',
            status: 'Diterbitkan',
            pdfFile: '',
        })
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: TransparansiItem) => {
        const maxDate = getTodayDateWIB()
        setTodayWib(maxDate)
        setFormError(null)
        setPdfError(false)
        setPdfFileObj(null)
        setIsExitConfirmOpen(false)
        setEditingItem(item)

        let dateInput =
            item.effective_date ||
            parseIndoToDateInput(item.effectiveDate) ||
            maxDate
        if (dateInput > maxDate) {
            dateInput = maxDate
        }

        const initialPdfFile = item.pdf_url || item.pdfFile
        const initialDesc = item.description || ''
        setEditInitialSnapshot({
            title: item.title,
            effectiveDate: dateInput,
            description: initialDesc,
            pdfFile: initialPdfFile,
        })

        setFormData({
            title: item.title,
            effectiveDate: dateInput,
            description: initialDesc,
            status: item.status,
            pdfFile: initialPdfFile,
        })
    }

    const isPdfFile = (file: File) =>
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!isPdfFile(file)) {
            e.target.value = ''
            setPdfError(true)
            setPdfErrorMessage(
                'Hanya berkas dengan format .pdf yang diperbolehkan.'
            )
            return
        }
        setPdfFileObj(file)
        setFormData((prev) => ({ ...prev, pdfFile: file.name }))
        setPdfError(false)
        setPdfErrorMessage(null)
        setFormError(null)
    }

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        if (!isPdfFile(file)) {
            setPdfError(true)
            setPdfErrorMessage(
                'Hanya berkas dengan format .pdf yang diperbolehkan.'
            )
            return
        }
        setPdfFileObj(file)
        setFormData((prev) => ({ ...prev, pdfFile: file.name }))
        setPdfError(false)
        setPdfErrorMessage(null)
        setFormError(null)
    }

    const buildValidatedPayload = (
        targetStatus: 'Diterbitkan' | 'Draf'
    ): {
        payload: FormData
        trimmedTitle: string
        trimmedDesc: string
        trimmedDate: string
    } | null => {
        const isDraft = targetStatus === 'Draf'
        const rawTitle = formData.title.trim()
        const trimmedTitle =
            rawTitle || (isDraft ? '(Draf Dokumen Tanpa Judul)' : '')
        const trimmedDesc = formData.description.trim()
        const rawDate = formData.effectiveDate.trim()
        const maxDate = getTodayDateWIB()
        const trimmedDate = rawDate || (isDraft ? maxDate : '')

        if (!isDraft) {
            if (!trimmedTitle) {
                setFormError('Judul dokumen wajib diisi.')
                return null
            }
            if (!trimmedDate) {
                setFormError('Tanggal pemberlakuan wajib diisi.')
                return null
            }
            if (trimmedDate > maxDate) {
                setFormError(
                    'Tanggal pemberlakuan tidak boleh melebihi tanggal hari ini (WIB).'
                )
                return null
            }
            if (!trimmedDesc) {
                setFormError('Deskripsi program wajib diisi.')
                return null
            }
            if (!pdfFileObj && !formData.pdfFile.trim()) {
                setPdfError(true)
                setPdfErrorMessage('Berkas dokumen PDF wajib diunggah.')
                return null
            }
        } else if (trimmedDate > maxDate) {
            setFormError(
                'Tanggal pemberlakuan tidak boleh melebihi tanggal hari ini (WIB).'
            )
            return null
        }

        setPdfError(false)
        setPdfErrorMessage(null)
        setFormError(null)

        const payload = new FormData()
        payload.append('title', trimmedTitle)
        payload.append('description', trimmedDesc)
        payload.append('effective_date', trimmedDate)
        payload.append('status', targetStatus)

        if (pdfFileObj) {
            payload.append('pdf_file', pdfFileObj)
        } else if (formData.pdfFile) {
            payload.append('existing_pdf_url', formData.pdfFile)
        }

        return { payload, trimmedTitle, trimmedDesc, trimmedDate }
    }

    const handleSaveAdd = (
        targetStatus: 'Diterbitkan' | 'Draf' = 'Diterbitkan',
        openPreview = false
    ) => {
        if (isPending) return

        const validated = buildValidatedPayload(targetStatus)
        if (!validated) {
            setIsExitConfirmOpen(false)
            return
        }

        const { payload, trimmedTitle, trimmedDesc, trimmedDate } = validated
        setSubmittingStatus(openPreview ? 'Preview' : targetStatus)

        startTransition(async () => {
            const result = await createTransparansiAction(payload)
            setSubmittingStatus(null)
            if (!result.success) {
                setIsExitConfirmOpen(false)
                setFormError(
                    result.error || 'Gagal menyimpan dokumen transparansi baru.'
                )
                return
            }

            setIsExitConfirmOpen(false)
            setIsAddModalOpen(false)

            if (openPreview) {
                const resolvedPdfUrl = result.pdf_url || formData.pdfFile
                setPreviewItem({
                    id: result.id ?? Date.now(),
                    no: String(result.id ?? 0).padStart(2, '0'),
                    title: trimmedTitle,
                    slug: result.slug || '',
                    description: trimmedDesc,
                    effective_date: trimmedDate,
                    effectiveDate: formatYmdToIndoShort(trimmedDate),
                    pdf_url: resolvedPdfUrl,
                    pdfFile: resolvedPdfUrl,
                    status: targetStatus,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                setFeedback({
                    type: 'success',
                    message:
                        'Draf dokumen disimpan dan dibuka dalam mode pratinjau.',
                })
                router.refresh()
                return
            }

            setFeedback({
                type: 'success',
                message:
                    targetStatus === 'Diterbitkan'
                        ? 'Dokumen transparansi berhasil diterbitkan.'
                        : 'Draf dokumen transparansi berhasil disimpan.',
            })
            router.refresh()
        })
    }

    const handleSaveEdit = (
        targetStatus: 'Diterbitkan' | 'Draf' = 'Diterbitkan',
        openPreview = false
    ) => {
        if (isPending || !editingItem) return

        const validated = buildValidatedPayload(targetStatus)
        if (!validated) {
            setIsExitConfirmOpen(false)
            return
        }

        const { payload, trimmedTitle, trimmedDesc, trimmedDate } = validated
        payload.append('id', String(editingItem.id))
        setSubmittingStatus(openPreview ? 'Preview' : targetStatus)

        startTransition(async () => {
            const result = await updateTransparansiAction(
                editingItem.id,
                payload
            )
            setSubmittingStatus(null)
            if (!result.success) {
                setIsExitConfirmOpen(false)
                setFormError(
                    result.error || 'Gagal memperbarui dokumen transparansi.'
                )
                return
            }

            const currentItem = editingItem
            setIsExitConfirmOpen(false)
            setEditingItem(null)
            setEditInitialSnapshot(null)

            if (openPreview) {
                const resolvedPdfUrl =
                    result.pdf_url ||
                    formData.pdfFile ||
                    currentItem.pdf_url
                setPreviewItem({
                    ...currentItem,
                    title: trimmedTitle,
                    slug: result.slug || currentItem.slug,
                    description: trimmedDesc,
                    effective_date: trimmedDate,
                    effectiveDate: formatYmdToIndoShort(trimmedDate),
                    pdf_url: resolvedPdfUrl,
                    pdfFile: resolvedPdfUrl,
                    status: targetStatus,
                })
                setFeedback({
                    type: 'success',
                    message:
                        'Perubahan dokumen disimpan dan dibuka dalam mode pratinjau.',
                })
                router.refresh()
                return
            }

            setFeedback({
                type: 'success',
                message:
                    targetStatus === 'Diterbitkan'
                        ? 'Perubahan dokumen berhasil disimpan dan diterbitkan.'
                        : 'Draf dokumen transparansi berhasil disimpan.',
            })
            router.refresh()
        })
    }

    const handleDelete = (id: number) => {
        if (isPending) return

        startTransition(async () => {
            const result = await deleteTransparansiAction(id)
            if (!result.success) {
                setDeletingItem(null)
                setFeedback({
                    type: 'error',
                    message:
                        result.error || 'Gagal menghapus dokumen transparansi.',
                })
                return
            }

            setTransparansiList((prev) => prev.filter((item) => item.id !== id))
            setDeletingItem(null)
            setFeedback({
                type: 'success',
                message: 'Dokumen transparansi berhasil dihapus.',
            })
            router.refresh()
        })
    }

    const handleUnpublish = (id: number) => {
        if (isPending) return

        startTransition(async () => {
            const result = await unpublishTransparansiAction(id)
            if (!result.success) {
                setUnpublishingItem(null)
                setFeedback({
                    type: 'error',
                    message:
                        result.error ||
                        'Gagal menurunkan penayangan dokumen transparansi.',
                })
                return
            }

            setTransparansiList((prev) =>
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
                message: 'Dokumen transparansi berhasil diturunkan ke draf.',
            })
            router.refresh()
        })
    }

    return (
        <div className="w-full space-y-6 pb-10">
            <ToastNotification
                message={feedback?.message}
                type={feedback?.type}
                onClose={() => setFeedback(null)}
            />

            {/* Header halaman & tombol tambah */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Transparansi Dokumen
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Kelola arsip dan dokumen transparansi daerah
                    </p>
                </div>

                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle
                            size={17}
                            className="stroke-[2.2] text-white"
                            aria-hidden="true"
                        />
                        <span className="text-white">Tambah Dokumen</span>
                    </button>
                </div>
            </div>

            {/* Ringkasan Statistik (Total Dokumen, Diterbitkan, Draf) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Total Dokumen
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {transparansiList.length}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#159447] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Diterbitkan
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {
                                transparansiList.filter(
                                    (item) => item.status === 'Diterbitkan'
                                ).length
                            }
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Pencil size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">
                            Draf
                        </p>
                        <p className="text-xl font-bold text-[#172135]">
                            {
                                transparansiList.filter(
                                    (item) => item.status === 'Draf'
                                ).length
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Card Pencarian & Filter */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            aria-label="Cari judul dokumen"
                            placeholder="Cari judul dokumen..."
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
                                aria-label="Bersihkan pencarian"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCurrentPage(1)
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>

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
                                <span className="flex items-center gap-2 truncate">
                                    <CheckCircle2 size={14} className="shrink-0 text-slate-500" aria-hidden="true" />
                                    <span className="truncate">{statusFilter}</span>
                                </span>
                                <ChevronDown
                                    size={14}
                                    aria-hidden="true"
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

                        {/* Dropdown Rentang Waktu */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDateOpen(!isDateOpen)
                                    setIsStatusOpen(false)
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#159447] hover:text-[#159447] transition-all whitespace-nowrap cursor-pointer"
                            >
                                <Calendar
                                    size={14}
                                    className="text-slate-500"
                                    aria-hidden="true"
                                />
                                <span>{dateFilter}</span>
                                <ChevronDown
                                    size={13}
                                    aria-hidden="true"
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
                                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
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
                                                            aria-hidden="true"
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
                                                    style={{
                                                        backgroundColor:
                                                            '#159447',
                                                    }}
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {(Boolean(searchTerm.trim()) ||
                            statusFilter !== 'Semua Status' ||
                            dateFilter !== 'Semua Waktu') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('')
                                    setStatusFilter('Semua Status')
                                    setDateFilter('Semua Waktu')
                                    setStartDate('')
                                    setEndDate('')
                                    setIsStatusOpen(false)
                                    setIsDateOpen(false)
                                    setCurrentPage(1)
                                }}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabel Dokumen Transparansi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-left">
                                    JUDUL
                                </th>
                                <th className="py-4 px-4 text-center w-36">
                                    LAMPIRAN
                                </th>
                                <th className="py-4 px-4 text-center w-28">
                                    STATUS
                                </th>
                                <th className="py-4 px-4 text-left w-44">
                                    TANGGAL BERLAKU
                                </th>
                                <th className="py-4 px-4 text-center w-32">
                                    AKSI
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-12 text-center text-slate-400"
                                    >
                                        Tidak ada dokumen transparansi yang cocok dengan filter atau kata kunci. Tambahkan dokumen baru atau sesuaikan kata kunci pencarian.
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

                                        {/* JUDUL DOKUMEN */}
                                        <td className="py-4 px-4 text-left">
                                            {item.status === 'Diterbitkan' ? (
                                                <a
                                                    href="/#transparansi"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-[#172135] text-xs sm:text-[13px] leading-relaxed hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 block"
                                                    title={item.title}
                                                >
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    className="text-left font-bold text-[#172135] text-xs sm:text-[13px] leading-relaxed hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 block"
                                                    title="Klik untuk mengedit draf dokumen"
                                                >
                                                    {item.title}
                                                </button>
                                            )}
                                        </td>

                                        {/* LAMPIRAN */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.pdf_url || item.pdfFile ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setAttachmentPreviewItem(
                                                            item
                                                        )
                                                    }
                                                    title={getPdfDisplayName(
                                                        item.pdf_url ||
                                                            item.pdfFile
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
                                                <span className="text-xs text-slate-400">
                                                    -
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

                                        {/* TANGGAL BERLAKU */}
                                        <td className="py-4 px-4 text-left whitespace-nowrap">
                                            <span className="font-medium text-[#172135] text-xs">
                                                {item.effectiveDate}
                                            </span>
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* 1. Mata (Lihat Dokumen / Pratinjau): Aktif HANYA jika status BUKAN 'Diterbitkan' */}
                                                {item.status !== 'Diterbitkan' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewItem(item)
                                                        }
                                                        title="Lihat Dokumen"
                                                        aria-label="Lihat Dokumen"
                                                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Eye
                                                            size={14}
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                ) : (
                                                    <div
                                                        title="Judul dokumen dapat diklik untuk melihat transparansi di beranda"
                                                        className="inline-flex cursor-not-allowed"
                                                    >
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-60 flex items-center justify-center cursor-not-allowed pointer-events-none"
                                                        >
                                                            <Eye
                                                                size={14}
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    title="Edit Dokumen"
                                                    aria-label="Edit Dokumen"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil
                                                        size={14}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletingItem(item)
                                                    }
                                                    title="Hapus Dokumen"
                                                    aria-label="Hapus Dokumen"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Trash2
                                                        size={14}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {item.status ===
                                                    'Diterbitkan' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setUnpublishingItem(
                                                                item
                                                            )
                                                        }
                                                        title="Turunkan Tayang ke Draf (Unpublish)"
                                                        aria-label="Turunkan Tayang ke Draf"
                                                        className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Undo2
                                                            size={14}
                                                            aria-hidden="true"
                                                        />
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
                            dokumen
                        </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                        <button
                            type="button"
                            aria-label="Halaman sebelumnya"
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
                            <ChevronLeft size={14} aria-hidden="true" />
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
                            aria-label="Halaman berikutnya"
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
                            <ChevronRight size={14} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Dokumen Baru */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-transparansi-title"
                        className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#159447] flex items-center justify-center shrink-0">
                                    <PlusCircle size={16} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3
                                        id="add-transparansi-title"
                                        className="font-bold text-[#172135] text-base tracking-tight"
                                    >
                                        Tambah Dokumen Transparansi
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Unggah dokumen atau regulasi publik.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup modal tambah dokumen"
                                disabled={isPending}
                                onClick={requestCloseAddModal}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

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

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveAdd('Diterbitkan')
                            }}
                            noValidate
                            className="space-y-4 text-xs"
                        >
                            {/* 1. Judul Dokumen */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Dokumen{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Peraturan Daerah tentang APBD TA 2026..."
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Tanggal Pemberlakuan */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Tanggal Pemberlakuan{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    max={todayWib || getTodayDateWIB()}
                                    value={formData.effectiveDate}
                                    onChange={(e) =>
                                        handleEffectiveDateChange(
                                            e.target.value
                                        )
                                    }
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                    Dapat memilih tanggal lampau hingga hari ini (WIB), tidak boleh memilih tanggal masa depan.
                                </p>
                            </div>

                            {/* 3. Deskripsi Program (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Deskripsi Program{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Tuliskan ringkasan pokok, keterangan, atau rincian dokumen..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 4. File Dokumen PDF */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    File Dokumen PDF{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {formData.pdfFile ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {getPdfDisplayName(
                                                        formData.pdfFile
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    Berkas PDF siap dilampirkan
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPdfFileObj(null)
                                                setFormData({
                                                    ...formData,
                                                    pdfFile: '',
                                                })
                                                if (fileInputRef.current)
                                                    fileInputRef.current.value =
                                                        ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                            title="Hapus berkas"
                                            aria-label="Hapus berkas PDF"
                                        >
                                            <Trash2
                                                size={14}
                                                aria-hidden="true"
                                            />
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
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                                            pdfError && !formData.pdfFile
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                  ? 'border-[#159447] bg-[#f0fdf4]'
                                                  : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud
                                            size={24}
                                            aria-hidden="true"
                                            className={`mx-auto mb-1.5 ${
                                                pdfError && !formData.pdfFile
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
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            <span className="text-red-500 font-semibold">
                                                Wajib dilampirkan
                                            </span>{' '}
                                            • Format PDF (Maks. 25 MB)
                                        </p>
                                    </div>
                                )}
                                {pdfError && pdfErrorMessage && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle
                                            size={13}
                                            className="shrink-0"
                                        />
                                        {pdfErrorMessage}
                                    </p>
                                )}
                            </div>

                            {/* 5. Status Publikasi & Aksi */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                <label className="block font-semibold text-[#172135]">
                                    Status Publikasi
                                </label>

                                {/* Tombol Utama: Terbitkan Dokumen */}
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleSaveAdd('Diterbitkan')}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    {isPending &&
                                    submittingStatus === 'Diterbitkan' ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Terbitkan Dokumen</span>
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
                                        {isPending &&
                                        submittingStatus === 'Draf' ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
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
                                        onClick={() =>
                                            handleSaveAdd('Draf', true)
                                        }
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending &&
                                        submittingStatus === 'Preview' ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
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
                                    disabled={isPending}
                                    onClick={requestCloseAddModal}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Dokumen */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-transparansi-title"
                        className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#159447] flex items-center justify-center shrink-0">
                                    <Pencil size={16} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3
                                        id="edit-transparansi-title"
                                        className="font-bold text-[#172135] text-base tracking-tight"
                                    >
                                        Edit Dokumen Transparansi
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Perbarui informasi dokumen #{editingItem.no}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup modal edit dokumen"
                                disabled={isPending}
                                onClick={requestCloseEditModal}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

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

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveEdit(editingItem.status)
                            }}
                            noValidate
                            className="space-y-4 text-xs"
                        >
                            {/* 1. Judul Dokumen */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Dokumen{' '}
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
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Tanggal Pemberlakuan */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Tanggal Pemberlakuan{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    max={todayWib || getTodayDateWIB()}
                                    value={formData.effectiveDate}
                                    onChange={(e) =>
                                        handleEffectiveDateChange(
                                            e.target.value
                                        )
                                    }
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                    Dapat memilih tanggal lampau hingga hari ini (WIB), tidak boleh memilih tanggal masa depan.
                                </p>
                            </div>

                            {/* 3. Deskripsi Program (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Deskripsi Program{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Tuliskan ringkasan pokok, keterangan, atau rincian dokumen..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 4. File Dokumen PDF */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    File Dokumen PDF{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    ref={editFileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {formData.pdfFile ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {getPdfDisplayName(
                                                        formData.pdfFile
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    Berkas PDF terlampir
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPdfFileObj(null)
                                                setFormData({
                                                    ...formData,
                                                    pdfFile: '',
                                                })
                                                if (editFileInputRef.current)
                                                    editFileInputRef.current.value =
                                                        ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                            title="Ganti berkas"
                                            aria-label="Hapus berkas PDF"
                                        >
                                            <Trash2
                                                size={14}
                                                aria-hidden="true"
                                            />
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
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                                            pdfError && !formData.pdfFile
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                  ? 'border-[#159447] bg-[#f0fdf4]'
                                                  : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud
                                            size={24}
                                            aria-hidden="true"
                                            className={`mx-auto mb-1.5 ${
                                                pdfError && !formData.pdfFile
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
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            <span className="text-red-500 font-semibold">
                                                Wajib dilampirkan
                                            </span>{' '}
                                            • Format PDF (Maks. 25 MB)
                                        </p>
                                    </div>
                                )}
                                {pdfError && pdfErrorMessage && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle
                                            size={13}
                                            className="shrink-0"
                                        />
                                        {pdfErrorMessage}
                                    </p>
                                )}
                            </div>

                            {/* 5. Status Publikasi & Aksi */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                <label className="block font-semibold text-[#172135]">
                                    Status Publikasi
                                </label>

                                {/* Tombol Utama: Terbitkan / Simpan & Perbarui Tayangan */}
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() =>
                                        handleSaveEdit('Diterbitkan')
                                    }
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    {isPending &&
                                    submittingStatus === 'Diterbitkan' ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>
                                                {editingItem.status ===
                                                'Diterbitkan'
                                                    ? 'Simpan & Perbarui Tayangan'
                                                    : 'Terbitkan Dokumen'}
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
                                        {isPending &&
                                        submittingStatus === 'Draf' ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
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
                                        onClick={() =>
                                            handleSaveEdit(
                                                editingItem.status,
                                                true
                                            )
                                        }
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {isPending &&
                                        submittingStatus === 'Preview' ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
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
                                    disabled={isPending}
                                    onClick={requestCloseEditModal}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deletingItem !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        if (!isPending) setDeletingItem(null)
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-transparansi-title"
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 text-red-600">
                                <Trash2
                                    className="h-6 w-6 stroke-[2]"
                                    aria-hidden="true"
                                />
                            </div>

                            <h3
                                id="delete-transparansi-title"
                                className="mb-2 text-lg font-bold text-[#1b293c]"
                            >
                                Konfirmasi Hapus
                            </h3>

                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menghapus dokumen transparansi ini?
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
                                    onClick={() =>
                                        handleDelete(deletingItem.id)
                                    }
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
                                        <span>Ya</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Turunkan Dokumen (Unpublish) */}
            {unpublishingItem !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        if (!isPending) setUnpublishingItem(null)
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="unpublish-transparansi-title"
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100 text-amber-600">
                                <Undo2
                                    className="h-6 w-6 stroke-[2]"
                                    aria-hidden="true"
                                />
                            </div>

                            <h3
                                id="unpublish-transparansi-title"
                                className="mb-2 text-lg font-bold text-[#1b293c]"
                            >
                                Konfirmasi Turunkan Dokumen
                            </h3>

                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menurunkan dokumen ini kembali ke draf?
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
                                    onClick={() =>
                                        handleUnpublish(unpublishingItem.id)
                                    }
                                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-white"
                                                aria-hidden="true"
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

            {/* Modal Pop-up Preview Dokumen */}
            {previewItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="preview-transparansi-title"
                        className="relative bg-[#fafafa] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewItem(null)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer z-10"
                            title="Tutup"
                            aria-label="Tutup pratinjau dokumen"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>

                        <div className="p-5 md:p-8 flex flex-col flex-1 min-h-0 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                                {/* Kolom Kiri: Rincian Dokumen */}
                                <div className="lg:col-span-5 flex flex-col gap-5 pr-0 md:pr-2">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <span className="inline-block bg-[#f1f5f9] text-[#475569] text-xs font-medium px-3.5 py-1.5 rounded-md">
                                                Transparansi Pengelolaan Keuangan Daerah
                                            </span>
                                            {previewItem.status ===
                                            'Diterbitkan' ? (
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
                                        </div>
                                        <h2
                                            id="preview-transparansi-title"
                                            className="text-xl md:text-2xl font-bold text-[#159447] leading-snug"
                                        >
                                            {previewItem.title}
                                        </h2>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-[#159447] mb-1">
                                            <svg
                                                className="w-4 h-4 shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="text-xs text-[#94a3b8] font-medium">
                                                Deskripsi Program
                                            </span>
                                        </div>
                                        <p className="text-[#334155] text-sm md:text-sm pl-6 leading-relaxed">
                                            {previewItem.description ||
                                                'Tidak ada deskripsi program.'}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-[#159447] mb-1">
                                            <svg
                                                className="w-4 h-4 shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                />
                                            </svg>
                                            <span className="text-xs text-[#94a3b8] font-medium">
                                                Tanggal Pemberlakuan
                                            </span>
                                        </div>
                                        <p className="text-[#334155] text-sm md:text-sm pl-6">
                                            {previewItem.effectiveDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Kolom Kanan: Pratinjau PDF */}
                                <div className="lg:col-span-7 h-full min-h-[380px] bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center">
                                    {(() => {
                                        const rawUrl =
                                            previewItem.pdf_url ||
                                            previewItem.pdfFile ||
                                            ''
                                        const isValidUrl =
                                            rawUrl.startsWith('http') ||
                                            rawUrl.startsWith('/') ||
                                            rawUrl.startsWith('blob:') ||
                                            rawUrl.startsWith('data:')
                                        return isValidUrl ? (
                                            <embed
                                                src={rawUrl}
                                                type="application/pdf"
                                                width="100%"
                                                height="100%"
                                                className="w-full h-full min-h-[380px]"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 w-full h-full">
                                                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-[#f0fdf4] border-2 border-[#159447] mb-3">
                                                    <FileText
                                                        className="h-6 w-6 text-[#159447]"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="mt-1 text-xs font-bold text-[#159447]">
                                                        PDF
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-[#172135] max-w-xs truncate">
                                                    {getPdfDisplayName(rawUrl)}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Berkas PDF belum dapat ditampilkan
                                                </p>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Footer Pratinjau */}
                        <div className="border-t border-gray-200 px-5 py-3.5 bg-white shrink-0">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                    <button
                                        type="button"
                                        onClick={handlePrevDocument}
                                        disabled={
                                            getCurrentDocumentIndex() === 1
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                                            getCurrentDocumentIndex() === 1
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <ChevronLeft
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">
                                            Sebelumnya
                                        </span>
                                    </button>

                                    <span className="text-xs text-[#94a3b8] font-semibold mx-1">
                                        {getCurrentDocumentIndex()} /{' '}
                                        {transparansiList.length}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleNextDocument}
                                        disabled={
                                            getCurrentDocumentIndex() ===
                                            transparansiList.length
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                                            getCurrentDocumentIndex() ===
                                            transparansiList.length
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="hidden sm:inline">
                                            Selanjutnya
                                        </span>
                                        <ChevronRight
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewItem(null)}
                                        className="px-4 py-2 text-xs md:text-sm rounded-lg border-2 border-[#159447] text-[#159447] font-bold hover:bg-[#159447]/5 transition-colors cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                    {(() => {
                                        const rawUrl =
                                            previewItem.pdf_url ||
                                            previewItem.pdfFile ||
                                            ''
                                        const isValidUrl =
                                            rawUrl.startsWith('http') ||
                                            rawUrl.startsWith('/')
                                        return isValidUrl ? (
                                            <a
                                                href={rawUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 text-xs md:text-sm rounded-lg bg-[#159447] text-white font-bold hover:bg-[#0f7a36] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                    />
                                                </svg>
                                                Unduh
                                            </a>
                                        ) : null
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmSaveDraftModal
                isOpen={isExitConfirmOpen}
                isSaving={isPending}
                isPublished={Boolean(
                    editingItem && editingItem.status === 'Diterbitkan'
                )}
                onConfirmSaveDraft={() =>
                    editingItem
                        ? handleSaveEdit(editingItem.status ?? 'Draf')
                        : handleSaveAdd('Draf')
                }
                onDiscard={() => {
                    setIsExitConfirmOpen(false)
                    setEditingItem(null)
                    setEditInitialSnapshot(null)
                    setIsAddModalOpen(false)
                }}
                onCancel={() => setIsExitConfirmOpen(false)}
            />

            {/* MODAL: PREVIEW LAMPIRAN PDF */}
            {attachmentPreviewItem && (
                <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {attachmentPreviewItem.status ===
                                    'Diterbitkan' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                            Diterbitkan
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                            Draf
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400">
                                        • {attachmentPreviewItem.effectiveDate}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[#172135] leading-snug">
                                    {attachmentPreviewItem.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAttachmentPreviewItem(null)}
                                aria-label="Tutup pratinjau lampiran"
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="w-full h-[480px] rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                            <iframe
                                src={
                                    attachmentPreviewItem.pdf_url ||
                                    attachmentPreviewItem.pdfFile
                                }
                                title={`Lampiran ${attachmentPreviewItem.title}`}
                                className="w-full h-full"
                            />
                        </div>

                        <div className="flex items-center justify-start pt-2 border-t border-slate-100">
                            <a
                                href={
                                    attachmentPreviewItem.pdf_url ||
                                    attachmentPreviewItem.pdfFile
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#159447] text-[#159447] hover:bg-emerald-50 text-xs font-bold transition-colors"
                            >
                                <span>Buka di Tab Baru</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

