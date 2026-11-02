'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    PlusCircle,
    Search,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    AlertCircle,
    Eye,
    Pencil,
    Trash2,
    Undo,
    FileText,
    Clock,
    CheckCircle2
} from 'lucide-react'

// Tipe data Reporter
export interface Reporter {
    name: string
    role: string
    avatar: string
    avatarBg: string
}

// Tipe data BeritaItem (Status ditambah 'Menunggu Review')
export interface BeritaItem {
    id: string
    no: string
    title: string
    excerpt: string
    categories: string[]
    status: 'Published' | 'Draft' | 'Submitted'
    date: string
    time: string
    image: string
    reporter: Reporter
}

const categories = [
    'Semua kategori', 'Agama', 'Artikel', 'Bencana', 'Diskominfo', 'Ekonomi',
    'Hukum', 'Infrastruktur', 'Kesehatan', 'Layanan Publik', 'Legislatif',
    'Lingkungan', 'Olahraga', 'Pariwisata', 'Pendidikan', 'Pertanian',
    'Politik', 'Seni Budaya', 'Sosial', 'Teknologi', 'Transportasi', 'Umum', 'Walikota',
]

const statusOptions = ['Semua Status', 'Published', 'Submitted', 'Draft']

// Data Dummy khusus milik Budi Santoso
const initialBerita: BeritaItem[] = [
    {
        id: '1', no: '01', title: 'Optimalisasi MPP Digital di Era Modern', excerpt: 'Layanan terpadu cepat & ringkas...', categories: ['Pelayanan', 'Teknologi'], status: 'Published', date: '24 Okt 2026', time: '08:45 WIB', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
        reporter: { name: 'Budi Santoso', role: 'Reporter Lapangan', avatar: 'BS', avatarBg: 'bg-[#dcfce7] text-[#16a34a]' },
    },
    {
        id: '2', no: '02', title: 'Liputan Khusus: Perbaikan Gorong-Gorong Pusat Kota', excerpt: 'Mencegah banjir jelang musim hujan...', categories: ['Infrastruktur'], status: 'Submitted', date: '25 Okt 2026', time: '10:15 WIB', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=360&q=80',
        reporter: { name: 'Budi Santoso', role: 'Reporter Lapangan', avatar: 'BS', avatarBg: 'bg-[#dcfce7] text-[#16a34a]' },
    },
    {
        id: '3', no: '03', title: 'Persiapan Pasar Murah Ramadhan', excerpt: 'Wawancara dengan Kepala Dinas Perdagangan...', categories: ['Ekonomi'], status: 'Draft', date: '26 Okt 2026', time: '14:20 WIB', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        reporter: { name: 'Budi Santoso', role: 'Reporter Lapangan', avatar: 'BS', avatarBg: 'bg-[#dcfce7] text-[#16a34a]' },
    }
]

