'use client'

import { useState, useMemo, useRef } from 'react'
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
    X,
    Check,
    AlertCircle,
    FileText,
    UploadCloud,
} from 'lucide-react'

// ─── 1. Tipe Data Utama Transparansi ──────────────────────────────────────────
export interface TransparansiItem {
    id: string
    no: string
    title: string
    effectiveDate: string
    description?: string
    pdfFile: string // Wajib: URL atau nama berkas PDF
}

// ─── Data Dummy Awal Transparansi Dokumen (Minimal 5 Item) ───────────────────
const initialTransparansi: TransparansiItem[] = [
    {
        id: '1',
        no: '01',
        title: 'Laporan Keuangan Pemerintah Daerah (LKPD) Audited TA 2025',
        effectiveDate: '20 Mei 2026',
        description:
            'Laporan hasil pemeriksaan Badan Pemeriksa Keuangan (BPK) RI atas Laporan Keuangan Pemerintah Daerah Kota Sukabumi Tahun Anggaran 2025 dengan opini Wajar Tanpa Pengecualian (WTP).',
        pdfFile: 'LKPD_Kota_Sukabumi_Audited_TA2025.pdf',
    },
    {
        id: '2',
        no: '02',
        title: 'Peraturan Daerah Kota Sukabumi tentang APBD Tahun Anggaran 2026',
        effectiveDate: '02 Jan 2026',
        description:
            'Peraturan Daerah Kota Sukabumi Nomor 1 Tahun 2026 tentang Anggaran Pendapatan dan Belanja Daerah Tahun Anggaran 2026 beserta rincian lampiran alokasi anggarannya.',
        pdfFile: 'Perda_APBD_Kota_Sukabumi_TA2026.pdf',
    },
    {
        id: '3',
        no: '03',
        title: 'Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP) 2025',
        effectiveDate: '15 Mar 2026',
        description:
            'Dokumen pertanggungjawaban akuntabilitas kinerja seluruh perangkat daerah Pemerintah Kota Sukabumi dalam mencapai target sasaran strategis RPJMD.',
        pdfFile: 'LAKIP_Pemkot_Sukabumi_2025.pdf',
    },
    {
        id: '4',
        no: '04',
        title: 'Ringkasan Rencana Kerja Pemerintah Daerah (RKPD) Kota Sukabumi 2026',
        effectiveDate: '10 Jul 2025',
        description:
            'Dokumen perencanaan tahunan yang memuat rancangan kerangka ekonomi makro, program prioritas kewilayahan, serta pendanaan pembangunan daerah tahun 2026.',
        pdfFile: 'Ringkasan_RKPD_Kota_Sukabumi_2026.pdf',
    },
    {
        id: '5',
        no: '05',
        title: 'Ringkasan Laporan Penyelenggaraan Pemerintahan Daerah (RLPPD) 2025',
        effectiveDate: '28 Mar 2026',
        description:
            'Publikasi ringkasan laporan capaian kinerja pemerintahan daerah kepada masyarakat untuk transparansi pelaksanaan urusan desentralisasi.',
        pdfFile: 'Ringkasan_LPPD_Masyarakat_2025.pdf',
    },
    {
        id: '6',
        no: '06',
        title: 'Catatan atas Laporan Keuangan (CaLK) Pemerintah Kota Sukabumi TA 2025',
        effectiveDate: '25 Apr 2026',
        description:
            'Informasi tambahan naratif mengenai pos-pos neraca, realisasi pembiayaan, serta rincian saldo kas daerah Pemerintah Kota Sukabumi.',
        pdfFile: 'CaLK_Pemkot_Sukabumi_TA2025.pdf',
    },
    {
        id: '7',
        no: '07',
        title: 'Daftar Informasi Publik (DIP) Pejabat Pengelola Informasi & Dokumentasi (PPID)',
        effectiveDate: '12 Feb 2026',
        description:
            'Kompilasi daftar informasi yang wajib disediakan dan diumumkan secara berkala, serta merta, dan setiap saat oleh PPID Utama Pemkot Sukabumi.',
        pdfFile: 'Daftar_Informasi_Publik_PPID_2026.pdf',
    },
]

