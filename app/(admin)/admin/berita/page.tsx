'use client'

import { useState, useMemo } from 'react'
import {
    PlusCircle,
    Search,
    Calendar,
    SlidersHorizontal,
    ChevronDown,
    ArrowDown,
    ArrowUp,
    Eye,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react'

// Tipe data Reporter
export interface Reporter {
    name: string
    role: string
    avatar: string
    avatarBg: string
}

// Tipe data BeritaItem
export interface BeritaItem {
    id: string
    no: string
    title: string
    excerpt: string
    category: 'Pelayanan' | 'Ekonomi' | 'Pemerintahan' | 'Kesehatan'
    status: 'Publish' | 'Draft'
    date: string
    time: string
    image: string
    reporter: Reporter
}

// Data awal berita sesuai screenshot desain
const initialBerita: BeritaItem[] = [
    {
        id: '1',
        no: '01',
        title: 'Optimalisasi MPP Digital',
        excerpt: 'Layanan terpadu cepat & ringkas',
        category: 'Pelayanan',
        status: 'Publish',
        date: '24 Okt 2024',
        time: '08:45 WIB',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '2',
        no: '02',
        title: 'Revitalisasi Pasar Induk II',
        excerpt: 'Zona sanitasi & pangan higienis',
        category: 'Ekonomi',
        status: 'Publish',
        date: '23 Okt 2024',
        time: '16:10 WIB',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '3',
        no: '03',
        title: 'Perda APBD Perubahan',
        excerpt: 'Prioritas belanja daerah difokuskan',
        category: 'Pemerintahan',
        status: 'Draft',
        date: '22 Okt 2024',
        time: '11:00 WIB',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '4',
        no: '04',
        title: 'Gerakan Bebas Stunting',
        excerpt: 'Suplemen nutrisi & pantau gizi',
        category: 'Kesehatan',
        status: 'Publish',
        date: '21 Okt 2024',
        time: '14:20 WIB',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '5',
        no: '05',
        title: 'Uji Beban Jembatan Lingkar',
        excerpt: 'Sertifikasi kelayakan operasional',
        category: 'Pemerintahan',
        status: 'Publish',
        date: '19 Okt 2024',
        time: '09:15 WIB',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
]

export default function AdminBeritaPage() {
    const [beritaList, setBeritaList] = useState<BeritaItem[]>(initialBerita)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('Semua')
    const [dateFilter, setDateFilter] = useState('30 Hari Terakhir')
    const [isDateOpen, setIsDateOpen] = useState(false)
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [statusFilter, setStatusFilter] = useState<string>('Semua')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [isRowsOpen, setIsRowsOpen] = useState(false)

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [previewItem, setPreviewItem] = useState<BeritaItem | null>(null)
    const [editingItem, setEditingItem] = useState<BeritaItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form state for add / edit
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        category: 'Pelayanan' as BeritaItem['category'],
        status: 'Publish' as BeritaItem['status'],
        image: '',
        reporterName: 'Bambang I.',
        reporterRole: 'Wartawan Ahli',
    })

    // Filter & Search logic
    const filteredData = useMemo(() => {
        return beritaList.filter((item) => {
            const matchSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reporter.name.toLowerCase().includes(searchTerm.toLowerCase())

            const matchCategory =
                activeCategory === 'Semua' || item.category === activeCategory

            const matchStatus =
                statusFilter === 'Semua' || item.status === statusFilter

            return matchSearch && matchCategory && matchStatus
        })
    }, [beritaList, searchTerm, activeCategory, statusFilter])

    // Sort logic
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.id.localeCompare(a.id)
            } else {
                return a.id.localeCompare(b.id)
            }
        })
    }, [filteredData, sortOrder])

    // Handle open add modal
    const openAddModal = () => {
        setFormData({
            title: '',
            excerpt: '',
            category: 'Pelayanan',
            status: 'Publish',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
            reporterName: 'Bambang I.',
            reporterRole: 'Wartawan Ahli',
        })
        setIsAddModalOpen(true)
    }

    // Handle save new item
    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        const newId = String(beritaList.length + 1)
        const formattedNo = newId.padStart(2, '0')

        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
        }

        const newItem: BeritaItem = {
            id: newId,
            no: formattedNo,
            title: formData.title,
            excerpt: formData.excerpt || 'Ringkasan publikasi kedinasan daerah...',
            category: formData.category,
            status: formData.status,
            date: '24 Okt 2024',
            time: '10:00 WIB',
            image:
                formData.image.trim() ||
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
            reporter: {
                name: formData.reporterName,
                role: formData.reporterRole,
                avatar: getInitials(formData.reporterName),
                avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
            },
        }

        setBeritaList([newItem, ...beritaList])
        setIsAddModalOpen(false)
    }

    // Handle open edit modal
    const openEditModal = (item: BeritaItem) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            excerpt: item.excerpt,
            category: item.category,
            status: item.status,
            image: item.image,
            reporterName: item.reporter.name,
            reporterRole: item.reporter.role,
        })
    }

    // Handle save edit
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return

        setBeritaList((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        title: formData.title,
                        excerpt: formData.excerpt,
                        category: formData.category,
                        status: formData.status,
                        image: formData.image,
                        reporter: {
                            ...item.reporter,
                            name: formData.reporterName,
                            role: formData.reporterRole,
                        },
                    }
                    : item
            )
        )
        setEditingItem(null)
    }

    // Handle delete
    const handleDelete = (id: string) => {
        setBeritaList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    // Badge style helper for category
    const getCategoryBadgeClass = (_category?: string) => {
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }

    return (
        <div className="w-full space-y-6 pb-10">
            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Kelola Berita
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Pusat publikasi informasi, liputan kegiatan kedinasan, dan dokumentasi program daerah secara terpadu.
                    </p>
                </div>

                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tambah Berita Baru</span>
                    </button>
                </div>
            </div>

            {/* 2. CARD PENCARIAN & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
                {/* Baris Pertama: Input Cari, Tombol Kategori, Date Filter, & Filter Button */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    {/* Input Search */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Cari judul berita, reporter, atau kata kunci..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200/90 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Chips Kategori */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0">
                        {['Semua', 'Pemerintahan', 'Ekonomi', 'Pelayanan'].map((cat) => {
                            const isActive = activeCategory === cat
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                                            ? 'bg-[#159447] text-white shadow-xs'
                                            : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                                        }`}
                                    style={isActive ? { backgroundColor: '#159447', color: '#ffffff' } : undefined}
                                >
                                    {cat}
                                </button>
                            )
                        })}
                    </div>

                    {/* Tombol Filter Waktu & Tombol Filter Ikon */}
                    <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                        {/* Filter Waktu Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDateOpen(!isDateOpen)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                <Calendar size={15} className="text-slate-500" />
                                <span>{dateFilter}</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>

                            {isDateOpen && (
                                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 text-xs">
                                    {['7 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini', 'Semua Waktu'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setDateFilter(opt)
                                                setIsDateOpen(false)
                                            }}
                                            className={`w-full text-left px-3.5 py-2 font-medium hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${dateFilter === opt ? 'text-[#159447] font-bold bg-slate-50' : 'text-slate-600'
                                                }`}
                                        >
                                            <span>{opt}</span>
                                            {dateFilter === opt && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tombol Filter Tambahan */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-2 rounded-xl border border-slate-200/90 transition-colors flex items-center justify-center cursor-pointer ${statusFilter !== 'Semua' || isFilterOpen
                                        ? 'bg-[#159447] text-white border-[#159447]'
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                style={
                                    statusFilter !== 'Semua' || isFilterOpen
                                        ? { backgroundColor: '#159447', borderColor: '#159447', color: '#ffffff' }
                                        : undefined
                                }
                                title="Filter Status"
                            >
                                <SlidersHorizontal size={16} />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-2 text-xs">
                                    <div className="font-bold text-slate-400 uppercase text-[10px] px-2 py-1">
                                        Filter Status
                                    </div>
                                    {['Semua', 'Publish', 'Draft'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status)
                                                setIsFilterOpen(false)
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${statusFilter === status
                                                    ? 'text-[#159447] font-bold bg-slate-50'
                                                    : 'text-slate-600'
                                                }`}
                                        >
                                            <span>{status === 'Semua' ? 'Semua Status' : status}</span>
                                            {statusFilter === status && <Check size={13} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Baris Kedua: Ringkasan Filter & Sorting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>Menampilkan hasil terfilter:</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-slate-200 bg-white font-semibold text-[#172135] text-[11px]">
                            {activeCategory === 'Semua' ? 'Semua Kategori' : activeCategory}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>
                            <strong className="text-[#172135] font-semibold">{filteredData.length}</strong> Berita Ditemukan
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:self-auto">
                        <span className="text-[11px] font-bold text-[#566276]/60 tracking-wider">
                            URUTKAN:
                        </span>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="inline-flex items-center gap-1 font-bold text-[#159447] hover:underline cursor-pointer"
                        >
                            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
                            {sortOrder === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. TABEL DATA BERITA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-center w-32">GAMBAR</th>
                                <th className="py-4 px-4 text-left w-72">JUDUL</th>
                                <th className="py-4 px-4 text-center w-36">KATEGORI</th>
                                <th className="py-4 px-4 text-center w-28">STATUS</th>
                                <th className="py-4 px-4 text-left w-32">PUBLIKASI</th>
                                <th className="py-4 px-4 text-left w-48">REPORTER</th>
                                <th className="py-4 px-4 text-center w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Tidak ada berita yang cocok dengan filter atau kata kunci.
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 transition-colors group"
                                    >
                                        {/* NO */}
                                        <td className="py-4 px-4 text-center font-semibold text-slate-400 text-xs">
                                            {item.no}
                                        </td>

                                        {/* GAMBAR */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="w-[84px] h-[54px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0 shadow-2xs mx-auto">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80'
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* JUDUL */}
                                        <td className="py-4 px-4 text-left">
                                            <p
                                                onClick={() => setPreviewItem(item)}
                                                className="font-bold text-[#172135] text-xs sm:text-[13px] hover:text-[#159447] cursor-pointer transition-colors line-clamp-2"
                                            >
                                                {item.title}
                                            </p>
                                        </td>

                                        {/* KATEGORI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                                                    item.category
                                                )}`}
                                            >
                                                {item.category}
                                            </span>
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

                                        {/* REPORTER */}
                                        <td className="py-4 px-4 text-left">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${item.reporter.avatarBg}`}
                                                >
                                                    {item.reporter.avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#172135] text-xs truncate">
                                                        {item.reporter.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#566276] truncate">
                                                        {item.reporter.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setPreviewItem(item)}
                                                    title="Lihat Detail"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit Berita"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Hapus Berita"
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
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 bg-white">
                    {/* Sisi Kiri: Menampilkan & Dropdown Baris */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span>
                            Menampilkan <span className="font-bold text-[#172135]">1 - {sortedData.length}</span> dari{' '}
                            <span className="font-bold text-[#172135]">48</span> berita
                        </span>

                        <div className="flex items-center gap-1.5">
                            <span>Baris:</span>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                                    className="border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1 font-semibold cursor-pointer"
                                >
                                    <span>{rowsPerPage}</span>
                                    <ChevronDown size={13} className="text-slate-400" />
                                </button>

                                {isRowsOpen && (
                                    <div className="absolute bottom-full mb-1 left-0 w-16 bg-white border border-slate-200 rounded-lg shadow-md py-1 z-20">
                                        {[5, 10, 20].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => {
                                                    setRowsPerPage(num)
                                                    setIsRowsOpen(false)
                                                }}
                                                className={`w-full text-left px-2.5 py-1 text-xs hover:bg-slate-50 cursor-pointer ${rowsPerPage === num ? 'font-bold text-[#159447]' : 'text-slate-600'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Navigasi Halaman */}
                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs px-2 py-1 transition-colors cursor-pointer"
                        >
                            &lt; Sebelumnya
                        </button>

                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${currentPage === 1
                                    ? 'bg-[#159447] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            style={currentPage === 1 ? { backgroundColor: '#159447', color: '#ffffff' } : undefined}
                        >
                            1
                        </button>

                        <button
                            onClick={() => setCurrentPage(2)}
                            className={`w-7 h-7 rounded-md font-medium text-xs flex items-center justify-center transition-colors cursor-pointer ${currentPage === 2
                                    ? 'bg-[#159447] text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            style={currentPage === 2 ? { backgroundColor: '#159447', color: '#ffffff' } : undefined}
                        >
                            2
                        </button>

                        <button
                            onClick={() => setCurrentPage(3)}
                            className={`w-7 h-7 rounded-md font-medium text-xs flex items-center justify-center transition-colors cursor-pointer ${currentPage === 3
                                    ? 'bg-[#159447] text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            style={currentPage === 3 ? { backgroundColor: '#159447', color: '#ffffff' } : undefined}
                        >
                            3
                        </button>

                        <span className="text-slate-400 text-xs px-0.5">...</span>

                        <button
                            onClick={() => setCurrentPage(9)}
                            className={`w-7 h-7 rounded-md font-medium text-xs flex items-center justify-center transition-colors cursor-pointer ${currentPage === 9
                                    ? 'bg-[#159447] text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            style={currentPage === 9 ? { backgroundColor: '#159447', color: '#ffffff' } : undefined}
                        >
                            9
                        </button>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(9, p + 1))}
                            className="font-semibold text-xs text-slate-700 hover:text-[#159447] px-2 py-1 transition-colors cursor-pointer"
                        >
                            Selanjutnya &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. MODAL: TAMBAH BERITA BARU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-bold text-[#172135] text-base tracking-tight">Tambah Berita Baru</h3>
                                <p className="text-xs text-[#566276]">Isi formulir publikasi siaran pers daerah.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Judul Berita</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Optimalisasi MPP Digital..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Ringkasan Berita</label>
                                <textarea
                                    rows={2}
                                    placeholder="Layanan terpadu cepat & ringkas..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category: e.target.value as BeritaItem['category'],
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Pelayanan">Pelayanan</option>
                                        <option value="Ekonomi">Ekonomi</option>
                                        <option value="Pemerintahan">Pemerintahan</option>
                                        <option value="Kesehatan">Kesehatan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as BeritaItem['status'],
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Publish">Publish</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Nama Reporter</label>
                                    <input
                                        type="text"
                                        value={formData.reporterName}
                                        onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Jabatan / Role</label>
                                    <input
                                        type="text"
                                        value={formData.reporterRole}
                                        onChange={(e) => setFormData({ ...formData, reporterRole: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">URL Gambar Thumbnail</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                />
                            </div>

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
                                    Simpan & Publikasikan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. MODAL: EDIT BERITA */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-bold text-[#172135] text-base tracking-tight">Edit Berita</h3>
                                <p className="text-xs text-[#566276]">Perbarui data publikasi nomor #{editingItem.no}</p>
                            </div>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-medium text-[#172135] mb-1">Judul Berita</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-[#172135] mb-1">Ringkasan Berita</label>
                                <textarea
                                    rows={2}
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-[#172135] mb-1">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category: e.target.value as BeritaItem['category'],
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Pelayanan">Pelayanan</option>
                                        <option value="Ekonomi">Ekonomi</option>
                                        <option value="Pemerintahan">Pemerintahan</option>
                                        <option value="Kesehatan">Kesehatan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-[#172135] mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as BeritaItem['status'],
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Publish">Publish</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-[#172135] mb-1">URL Gambar Thumbnail</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-medium shadow-xs cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 7. MODAL: LIHAT / PREVIEW DETAIL BERITA */}
            {previewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
                        <div className="relative h-48 w-full bg-slate-100">
                            <img
                                src={previewItem.image}
                                alt={previewItem.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                                        previewItem.category
                                    )}`}
                                >
                                    {previewItem.category}
                                </span>
                                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#172135] shadow-xs">
                                    {previewItem.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 pt-2 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#172135] tracking-tight">{previewItem.title}</h3>
                                <p className="text-xs text-[#566276] mt-1 leading-relaxed">
                                    {previewItem.excerpt}
                                </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${previewItem.reporter.avatarBg}`}
                                    >
                                        {previewItem.reporter.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#172135]">{previewItem.reporter.name}</div>
                                        <div className="text-[11px] text-[#566276]">{previewItem.reporter.role}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-[#172135]">{previewItem.date}</div>
                                    <div className="text-[11px] text-[#566276]">{previewItem.time}</div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium text-xs text-[#566276] cursor-pointer"
                                >
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: KONFIRMASI HAPUS */}
            {deletingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#172135] text-sm tracking-tight">Hapus Berita Ini?</h4>
                            <p className="text-xs text-[#566276] mt-1">
                                Tindakan ini tidak dapat dibatalkan. Berita akan dihapus dari daftar publikasi.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 text-xs font-medium cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
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