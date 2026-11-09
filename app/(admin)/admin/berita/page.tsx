import Link from 'next/link'
import {
    PlusCircle,
    Search,
    Eye,
    Pencil,
    Trash2,
    Image as ImageIcon,
    FileText,
    Clock,
    CheckCircle2,
} from 'lucide-react'
import { getAdminNewsList } from '@/lib/db'
import {
    getStatusLabel,
    STATUS_COLORS,
    type BeritaAdminRow,
    type NewsStatus,
} from '@/lib/types/berita'
import { CATEGORY_FILTER_OPTIONS } from '@/lib/constants/categories'
import DeleteNewsButton from '@/components/DeleteNewsButton'
import UnsubmitNewsButton from '@/components/UnsubmitNewsButton'
import BeritaFilterBar from '@/components/BeritaFilterBar'
import BeritaNotification from '@/components/BeritaNotification'

export const dynamic = 'force-dynamic'

function formatIndoShortDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    })
}

function formatWibTime(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    const formatted = new Date(isoDate)
        .toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        })
        .replace('.', ':')
    return `${formatted} WIB`
}

function getInitials(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || 'AD'
    )
}

interface AdminBeritaPageProps {
    searchParams?: Promise<{
        q?: string
        category?: string
        status?: string
        notif?: string
    }>
}