// ─── Helper Format Tanggal & Parsing ──────────────────────────────────────────
const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
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

function formatDateToIndo(dateStr: string): string {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[0].length === 4) {
        const year = parts[0]
        const mIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        return `${day.toString().padStart(2, '0')} ${indonesianMonths[mIdx] || parts[1]} ${year}`
    }
    return dateStr
}

function parseIndoToDateInput(indoStr: string): string {
    if (!indoStr) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(indoStr)) return indoStr
    const parts = indoStr.trim().split(' ')
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const mKey = parts[1].toLowerCase().slice(0, 3)
        const monthNum =
            monthMap[mKey] !== undefined ? String(monthMap[mKey] + 1).padStart(2, '0') : '01'
        const year = parts[2]
        return `${year}-${monthNum}-${day}`
    }
    return ''
}

function parseDateToTimestamp(dateStr: string): number {
    if (!dateStr) return 0
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr).getTime()
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

function getTodayDate(): string {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export default function AdminTransparansiPage() {
    // State Data Utama
    const [transparansiList, setTransparansiList] = useState<TransparansiItem[]>(initialTransparansi)

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('Semua Waktu')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDateOpen, setIsDateOpen] = useState(false)

    // Pagination State (5 baris per halaman)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<TransparansiItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form State (1 Kolom Rapi untuk Tambah & Edit)
    const [formData, setFormData] = useState({
        title: '',
        effectiveDate: '',
        description: '',
        pdfFile: '',
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const editFileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // ─── Filter Logic ─────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        return transparansiList.filter((item) => {
            // Pencarian judul atau deskripsi dokumen
            const matchSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))

            // Filter Rentang Waktu (sama seperti logika kalender di halaman Berita)
            let matchDate = true
            if (dateFilter === 'Bulan Ini') {
                const parts = item.effectiveDate.trim().split(' ')
                if (parts.length === 3) {
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const itemMonth = monthMap[mKey]
                    const itemYear = parseInt(parts[2], 10)
                    const now = new Date()
                    matchDate =
                        (itemMonth === now.getMonth() && itemYear === now.getFullYear()) ||
                        (itemMonth === 9 && itemYear === 2026) // Fallback simulasi Okt 2026
                }
            } else if (dateFilter === 'Pilih Tanggal (Kustom)') {
                const itemTimestamp = parseDateToTimestamp(item.effectiveDate)
                if (startDate) {
                    const start = new Date(startDate).setHours(0, 0, 0, 0)
                    if (itemTimestamp < start) matchDate = false
                }
                if (endDate) {
                    const end = new Date(endDate).setHours(23, 59, 59, 999)
                    if (itemTimestamp > end) matchDate = false
                }
            }

            return matchSearch && matchDate
        })
    }, [transparansiList, searchTerm, dateFilter, startDate, endDate])

    // ─── Pagination Logic Standar ─────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const endItem = Math.min(currentPage * rowsPerPage, filteredData.length)

    // Komponen angka page maksimal 7 blok
    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
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

    // ─── Modal & Form Handlers ────────────────────────────────────────────────
    const openAddModal = () => {
        setFormData({
            title: '',
            effectiveDate: getTodayDate(),
            description: '',
            pdfFile: '',
        })
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: TransparansiItem) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            effectiveDate: parseIndoToDateInput(item.effectiveDate) || getTodayDate(),
            description: item.description || '',
            pdfFile: item.pdfFile,
        })
    }

    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        if (!formData.pdfFile.trim()) {
            alert('File dokumen PDF wajib diunggah.')
            return
        }

        const newId = String(transparansiList.length + 1)
        const formattedNo = newId.padStart(2, '0')
        const formattedDate =
            formatDateToIndo(formData.effectiveDate) || formatDateToIndo(getTodayDate())

        const newItem: TransparansiItem = {
            id: newId,
            no: formattedNo,
            title: formData.title.trim(),
            effectiveDate: formattedDate,
            description: formData.description.trim() || undefined,
            pdfFile: formData.pdfFile.trim(),
        }

        setTransparansiList([newItem, ...transparansiList])
        setIsAddModalOpen(false)
    }

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem || !formData.title.trim()) return

        if (!formData.pdfFile.trim()) {
            alert('File dokumen PDF wajib tersedia.')
            return
        }

        const formattedDate =
            formatDateToIndo(formData.effectiveDate) || editingItem.effectiveDate

        setTransparansiList((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? {
                          ...item,
                          title: formData.title.trim(),
                          effectiveDate: formattedDate,
                          description: formData.description.trim() || undefined,
                          pdfFile: formData.pdfFile.trim(),
                      }
                    : item
            )
        )
        setEditingItem(null)
    }

    const handleDelete = (id: string) => {
        setTransparansiList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert('Hanya berkas format .pdf yang diperbolehkan.')
                return
            }
            setFormData((prev) => ({ ...prev, pdfFile: file.name }))
        }
    }

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert('Hanya berkas format .pdf yang diperbolehkan.')
                return
            }
            setFormData((prev) => ({ ...prev, pdfFile: file.name }))
        }
    }

    return (
        <div className="w-full space-y-6 pb-10">
            {/* ─── 2. HEADER HALAMAN & TOMBOL TAMBAH ─── */}
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
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tambah Dokumen</span>
                    </button>
                </div>
            </div>

            {/* ─── 2. CARD PENCARIAN & FILTER BAR ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Input Search untuk mencari judul dokumen */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
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

                    {/* Dropdown Rentang Waktu (sama seperti logika kalender di halaman Berita) */}
                    <div className="relative z-30 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsDateOpen(!isDateOpen)}
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
                                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                                    <div className="space-y-0.5">
                                        {['Semua Waktu', 'Bulan Ini', 'Pilih Tanggal (Kustom)'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setDateFilter(opt)
                                                    if (opt === 'Semua Waktu' || opt === 'Bulan Ini') {
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
                                                    <Check size={14} className="text-[#159447]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {dateFilter === 'Pilih Tanggal (Kustom)' && (
                                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600">
                                                    Mulai Tanggal
                                                </label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
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
                                                    onChange={(e) => setEndDate(e.target.value)}
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
                                                style={{ backgroundColor: '#159447' }}
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

            {/* ─── 3. STRUKTUR TABEL DOKUMEN TRANSPARANSI ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-left">JUDUL DOKUMEN</th>
                                <th className="py-4 px-4 text-left w-44">TANGGAL BERLAKU</th>
                                <th className="py-4 px-4 text-center w-60">FILE PDF</th>
                                <th className="py-4 px-4 text-center w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        Tidak ada dokumen transparansi yang cocok dengan filter atau kata kunci.
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
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </td>

                                        {/* JUDUL DOKUMEN */}
                                        <td className="py-4 px-4 text-left">
                                            <p
                                                className="font-bold text-[#172135] text-xs sm:text-[13px] leading-relaxed group-hover:text-[#159447] transition-colors"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </p>
                                            {item.description && (
                                                <p
                                                    className="text-[11px] text-[#566276] mt-1 line-clamp-1 leading-normal"
                                                    title={item.description}
                                                >
                                                    {item.description}
                                                </p>
                                            )}
                                        </td>

                                        {/* TANGGAL BERLAKU */}
                                        <td className="py-4 px-4 text-left whitespace-nowrap">
                                            <span className="font-medium text-[#172135] text-xs">
                                                {item.effectiveDate}
                                            </span>
                                        </td>

                                        {/* FILE PDF: Badge abu-abu terang bertuliskan nama file dengan ikon FileText merah */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div
                                                title={item.pdfFile}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 text-slate-700 text-xs font-semibold max-w-[220px] transition-colors shadow-2xs"
                                            >
                                                <FileText size={14} className="text-red-500 shrink-0" />
                                                <span className="truncate">{item.pdfFile}</span>
                                            </div>
                                        </td>

                                        {/* AKSI: Lihat Dokumen (Preview), Edit, dan Delete */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(item.pdfFile, '_blank', 'noopener,noreferrer')}
                                                    title="Lihat Dokumen"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit Dokumen"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Hapus Dokumen"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── 4. LOGIKA PAGINATION ─── */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    {/* Sisi Kiri: Info Jumlah Data */}
                    <div className="text-sm font-medium text-slate-600">
                        <span>
                            Menampilkan <span className="font-bold text-[#172135]">{startItem} - {endItem}</span> dari{' '}
                            <span className="font-bold text-[#172135]">{filteredData.length}</span> dokumen
                        </span>
                    </div>

                    {/* Sisi Kanan: Navigasi Halaman */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {/* Tombol Sebelumnya */}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
                                currentPage === 1
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-xs'
                            }`}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {/* Angka Pagination (Maksimal 7 Blok) */}
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
                                        onClick={() => setCurrentPage(page as number)}
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

                        {/* Tombol Selanjutnya */}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

            {/* ─── 5. MODAL CRUD: TAMBAH DOKUMEN BARU ─── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#159447] flex items-center justify-center shrink-0">
                                    <PlusCircle size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Tambah Dokumen Transparansi
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Unggah dokumen laporan keuangan atau regulasi publik.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form 1 Kolom Rapi */}
                        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                            {/* 1. Judul Dokumen (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Dokumen <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Peraturan Daerah tentang APBD TA 2026..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Tanggal Pemberlakuan (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Tanggal Pemberlakuan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.effectiveDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, effectiveDate: e.target.value })
                                    }
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                />
                            </div>

                            {/* 3. Deskripsi Singkat (Opsional, rows={3}) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Deskripsi Program <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tuliskan ringkasan pokok, keterangan, atau rincian dokumen..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 4. File Dokumen PDF (Wajib, Drag & Drop UI garis putus-putus) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    File Dokumen PDF <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {formData.pdfFile ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {formData.pdfFile}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Berkas PDF siap dilampirkan
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, pdfFile: '' })
                                                if (fileInputRef.current) fileInputRef.current.value = ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
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
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                                            isDragging
                                                ? 'border-[#159447] bg-[#f0fdf4]'
                                                : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud size={24} className="mx-auto text-slate-400 mb-1.5" />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau{' '}
                                            <span className="text-[#159447] underline">klik untuk memilih</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Wajib berkas dengan format PDF (Maks. 25 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Aksi Form */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold shadow-xs cursor-pointer transition-all"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan Dokumen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── 5. MODAL CRUD: EDIT DOKUMEN ─── */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#159447] flex items-center justify-center shrink-0">
                                    <Pencil size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#172135] text-base tracking-tight">
                                        Edit Dokumen Transparansi
                                    </h3>
                                    <p className="text-xs text-[#566276]">
                                        Perbarui informasi dokumen #{editingItem.no}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form 1 Kolom Rapi */}
                        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                            {/* 1. Judul Dokumen (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Dokumen <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Tanggal Pemberlakuan (Wajib) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Tanggal Pemberlakuan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.effectiveDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, effectiveDate: e.target.value })
                                    }
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                />
                            </div>

                            {/* 3. Deskripsi Singkat , rows={3}) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Deskripsi Program <span className="text-slate-400 font-normal"></span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 4. File Dokumen PDF (Wajib, Drag & Drop UI garis putus-putus) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    File Dokumen PDF <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    ref={editFileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {formData.pdfFile ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">
                                                    {formData.pdfFile}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Berkas PDF terlampir
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, pdfFile: '' })
                                                if (editFileInputRef.current) editFileInputRef.current.value = ''
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                            title="Ganti berkas"
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
                                        onClick={() => editFileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                                            isDragging
                                                ? 'border-[#159447] bg-[#f0fdf4]'
                                                : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud size={24} className="mx-auto text-slate-400 mb-1.5" />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau{' '}
                                            <span className="text-[#159447] underline">klik untuk memilih</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Wajib berkas dengan format PDF (Maks. 25 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Aksi Form */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold shadow-xs cursor-pointer transition-all"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── 6. MODAL KONFIRMASI HAPUS ─── */}
            {deletingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        {/* Ikon AlertCircle berwarna merah muda agar tidak terhapus tak sengaja */}
                        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto shadow-xs">
                            <AlertCircle size={28} className="text-rose-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#172135] text-base tracking-tight">
                                Hapus Dokumen Ini?
                            </h4>
                            <p className="text-xs text-[#566276] mt-1.5 leading-relaxed">
                                Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus permanen dari daftar transparansi publik.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(deletingId)}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                            >
                                Hapus Dokumen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}