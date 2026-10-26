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
    Paperclip,
    FileText,
    Download,
    UploadCloud,
    Megaphone,
    User,
    Clock3,
} from 'lucide-react'

// ─── Tipe Data Pengumuman ─────────────────────────────────────────────────────
export interface PengumumanItem {
    id: string
    no: string
    title: string
    content: string
    status: 'Publish' | 'Draft'
    date: string
    time: string
    attachment: string | null // URL atau nama berkas PDF lampiran
    author: {
        name: string
        role: string
        avatar: string
        avatarBg: string
    }
}

// ─── Data Awal Pengumuman Resmi (Dummy) ────────────────────────────────────────
const initialPengumuman: PengumumanItem[] = [
    {
        id: '1',
        no: '01',
        title: 'Jadwal Pemadaman Listrik Sementara Pemeliharaan Jaringan Gardu Induk Cikole',
        content:
            'Diberitahukan kepada seluruh warga Kecamatan Cikole dan sekitarnya bahwa sehubungan dengan pekerjaan pemeliharaan preventif dan peningkatan keandalan pasokan listrik pada Gardu Induk 150kV, PT PLN (Persero) ULP Sukabumi Kota akan melaksanakan pemadaman aliran listrik sementara pada hari Sabtu, 24 Oktober 2026 mulai pukul 09.00 s.d 15.00 WIB. Mohon masyarakat dapat mempersiapkan cadangan daya dan mengamankan peralatan elektronik.',
        status: 'Publish',
        date: '24 Okt 2026',
        time: '08:00 WIB',
        attachment: 'Surat_Edaran_PLN_Pemkot_Sukabumi_2026.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '2',
        no: '02',
        title: 'Pemberitahuan Rekayasa Lalu Lintas Peringatan Hari Jadi Kota Sukabumi ke-112',
        content:
            'Dalam rangka memeriahkan Peringatan Hari Jadi Kota Sukabumi ke-112 dan pawai budaya akbar, Dinas Perhubungan bersama Satlantas Polres Sukabumi Kota akan memberlakukan penutupan dan pengalihan arus lalu lintas sementara di sepanjang koridor Jalan R.E. Martadinata, Jalan Siliwangi, dan lingkar Alun-alun Kota mulai pukul 06.00 hingga 13.00 WIB. Disarankan pengguna jalan menggunakan jalur alternatif lingkar selatan.',
        status: 'Publish',
        date: '23 Okt 2026',
        time: '14:30 WIB',
        attachment: 'Denah_Rekayasa_Lalin_HUT112.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '3',
        no: '03',
        title: 'Himbauan Waspada Cuaca Ekstrem dan Potensi Angin Kencang Wilayah Dataran Tinggi',
        content:
            'Badan Penanggulangan Bencana Daerah (BPBD) Kota Sukabumi menerbitkan himbauan dini terkait potensi hujan berintensitas sedang hingga lebat disertai kilat dan hembusan angin kencang di kawasan lereng perbukitan dan bantaran sungai. Warga diimbau memangkas dahan pohon rawan tumbang, memeriksa saluran drainase lingkungan, dan segera melapor ke call center BPBD 112 jika terjadi genangan atau longsor.',
        status: 'Publish',
        date: '22 Okt 2026',
        time: '09:15 WIB',
        attachment: 'Surat_Himbauan_Cuaca_Ekstrem_BPBD.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '4',
        no: '04',
        title: 'Pendaftaran Program Pelatihan Kerja Berbasis Kompetensi Angkatan IV Disnaker',
        content:
            'Dinas Tenaga Kerja Kota Sukabumi membuka pendaftaran Pelatihan Kerja Berbasis Kompetensi (PBK) Angkatan IV Tahun Anggaran 2026 untuk kejuruan Teknisi Otomotif Sepeda Motor, Tata Boga Olahan Pangan Lokal, Barista, dan Pemasaran Digital. Pelatihan ini 100% gratis, didanai oleh APBD, dan peserta akan mendapatkan sertifikasi uji kompetensi nasional BNSP.',
        status: 'Draft',
        date: '20 Okt 2026',
        time: '11:00 WIB',
        attachment: 'Brosur_Persyaratan_Pelatihan_Disnaker_2026.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '5',
        no: '05',
        title: 'Surat Edaran Jam Kerja ASN Selama Pelaksanaan Bulan Suci Ramadhan 1448 H',
        content:
            'Berdasarkan Surat Edaran Wali Kota Sukabumi tentang Penetapan Jam Kerja Pegawai Aparatur Sipil Negara pada Bulan Ramadhan, jam kerja kantor kedinasan disesuaikan menjadi Senin hingga Kamis pukul 08.00 - 15.00 WIB dan Jumat pukul 08.00 - 15.30 WIB. Layanan publik strategis seperti Puskesmas dan Pemadam Kebakaran tetap siaga 24 jam dengan sistem giliran dinas.',
        status: 'Draft',
        date: '18 Okt 2026',
        time: '10:00 WIB',
        attachment: 'Surat_Edaran_Jam_Kerja_Ramadhan.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '6',
        no: '06',
        title: 'Uji Coba Penerapan Sistem Antrean Elektronik Terpadu pada Loket Pelayanan Disdukcapil',
        content:
            'Guna mengurai kepadatan antrean fisik dan mewujudkan pelayanan administrasi kependudukan yang transparan, Disdukcapil Kota Sukabumi mengumumkan uji coba antrean berbasis kode QR dan aplikasi pesan singkat mulai 1 November 2026. Warga dihimbau melakukan reservasi tiket nomor antrean secara daring sebelum datang ke kantor dinas.',
        status: 'Publish',
        date: '15 Okt 2026',
        time: '08:45 WIB',
        attachment: 'Panduan_Antrean_Online_Disdukcapil.pdf',
        author: {
            name: 'Trias Firmansyah',
            role: 'Admin',
            avatar: 'TF',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
]

const statusOptions = ['Semua Status', 'Publish', 'Draft']

// ─── Helper Format Tanggal & Waktu ────────────────────────────────────────────
const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatDateToIndo(dateStr: string): string {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
        const year = parts[0]
        const mIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        return `${day} ${indonesianMonths[mIdx] || parts[1]} ${year}`
    }
    return dateStr
}

function parseIndoToDateInput(indoStr: string): string {
    if (!indoStr) return ''
    const parts = indoStr.trim().split(' ')
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const mKey = parts[1].toLowerCase().slice(0, 3)
        const monthMap: Record<string, string> = {
            jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', jun: '06',
            jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12',
        }
        const month = monthMap[mKey] || '01'
        const year = parts[2]
        return `${year}-${month}-${day}`
    }
    return ''
}

