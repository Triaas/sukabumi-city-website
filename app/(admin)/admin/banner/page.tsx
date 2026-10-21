'use client'

import { useState, useMemo, useRef } from 'react'
import {
    PlusCircle,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    UploadCloud,
    Link as LinkIcon,
    Image as ImageIcon,
} from 'lucide-react'

// ─── 1. Interface BannerItem ──────────────────────────────────────────────────
export interface BannerItem {
    id: string
    title: string           // Identitas admin & alt SEO
    imageUrl: string        // URL gambar banner
    targetUrl: string       // URL tautan tujuan (opsional, bisa kosong)
    sortOrder: number       // Urutan tampil
    isActive: boolean       // Status aktif/nonaktif
}

// ─── Data Statis (Dummy) Minimal 4 Banner ────────────────────────────────────
const initialBanners: BannerItem[] = [
    {
        id: '1',
        title: 'Peringatan Hari Jadi Kota Sukabumi ke-112',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&h=600&q=80',
        targetUrl: 'https://sukabumikota.go.id/hari-jadi-112',
        sortOrder: 1,
        isActive: true,
    },
    {
        id: '2',
        title: 'Layanan Mall Pelayanan Publik (MPP) Digital Kota Sukabumi',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&h=600&q=80',
        targetUrl: 'https://sukabumikota.go.id/mpp-digital',
        sortOrder: 2,
        isActive: true,
    },
    {
        id: '3',
        title: 'Program Gerakan Ketahanan Pangan Perkotaan 2026',
        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&h=600&q=80',
        targetUrl: '',
        sortOrder: 3,
        isActive: true,
    },
    {
        id: '4',
        title: 'Kampanye Sukabumi Bebas Sampah – Ayo Pilah dari Rumah!',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1920&h=600&q=80',
        targetUrl: 'https://sukabumikota.go.id/bebas-sampah',
        sortOrder: 4,
        isActive: false,
    },
    {
        id: '5',
        title: 'Pendaftaran UMKM Go Digital Gelombang II – Daftarkan Usahamu',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&h=600&q=80',
        targetUrl: 'https://sukabumikota.go.id/umkm-go-digital',
        sortOrder: 5,
        isActive: true,
    },
]

const statusOptions = ['Semua Status', 'Aktif', 'Tidak Aktif']

// ─── Tipe FormData ────────────────────────────────────────────────────────────
type BannerFormData = {
    title: string
    imageUrl: string
    imagePreview: string   // URL preview lokal (object URL) atau URL remote
    targetUrl: string
    sortOrder: number
    isActive: boolean
}

