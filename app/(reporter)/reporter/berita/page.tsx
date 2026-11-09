import Link from 'next/link'
import {
    PlusCircle,
    Search,
    Eye,
    Pencil,
    Trash2,
    Download,
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
import { unsubmitNewsAction } from '@/app/(admin)/admin/berita/actions'
import DeleteNewsButton from '@/components/DeleteNewsButton'
import BeritaFilterBar from '@/components/BeritaFilterBar'

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

interface ReporterBeritaPageProps {
    searchParams?: Promise<{
        q?: string
        category?: string
        status?: string
    }>
}

export default async function ReporterBeritaPage({
    searchParams,
}: ReporterBeritaPageProps) {
    const resolvedParams = searchParams ? await searchParams : {}
    const searchQuery = (resolvedParams.q || '').trim()
    const selectedCategory = resolvedParams.category || 'Semua kategori'
    const selectedStatus = resolvedParams.status || 'ALL'

    const allRows: BeritaAdminRow[] = await getAdminNewsList({
        role: 'REPORTER',
        authorName: 'Budi Santoso',
    })

    const filteredRows = allRows.filter((row) => {
        const matchSearch =
            !searchQuery ||
            row.title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchCategory =
            selectedCategory === 'Semua kategori' ||
            row.categoryName.toLowerCase() === selectedCategory.toLowerCase()

        const matchStatus =
            selectedStatus === 'ALL' || row.status === (selectedStatus as NewsStatus)

        return matchSearch && matchCategory && matchStatus
    })

    const totalNaskah = allRows.length
    const totalPublished = allRows.filter((b) => b.status === 'PUBLISHED').length
    const totalSubmitted = allRows.filter((b) => b.status === 'SUBMITTED').length
    const totalDraft = allRows.filter((b) => b.status === 'DRAFT').length

    return (
        <div className="w-full space-y-6 pb-10">
            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Berita Saya
                    </h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Total Naskah</p>
                        <p className="text-xl font-bold text-[#172135]">{totalNaskah}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Diterbitkan</p>
                        <p className="text-xl font-bold text-[#172135]">{totalPublished}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">Diserahkan</p>
                        <p className="text-xl font-bold text-[#172135]">{totalSubmitted}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
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
                basePath="/reporter/berita"
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                role="REPORTER"
                placeholder="Cari judul naskah..."
            />

            {/* 4. TABEL DATA BERITA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-center w-32">GAMBAR</th>
                                <th className="py-4 px-4 text-left min-w-[260px]">JUDUL</th>
                                <th className="py-4 px-4 text-center w-36">KATEGORI</th>
                                <th className="py-4 px-4 text-center w-36">STATUS</th>
                                <th className="py-4 px-4 text-left w-36">TANGGAL</th>
                                <th className="py-4 px-4 text-center w-36">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        Belum ada data berita di database atau tidak ada yang cocok dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, index) => {
                                    const statusColor =
                                        STATUS_COLORS[row.status] ?? STATUS_COLORS.DRAFT
                                    const statusLabel = getStatusLabel(
                                        row.status,
                                        'REPORTER'
                                    )
                                    const displayDateSource =
                                        row.published_at || row.created_at
                                    const isDraft = row.status === 'DRAFT'
                                    const isSubmitted = row.status === 'SUBMITTED'

                                    return (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-slate-50/60 transition-colors group"
                                        >
                                            {/* NO */}
                                            <td className="py-4 px-4 text-center font-semibold text-slate-400">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>

                                            {/* GAMBAR */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="w-[84px] h-[54px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 mx-auto flex items-center justify-center">
                                                    {row.image_url ? (
                                                        <img
                                                            src={row.image_url}
                                                            alt={row.title}
                                                            className="w-full h-full object-cover"
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
                                                    href={`/berita/${row.slug}?preview=true`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-[#172135] text-[13px] hover:text-[#159447] transition-colors line-clamp-2"
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
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-700 border-slate-200">
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

                                            {/* TANGGAL */}
                                            <td className="py-4 px-4 text-left whitespace-nowrap">
                                                <div className="font-bold text-[#172135]">
                                                    {formatIndoShortDate(displayDateSource)}
                                                </div>
                                                <div className="text-[11px] text-[#566276] mt-0.5">
                                                    {formatWibTime(displayDateSource)}
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* 1. Mata (Preview): Selalu aktif ke /berita/[slug]?preview=true */}
                                                    <Link
                                                        href={`/berita/${row.slug}?preview=true`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Pratinjau Naskah"
                                                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-green-50/50 hover:border-[#159447]/40 text-slate-500 hover:text-[#159447] transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>

                                                    {/* 2. Pena (Edit): Aktif HANYA jika status === 'DRAFT' */}
                                                    {isDraft ? (
                                                        <Link
                                                            href={`/reporter/berita/tambah?id=${row.id}`}
                                                            title="Edit Draf"
                                                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            title="Hanya naskah berstatus Draf yang dapat diedit"
                                                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-60 flex items-center justify-center cursor-not-allowed"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}

                                                    {/* 3. Tong Sampah (Hapus): Aktif HANYA jika status === 'DRAFT' */}
                                                    <DeleteNewsButton
                                                        id={row.id}
                                                        title={row.title}
                                                        disabled={!isDraft}
                                                        disabledTitle="Hanya naskah berstatus Draf yang dapat dihapus"
                                                    />

                                                    {/* 4. Unsubmit (Tarik Naskah): HANYA muncul jika status === 'SUBMITTED' */}
                                                    {isSubmitted && (
                                                        <form
                                                            action={async () => {
                                                                'use server'
                                                                await unsubmitNewsAction(row.id)
                                                            }}
                                                            className="inline-flex"
                                                        >
                                                            <button
                                                                type="submit"
                                                                title="Tarik Naskah ke Draf (Unsubmit)"
                                                                className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                        </form>
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
                        naskah
                    </div>
                </div>
            </div>
        </div>
    )
}