export default function ReporterBeritaPage() {
    const router = useRouter()
    const [beritaList, setBeritaList] = useState<BeritaItem[]>(initialBerita)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('Semua kategori')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [dateFilter, setDateFilter] = useState('Semua Waktu')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDateOpen, setIsDateOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>('Semua Status')

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(5)

    const [previewItem, setPreviewItem] = useState<BeritaItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Perhitungan Mini Stats
    const totalNaskah = beritaList.length
    const totalSubmitted = beritaList.filter(b => b.status === 'Submitted').length
    const totalPublished = beritaList.filter(b => b.status === 'Published').length

    // Filter & Search logic
    const filteredData = useMemo(() => {
        return beritaList.filter((item) => {
            const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
            const matchCategory = activeCategory === 'Semua kategori' || item.categories.some((cat) => cat.toLowerCase().includes(activeCategory.toLowerCase()))
            const matchStatus = statusFilter === 'Semua Status' || item.status === statusFilter
            return matchSearch && matchCategory && matchStatus
        })
    }, [beritaList, searchTerm, activeCategory, statusFilter])

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }))
    }, [filteredData])

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage))
    const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    const startItem = sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const endItem = Math.min(currentPage * rowsPerPage, sortedData.length)

    const handleDelete = (id: string) => {
        setBeritaList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    const handleUnsubmit = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menarik draf ini? Draf akan kembali ke mode edit dan ditarik dari antrean Redaksi.')) {
            setBeritaList((prev) => prev.map(item => item.id === id ? { ...item, status: 'Draft' } : item))
        }
    }

    const getCategoryBadgeClass = () => 'bg-slate-100 text-slate-700 border-slate-200'

    return (
        <div className="w-full space-y-6 pb-10">
            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">Berita Saya</h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Ruang kerja penulisan berita. Pantau status publikasi dan kelola draf Anda.
                    </p>
                </div>
                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <Link
                        href="/reporter/berita/tambah"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tulis Berita Baru</span>
                    </Link>
                </div>
            </div>

            {/* 2. MINI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText size={20} /></div>
                    <div><p className="text-xs font-semibold text-slate-500">Total Naskah</p><p className="text-xl font-bold text-[#172135]">{totalNaskah}</p></div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><Clock size={20} /></div>
                    <div><p className="text-xs font-semibold text-slate-500">Diajukan</p><p className="text-xl font-bold text-[#172135]">{totalSubmitted}</p></div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
                    <div><p className="text-xs font-semibold text-slate-500">Diterbitkan</p><p className="text-xl font-bold text-[#172135]">{totalPublished}</p></div>
                </div>
            </div>

            {/* 3. CARD PENCARIAN & FILTER (Sama seperti Admin) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" placeholder="Cari judul naskah..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447]"
                        />
                    </div>
                    {/* Filter Dropdowns (Kategori & Status) */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Dropdown Status */}
                        <div className="relative z-30">
                            <button
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                className="flex items-center justify-between gap-3 min-w-[150px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 cursor-pointer"
                            >
                                <span className="truncate">{statusFilter}</span><ChevronDown size={14} />
                            </button>
                            {isStatusOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsStatusOpen(false)} />
                                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl flex flex-col py-1.5 z-30 shadow-xl">
                                        {statusOptions.map((s) => (
                                            <button key={s} onClick={() => { setStatusFilter(s); setIsStatusOpen(false) }} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">{s}</button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. TABEL DATA BERITA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-center w-32">GAMBAR</th>
                                <th className="py-4 px-4 text-left min-w-[250px]">JUDUL</th>
                                <th className="py-4 px-4 text-center w-36">KATEGORI</th>
                                <th className="py-4 px-4 text-center w-36">STATUS</th>
                                <th className="py-4 px-4 text-left w-32">PUBLIKASI</th>
                                <th className="py-4 px-4 text-center w-36">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="py-4 px-4 text-center font-semibold text-slate-400">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="w-[84px] h-[54px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 mx-auto">
                                            <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-left">
                                        <p onClick={() => setPreviewItem(item)} className="font-bold text-[#172135] text-[13px] hover:text-[#159447] cursor-pointer line-clamp-2">{item.title}</p>
                                    </td>
                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-700">{item.categories[0]}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                        {item.status === 'Published' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] text-[#16a34a] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />Published</span>}
                                        {item.status === 'Submitted' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" />Submitted</span>}
                                        {item.status === 'Draft' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] text-[#d97706] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />Draft</span>}
                                    </td>
                                    <td className="py-4 px-4 text-left whitespace-nowrap">
                                        <div className="font-bold text-[#172135]">{item.date}</div>
                                        <div className="text-[11px] text-[#566276] mt-0.5">{item.time}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {/* Lihat (Semua status bisa) */}
                                            <button onClick={() => setPreviewItem(item)} title="Lihat Preview" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-500"><Eye size={14} /></button>

                                            {/* Edit & Hapus HANYA untuk Draft */}
                                            <button
                                                onClick={() => item.status === 'Draft' && router.push('/reporter/berita/tambah?id=' + item.id)}
                                                title="Edit Draf"
                                                className={`w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center ${item.status === 'Draft' ? 'text-slate-500 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed'}`}
                                            ><Pencil size={14} /></button>

                                            <button
                                                onClick={() => item.status === 'Draft' && setDeletingId(item.id)}
                                                title="Hapus Draf"
                                                className={`w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center ${item.status === 'Draft' ? 'text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed'}`}
                                            ><Trash2 size={14} /></button>

                                            {/* Unsubmit HANYA untuk Submitted */}
                                            {item.status === 'Submitted' && (
                                                <button onClick={() => handleUnsubmit(item.id)} title="Tarik Draf (Unsubmit)" className="w-7 h-7 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors cursor-pointer">
                                                    <Undo size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Preview & Delete dipertahankan sama seperti aslinya, disederhanakan visualisasinya agar tidak kepanjangan di kode ini */}
            {previewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setPreviewItem(null)} className="absolute top-4 right-4"><X size={18} /></button>
                        <h3 className="font-bold text-lg mb-2">{previewItem.title}</h3>
                        <p className="text-sm text-slate-600">{previewItem.excerpt}</p>
                    </div>
                </div>
            )}

            {deletingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border max-w-sm w-full p-5 text-center">
                        <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                        <h4 className="font-bold text-sm">Hapus Draf Ini?</h4>
                        <div className="flex justify-center gap-2 mt-4">
                            <button onClick={() => setDeletingId(null)} className="px-4 py-2 border rounded-xl text-xs">Batal</button>
                            <button onClick={() => handleDelete(deletingId)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}