export default function AdminBannerPage() {
    // ─── State Data ───────────────────────────────────────────────────────────
    const [bannerList, setBannerList] = useState<BannerItem[]>(initialBanners)

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<BannerItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<BannerFormData>({
        title: '',
        imageUrl: '',
        imagePreview: '',
        targetUrl: '',
        sortOrder: 1,
        isActive: true,
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // ─── Filter & Search Logic ────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        return bannerList.filter((item) => {
            const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
            const matchStatus =
                statusFilter === 'Semua Status' ||
                (statusFilter === 'Aktif' && item.isActive) ||
                (statusFilter === 'Tidak Aktif' && !item.isActive)
            return matchSearch && matchStatus
        })
    }, [bannerList, searchTerm, statusFilter])

    // ─── Pagination Logic ─────────────────────────────────────────────────────
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

    // ─── Modal & Form Handlers ────────────────────────────────────────────────
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
        setIsAddModalOpen(true)
    }

    const openEditModal = (item: BannerItem) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            imageUrl: item.imageUrl,
            imagePreview: item.imageUrl,
            targetUrl: item.targetUrl,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
        })
    }

    const handleImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Hanya berkas gambar yang diperbolehkan.')
            return
        }
        const objectUrl = URL.createObjectURL(file)
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

    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return
        if (!formData.imagePreview) {
            alert('Gambar banner wajib diunggah.')
            return
        }

        const newId = String(Date.now())
        const newItem: BannerItem = {
            id: newId,
            title: formData.title.trim(),
            imageUrl: formData.imagePreview, // simpan preview/url
            targetUrl: formData.targetUrl.trim(),
            sortOrder: formData.sortOrder,
            isActive: formData.isActive,
        }

        setBannerList([...bannerList, newItem])
        setIsAddModalOpen(false)
    }

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem || !formData.title.trim()) return

        setBannerList((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? {
                          ...item,
                          title: formData.title.trim(),
                          imageUrl: formData.imagePreview || item.imageUrl,
                          targetUrl: formData.targetUrl.trim(),
                          sortOrder: formData.sortOrder,
                          isActive: formData.isActive,
                      }
                    : item
            )
        )
        setEditingItem(null)
    }

    const handleDelete = (id: string) => {
        setBannerList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    // ─── Shared: Form Content (dipakai di Tambah & Edit) ─────────────────────
    const renderForm = (
        onSubmit: (e: React.FormEvent) => void,
        onClose: () => void,
        isEditMode: boolean
    ) => (
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
            {/* 1. Judul / Deskripsi Banner (Wajib) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-0.5">
                    Judul / Deskripsi Banner <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                    Digunakan untuk identitas admin dan teks alternatif (SEO).
                </p>
                <input
                    type="text"
                    required
                    placeholder="Contoh: Peringatan Hari Jadi Kota Sukabumi ke-112"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
                />
            </div>

            {/* 2. Gambar Banner (Wajib) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-0.5">
                    Gambar Banner <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                    Gunakan gambar berasio lanskap (Misal: 1920×600 px).
                </p>
                <input
                    type="file"
                    accept="image/*"
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
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow"
                            >
                                Ganti Gambar
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({ ...formData, imageUrl: '', imagePreview: '' })
                                }
                                className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                                title="Hapus gambar"
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
                            isDragging
                                ? 'border-[#159447] bg-[#f0fdf4]'
                                : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                        <UploadCloud size={26} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">
                            Tarik gambar ke sini atau{' '}
                            <span className="text-[#159447] underline">klik untuk memilih</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            PNG, JPG, WebP — Maks. 5 MB
                        </p>
                    </div>
                )}
            </div>

            {/* 3. Tautan Tujuan (Opsional) */}
            <div>
                <label className="block font-semibold text-[#172135] mb-1">
                    Tautan Tujuan{' '}
                    <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                    <LinkIcon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="url"
                        placeholder="https://sukabumikota.go.id/halaman-tujuan"
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] text-slate-800 text-xs"
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
                    value={formData.sortOrder}
                    onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white text-slate-800 text-xs transition-all"
                />
            </div>

            {/* 5. Status Aktif */}
            <div>
                <label className="block font-semibold text-[#172135] mb-1">
                    Status Aktif
                </label>
                <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.value === 'active' })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#159447] text-slate-800 text-xs cursor-pointer"
                >
                    <option value="active">Aktif (Ditampilkan di beranda)</option>
                    <option value="inactive">Sembunyikan Sementara</option>
                </select>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold text-xs shadow-xs cursor-pointer transition-all"
                    style={{ backgroundColor: '#159447' }}
                >
                    Simpan Banner
                </button>
            </div>
        </form>
    )

    return (
        <div className="w-full space-y-6 pb-10">
            {/* ─── 2. HEADER & ACTION BAR ─── */}
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

            {/* ─── FILTER BAR ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Input Search */}
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
                                                <Check size={13} className="text-[#159447]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── 3. TABEL BANNER ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-20">URUTAN</th>
                                <th className="py-4 px-4 text-left w-52">GAMBAR BANNER</th>
                                <th className="py-4 px-4 text-left">JUDUL &amp; TAUTAN</th>
                                <th className="py-4 px-4 text-center w-32">STATUS</th>
                                <th className="py-4 px-4 text-center w-24">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
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
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="w-40 h-14 object-cover rounded-lg border border-slate-200 bg-slate-100"
                                                />
                                            ) : (
                                                <div className="w-40 h-14 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                    <ImageIcon size={20} className="text-slate-300" />
                                                </div>
                                            )}
                                        </td>

                                        {/* JUDUL & TAUTAN */}
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-[#172135] text-[13px] leading-snug group-hover:text-[#159447] transition-colors">
                                                {item.title}
                                            </p>
                                            {item.targetUrl ? (
                                                <a
                                                    href={item.targetUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                                                    title={item.targetUrl}
                                                >
                                                    <LinkIcon size={10} className="shrink-0" />
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

                                        {/* STATUS Badge kapsul */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    Tidak Aktif
                                                </span>
                                            )}
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit Banner"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Hapus Banner"
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

                {/* ─── FOOTER PAGINASI ─── */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <div className="text-sm font-medium text-slate-600">
                        <span>
                            Menampilkan{' '}
                            <span className="font-bold text-[#172135]">
                                {startItem} - {endItem}
                            </span>{' '}
                            dari{' '}
                            <span className="font-bold text-[#172135]">{filteredData.length}</span>{' '}
                            banner
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
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

            {/* ─── 4. MODAL: TAMBAH BANNER ─── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
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
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {renderForm(handleSaveAdd, () => setIsAddModalOpen(false), false)}
                    </div>
                </div>
            )}

            {/* ─── 4. MODAL: EDIT BANNER ─── */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
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
                                onClick={() => setEditingItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {renderForm(handleSaveEdit, () => setEditingItem(null), true)}
                    </div>
                </div>
            )}

            {/* ─── 5. MODAL KONFIRMASI HAPUS ─── */}
            {deletingId && (
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
                                Tindakan ini tidak dapat dibatalkan. Banner akan dihapus permanen dan tidak lagi ditampilkan di beranda.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-1">
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
                                Hapus Banner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}