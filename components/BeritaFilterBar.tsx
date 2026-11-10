'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronDown, X } from 'lucide-react'
import { OFFICIAL_CATEGORIES } from '@/lib/constants/categories'

interface BeritaFilterBarProps {
    basePath: string
    searchQuery: string
    selectedCategory: string
    selectedStatus: string
    availableCategories?: string[]
    role?: 'ADMIN_BERITA' | 'REPORTER'
    placeholder?: string
}

export default function BeritaFilterBar({
    basePath,
    searchQuery,
    selectedCategory,
    selectedStatus,
    availableCategories,
    role = 'ADMIN_BERITA',
    placeholder = 'Cari judul berita atau nama penulis...',
}: BeritaFilterBarProps) {
    const router = useRouter()
    const [searchInput, setSearchInput] = useState(searchQuery)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)

    const categorySource =
        availableCategories && availableCategories.length > 0
            ? availableCategories
            : [...OFFICIAL_CATEGORIES]
    const categoryOptions = [
        'Semua kategori',
        ...categorySource.filter(
            (cat) => cat.trim().toLowerCase() !== 'semua kategori'
        ),
    ]

    const statusOptions = [
        { label: 'Semua Status', value: 'ALL' },
        { label: 'Diterbitkan', value: 'PUBLISHED' },
        {
            label: role === 'REPORTER' ? 'Diserahkan' : 'Perlu Peninjauan',
            value: 'SUBMITTED',
        },
        { label: 'Draf', value: 'DRAFT' },
    ]

    const currentStatusOption =
        statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0]

    const applyFilters = (updates: {
        q?: string
        category?: string
        status?: string
    }) => {
        const nextQ = updates.q !== undefined ? updates.q.trim() : searchInput.trim()
        const nextCategory =
            updates.category !== undefined ? updates.category : selectedCategory
        const nextStatus = updates.status !== undefined ? updates.status : selectedStatus

        const params = new URLSearchParams()
        if (nextQ) params.set('q', nextQ)
        if (nextCategory && nextCategory !== 'Semua kategori') {
            params.set('category', nextCategory)
        }
        if (nextStatus && nextStatus !== 'ALL') {
            params.set('status', nextStatus)
        }

        const qs = params.toString()
        router.push(`${basePath}${qs ? `?${qs}` : ''}`)
    }

    const hasActiveFilter =
        Boolean(searchQuery) ||
        selectedCategory !== 'Semua kategori' ||
        selectedStatus !== 'ALL'

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* 1. Input Pencarian */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        applyFilters({ q: searchInput })
                    }}
                    role="search"
                    className="relative flex-1 min-w-[240px]"
                >
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={placeholder}
                        aria-label="Cari berita"
                        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput('')
                                applyFilters({ q: '' })
                            }}
                            aria-label="Hapus pencarian"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </form>

                {/* 2. Grup Dropdown Kategori & Status (Desain Pengumuman) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Dropdown Kategori */}
                    <div className="relative z-30">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCategoryOpen(!isCategoryOpen)
                                setIsStatusOpen(false)
                            }}
                            className="flex items-center justify-between gap-3 min-w-[160px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                        >
                            <span className="truncate">{selectedCategory}</span>
                            <ChevronDown
                                size={14}
                                className={`shrink-0 transition-transform duration-200 ${
                                    isCategoryOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {isCategoryOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsCategoryOpen(false)}
                                />
                                <div className="absolute left-0 top-full mt-1.5 w-56 max-h-[280px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30">
                                    {categoryOptions.map((cat) => {
                                        const isSelected =
                                            selectedCategory.toLowerCase() ===
                                            cat.toLowerCase()
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setIsCategoryOpen(false)
                                                    applyFilters({ category: cat })
                                                }}
                                                className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Dropdown Status */}
                    <div className="relative z-30">
                        <button
                            type="button"
                            onClick={() => {
                                setIsStatusOpen(!isStatusOpen)
                                setIsCategoryOpen(false)
                            }}
                            className="flex items-center justify-between gap-3 min-w-[130px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                        >
                            <span className="truncate">{currentStatusOption.label}</span>
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
                                    {statusOptions.map((opt) => {
                                        const isSelected =
                                            selectedStatus === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setIsStatusOpen(false)
                                                    applyFilters({ status: opt.value })
                                                }}
                                                className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tombol Reset Filter */}
                    {hasActiveFilter && (
                        <Link
                            href={basePath}
                            onClick={() => setSearchInput('')}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Reset
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