function getTodayDate(): string {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

function getCurrentTime(): string {
    const today = new Date()
    const hh = String(today.getHours()).padStart(2, '0')
    const min = String(today.getMinutes()).padStart(2, '0')
    return `${hh}:${min}`
}

export default function AdminPengumumanPage() {
    const [pengumumanList, setPengumumanList] = useState<PengumumanItem[]>(initialPengumuman)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    // Rentang Waktu State (sinkron dengan logika Berita)
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
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form State (Tambah & Edit)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        publishDate: '',
        publishTime: '',
        authorName: 'Trias Firmansyah',
        authorRole: 'Admin',
        status: 'Publish' as PengumumanItem['status'],
        attachment: null as string | null,
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const editFileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [attachmentError, setAttachmentError] = useState(false)

    // ─── Filter & Search Logic ────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        return pengumumanList.filter((item) => {
            // Pencarian judul, konten, atau penulis
            const matchSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.author.name.toLowerCase().includes(searchTerm.toLowerCase())

            // Filter Status
            const matchStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter

            // Filter Waktu
            let matchDate = true
            if (dateFilter === 'Bulan Ini') {
                const months: Record<string, number> = {
                    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
                    jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
                }
                const parts = item.date.trim().split(' ')
                if (parts.length === 3) {
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const itemMonth = months[mKey]
                    const itemYear = parseInt(parts[2], 10)
                    const now = new Date()
                    matchDate =
                        (itemMonth === now.getMonth() && itemYear === now.getFullYear()) ||
                        (itemMonth === 9 && itemYear === 2026)
                }
            } else if (dateFilter === 'Pilih Tanggal (Kustom)') {
                const months: Record<string, number> = {
                    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
                    jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
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
    }, [pengumumanList, searchTerm, statusFilter, dateFilter, startDate, endDate])

    // Pagination Calculation
    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const endItem = Math.min(currentPage * rowsPerPage, filteredData.length)

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

    // ─── Modal Handlers ───────────────────────────────────────────────────────
    const openAddModal = () => {
        setAttachmentError(false)
        setFormData({
            title: '',
            content: '',
            publishDate: getTodayDate(),
            publishTime: getCurrentTime(),
            authorName: 'Trias Firmansyah',
            authorRole: 'Admin',
            status: 'Publish',
            attachment: null,
        })
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: PengumumanItem) => {
        setAttachmentError(false)
        setEditingItem(item)
        const dateInput = parseIndoToDateInput(item.date) || getTodayDate()
        const timeInput = item.time.replace(' WIB', '').trim() || getCurrentTime()

        setFormData({
            title: item.title,
            content: item.content,
            publishDate: dateInput,
            publishTime: timeInput,
            authorName: item.author.name || 'Trias Firmansyah',
            authorRole: item.author.role || 'Admin',
            status: item.status,
            attachment: item.attachment,
        })
    }

    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        // Validasi wajib lampiran dokumen
        if (!formData.attachment) {
            setAttachmentError(true)
            return
        }
        setAttachmentError(false)

        const newId = String(pengumumanList.length + 1)
        const formattedNo = newId.padStart(2, '0')

        const dateStr = formatDateToIndo(formData.publishDate) || formatDateToIndo(getTodayDate())
        const timeStr = `${formData.publishTime || getCurrentTime()} WIB`

        const newItem: PengumumanItem = {
            id: newId,
            no: formattedNo,
            title: formData.title.trim(),
            content: formData.content.trim(),
            status: formData.status,
            date: dateStr,
            time: timeStr,
            attachment: formData.attachment,
            author: {
                name: formData.authorName || 'Trias Firmansyah',
                role: formData.authorRole || 'Admin',
                avatar: 'TF',
                avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
            },
        }

        setPengumumanList([newItem, ...pengumumanList])
        setIsAddModalOpen(false)
    }

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem || !formData.title.trim()) return

        // Validasi wajib lampiran dokumen
        if (!formData.attachment) {
            setAttachmentError(true)
            return
        }
        setAttachmentError(false)

        const dateStr = formatDateToIndo(formData.publishDate) || editingItem.date
        const timeStr = formData.publishTime ? `${formData.publishTime} WIB` : editingItem.time

        setPengumumanList((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? {
                          ...item,
                          title: formData.title.trim(),
                          content: formData.content.trim(),
                          status: formData.status,
                          date: dateStr,
                          time: timeStr,
                          attachment: formData.attachment,
                          author: {
                              ...item.author,
                              name: formData.authorName || item.author.name,
                              role: formData.authorRole || item.author.role,
                          },
                      }
                    : item
            )
        )
        setEditingItem(null)
    }

    const handleDelete = (id: string) => {
        setPengumumanList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData((prev) => ({ ...prev, attachment: file.name }))
            setAttachmentError(false)
        }
    }

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.name.toLowerCase().endsWith('.pdf')) {
            setFormData((prev) => ({ ...prev, attachment: file.name }))
            setAttachmentError(false)
        }
    }

    return (
        <div className="w-full space-y-6 pb-10">
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

            {/* 2. CARD PENCARIAN & FILTER */}
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
                                            {['Semua Waktu', 'Bulan Ini', 'Pilih Tanggal (Kustom)'].map(
                                                (opt) => (
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
                                                )
                                            )}
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
                                <th className="py-4 px-4 text-left">JUDUL PENGUMUMAN</th>
                                <th className="py-4 px-4 text-center w-36">LAMPIRAN</th>
                                <th className="py-4 px-4 text-center w-28">STATUS</th>
                                <th className="py-4 px-4 text-left w-36">PUBLIKASI</th>
                                <th className="py-4 px-4 text-left w-48">PENULIS</th>
                                <th className="py-4 px-4 text-center w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
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
                                             {(currentPage - 1) * rowsPerPage + index + 1}
                                        </td>

                                        {/* JUDUL PENGUMUMAN */}
                                        <td className="py-4 px-4 text-left">
                                            <p
                                                onClick={() => setPreviewItem(item)}
                                                className="font-bold text-[#172135] text-xs sm:text-[13px] hover:text-[#159447] cursor-pointer transition-colors line-clamp-2 leading-relaxed"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </p>
                                        </td>

                                        {/* LAMPIRAN */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.attachment ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewItem(item)}
                                                    title={item.attachment}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/90 hover:bg-slate-200 transition-colors cursor-pointer"
                                                >
                                                    <Paperclip size={13} className="text-slate-500 shrink-0" />
                                                    <span>1 File</span>
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
                                                    Belum Ada
                                                </span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.status === 'Publish' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    Publish
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                                    Draft
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
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewItem(item)}
                                                    title="Lihat Detail"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit Pengumuman"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Hapus Pengumuman"
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

                {/* 4. FOOTER PAGINASI */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    {/* Sisi Kiri: Info Jumlah Data */}
                    <div className="text-sm font-medium text-slate-600">
                        <span>
                            Menampilkan <span className="font-bold text-[#172135]">{startItem} - {endItem}</span> dari{' '}
                            <span className="font-bold text-[#172135]">{filteredData.length}</span> pengumuman
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

                        {/* Angka Pagination */}
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

            {/* 5. MODAL: TAMBAH PENGUMUMAN BARU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
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
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                            {/* 1. Judul Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Pengumuman <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Jadwal Pemadaman Listrik Sementara..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Isi Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Isi Pengumuman <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Tuliskan naskah pengumuman atau instruksi edaran selengkapnya di sini..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 3. Jadwal Publikasi Publik (Grid 2 Kolom) */}
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
                                            onChange={(e) =>
                                                setFormData({ ...formData, publishDate: e.target.value })
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
                                            onChange={(e) =>
                                                setFormData({ ...formData, publishTime: e.target.value })
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Lampiran Dokumen (PDF) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Lampiran Dokumen (PDF) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
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
                                                    {formData.attachment}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">Dokumen PDF Terlampir</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, attachment: null })
                                                if (fileInputRef.current) fileInputRef.current.value = ''
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
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                            attachmentError && !formData.attachment
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                ? 'border-[#159447] bg-[#f0fdf4]'
                                                : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud size={20} className={`mx-auto mb-1.5 ${attachmentError && !formData.attachment ? 'text-red-400' : 'text-slate-400'}`} />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau <span className="text-[#159447] underline">klik untuk memilih</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            <span className="text-red-500 font-semibold">Wajib dilampirkan</span> • Format PDF (Maks. 10 MB)
                                        </p>
                                    </div>
                                )}
                                {attachmentError && !formData.attachment && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={13} className="shrink-0" />
                                        Berkas dokumen lampiran (PDF) wajib diunggah.
                                    </p>
                                )}
                            </div>

                            {/* 5. Status */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Status Publikasi</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as PengumumanItem['status'],
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white text-slate-800 text-xs cursor-pointer"
                                >
                                    <option value="Publish">Publish (Tampilkan ke Publik)</option>
                                    <option value="Draft">Draft (Simpan Sementara)</option>
                                </select>
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
                                            {formData.authorName || 'Trias Firmansyah'}
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

                            {/* Tombol Aksi Form */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold shadow-xs cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan Pengumuman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. MODAL: EDIT PENGUMUMAN */}
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
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                            {/* 1. Judul Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Judul Pengumuman <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                                />
                            </div>

                            {/* 2. Isi Pengumuman */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Isi Pengumuman <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs leading-relaxed"
                                />
                            </div>

                            {/* 3. Jadwal Publikasi Publik (Grid 2 Kolom) */}
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
                                            onChange={(e) =>
                                                setFormData({ ...formData, publishDate: e.target.value })
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
                                            onChange={(e) =>
                                                setFormData({ ...formData, publishTime: e.target.value })
                                            }
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Lampiran Dokumen (PDF) */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">
                                    Lampiran Dokumen (PDF) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
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
                                                    {formData.attachment}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">Dokumen PDF Terlampir</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, attachment: null })
                                                if (editFileInputRef.current) editFileInputRef.current.value = ''
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
                                        onClick={() => editFileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                            attachmentError && !formData.attachment
                                                ? 'border-red-400 bg-red-50/40'
                                                : isDragging
                                                ? 'border-[#159447] bg-[#f0fdf4]'
                                                : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <UploadCloud size={20} className={`mx-auto mb-1.5 ${attachmentError && !formData.attachment ? 'text-red-400' : 'text-slate-400'}`} />
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tarik berkas PDF ke sini atau <span className="text-[#159447] underline">klik untuk memilih</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            <span className="text-red-500 font-semibold">Wajib dilampirkan</span> • Format PDF (Maks. 10 MB)
                                        </p>
                                    </div>
                                )}
                                {attachmentError && !formData.attachment && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={13} className="shrink-0" />
                                        Berkas dokumen lampiran (PDF) wajib diunggah.
                                    </p>
                                )}
                            </div>

                            {/* 5. Status */}
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Status Publikasi</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as PengumumanItem['status'],
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white text-slate-800 text-xs cursor-pointer"
                                >
                                    <option value="Publish">Publish</option>
                                    <option value="Draft">Draft</option>
                                </select>
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
                                            {formData.authorName || 'Trias Firmansyah'}
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

                            {/* Tombol Aksi Form */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold shadow-xs cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 7. MODAL: LIHAT / PREVIEW DETAIL PENGUMUMAN */}
            {previewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                                        previewItem.status === 'Publish'
                                            ? 'bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a]'
                                            : 'bg-[#fffbeb] border border-[#fef3c7] text-[#d97706]'
                                    }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            previewItem.status === 'Publish' ? 'bg-[#16a34a]' : 'bg-[#d97706]'
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
                            <div className="flex items-center gap-2 mt-2.5">
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

                        {/* Isi Konten */}
                        <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {previewItem.content}
                        </div>

                        {/* Area Unduh Lampiran Dokumen */}
                        {previewItem.attachment && (
                            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#172135] truncate">
                                            {previewItem.attachment}
                                        </p>
                                        <p className="text-[11px] text-slate-500">Berkas Lampiran Resmi (PDF)</p>
                                    </div>
                                </div>
                                <a
                                    href={`#download-${previewItem.attachment}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        alert(`Simulasi mengunduh berkas: ${previewItem.attachment}`)
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                                >
                                    <Download size={14} />
                                    <span>Unduh Lampiran</span>
                                </a>
                            </div>
                        )}

                        {/* Footer Modal */}
                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-[#566276] cursor-pointer"
                            >
                                Tutup Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: KONFIRMASI HAPUS */}
            {deletingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#172135] text-sm tracking-tight">
                                Hapus Pengumuman Ini?
                            </h4>
                            <p className="text-xs text-[#566276] mt-1 leading-relaxed">
                                Tindakan ini tidak dapat dibatalkan. Pengumuman akan dihapus permanen dari daftar publikasi.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(deletingId)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                            >
                                Hapus Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}