export default async function AdminBeritaPage({ searchParams }: AdminBeritaPageProps) {
    const resolvedParams = searchParams ? await searchParams : {}
    const searchQuery = (resolvedParams.q || '').trim()
    const selectedCategory = resolvedParams.category || 'Semua kategori'
    const selectedStatus = resolvedParams.status || 'ALL'
    const notifKey = resolvedParams.notif

    const allRows: BeritaAdminRow[] = await getAdminNewsList({
        role: 'ADMIN_BERITA',
    })

    const filteredRows = allRows.filter((row) => {
        const matchSearch =
            !searchQuery ||
            row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.author_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchCategory =
            selectedCategory === 'Semua kategori' ||
            row.categoryName.toLowerCase() === selectedCategory.toLowerCase()

        const matchStatus =
            selectedStatus === 'ALL' || row.status === (selectedStatus as NewsStatus)

        return matchSearch && matchCategory && matchStatus
    })

    const totalNaskah = allRows.length
    const totalPublished = allRows.filter((r) => r.status === 'PUBLISHED').length
    const totalNeedReview = allRows.filter((r) => r.status === 'SUBMITTED').length
    const totalDraft = allRows.filter((r) => r.status === 'DRAFT').length

    return (
        <div className="w-full space-y-6 pb-10">
            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Kelola Berita
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Kelola dan pantau seluruh publikasi berita kedinasan kota.
                    </p>
                </div>

                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <Link
                        href="/admin/berita/tambah"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tambah Berita Baru</span>
                    </Link>
                </div>
            </div>

            {/* NOTIFIKASI STATUS AKSI */}
            <BeritaNotification notifKey={notifKey} />

            {/* 2. RINGKASAN STATISTIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Total Naskah</p>
                        <p className="text-xl font-bold text-[#172135]">{totalNaskah}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#159447] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Diterbitkan</p>
                        <p className="text-xl font-bold text-[#172135]">{totalPublished}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Perlu Peninjauan</p>
                        <p className="text-xl font-bold text-[#172135]">{totalNeedReview}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Pencil size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Draf</p>
                        <p className="text-xl font-bold text-[#172135]">{totalDraft}</p>
                    </div>
                </div>
            </div>

            {/* 3. CARD PENCARIAN & FILTER (DROPDOWN GAYA PENGUMUMAN) */}
            <BeritaFilterBar
                basePath="/admin/berita"
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                role="ADMIN_BERITA"
                placeholder="Cari judul berita atau nama penulis..."
            />

            {/* 4. TABEL DATA BERITA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-center w-32">GAMBAR</th>
                                <th className="py-4 px-4 text-left min-w-[240px]">JUDUL</th>
                                <th className="py-4 px-4 text-center w-36">KATEGORI</th>
                                <th className="py-4 px-4 text-center w-36">STATUS</th>
                                <th className="py-4 px-4 text-left w-36">TANGGAL</th>
                                <th className="py-4 px-4 text-left w-48">PENULIS / REPORTER</th>
                                <th className="py-4 px-4 text-center w-36">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Belum ada data berita di database atau tidak ada yang cocok dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, index) => {
                                    const statusColor =
                                        STATUS_COLORS[row.status] ?? STATUS_COLORS.DRAFT
                                    const statusLabel = getStatusLabel(
                                        row.status,
                                        'ADMIN_BERITA'
                                    )
                                    const displayDateSource =
                                        row.published_at || row.created_at
                                    const isPublished = row.status === 'PUBLISHED'
                                    const viewHref = isPublished
                                        ? `/berita/${row.slug}`
                                        : `/berita/${row.slug}?preview=true`

                                    return (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-slate-50/60 transition-colors group"
                                        >
                                            {/* NO */}
                                            <td className="py-4 px-4 text-center font-semibold text-slate-400 text-xs">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>

                                            {/* GAMBAR */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="w-[84px] h-[54px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0 shadow-2xs mx-auto flex items-center justify-center">
                                                    {row.image_url ? (
                                                        <img
                                                            src={row.image_url}
                                                            alt={row.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            size={18}
                                                            className="text-slate-300"
                                                        />
                                                    )}
                                                </div>
                                            </td>

                                            {/* JUDUL */}
                                            <td className="py-4 px-4 text-left">
                                                <Link
                                                    href={viewHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-[#172135] text-xs sm:text-[13px] hover:text-[#159447] transition-colors line-clamp-2"
                                                >
                                                    {row.title}
                                                </Link>
                                                {row.excerpt && (
                                                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                        {row.excerpt}
                                                    </p>
                                                )}
                                            </td>

                                            {/* KATEGORI */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-700 border-slate-200">
                                                    {row.categoryName}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`}
                                                    />
                                                    {statusLabel}
                                                </span>
                                            </td>

                                            {/* TANGGAL PUBLIKASI / PEMBUATAN */}
                                            <td className="py-4 px-4 text-left whitespace-nowrap">
                                                <div className="font-bold text-[#172135] text-xs">
                                                    {formatIndoShortDate(displayDateSource)}
                                                </div>
                                                <div className="text-[11px] text-[#566276] mt-0.5">
                                                    {formatWibTime(displayDateSource)}
                                                </div>
                                            </td>

                                            {/* PENULIS / REPORTER (Hanya Avatar & Nama Dinamis) */}
                                            <td className="py-4 px-4 text-left">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
                                                        {getInitials(row.author_name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#172135] text-xs truncate">
                                                            {row.author_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* 1. Mata (Preview): Aktif HANYA jika status BUKAN 'PUBLISHED' */}
                                                    {!isPublished ? (
                                                        <Link
                                                            href={`/berita/${row.slug}?preview=true`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Pratinjau Naskah"
                                                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#159447] hover:border-[#159447]/40 hover:bg-green-50/50 flex items-center justify-center transition-colors"
                                                        >
                                                            <Eye size={14} />
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            title="Judul berita dapat diklik untuk melihat berita tayang"
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
                                                    <Link
                                                        href={`/admin/berita/tambah?id=${row.id}`}
                                                        title="Edit Berita"
                                                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                    </Link>

                                                    {/* 3. Tong Sampah (Hapus): SELALU AKTIF di semua status */}
                                                    <DeleteNewsButton
                                                        id={row.id}
                                                        title={row.title}
                                                    />

                                                    {/* 4. Unpublish (Turunkan Tayang): HANYA muncul jika status === 'PUBLISHED' */}
                                                    {isPublished && (
                                                        <UnsubmitNewsButton
                                                            id={row.id}
                                                            title={row.title}
                                                            mode="UNPUBLISH"
                                                            authorRole={row.author_role}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. FOOTER INFO JUMLAH DATA */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <div className="text-xs sm:text-sm font-medium text-slate-600">
                        Menampilkan{' '}
                        <span className="font-bold text-[#172135]">
                            {filteredRows.length}
                        </span>{' '}
                        dari{' '}
                        <span className="font-bold text-[#172135]">
                            {allRows.length}
                        </span>{' '}
                        berita
                    </div>
                </div>
            </div>
        </div>
    )
}
