'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { allNews } from '@/data/newsData'

export default function BeritaPage() {
  // 'Pilih Kategori' = kondisi awal, belum berinteraksi
  const [activeCategory, setActiveCategory] = useState<string>('Pilih Kategori')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Ref untuk scroll ke section berita saat ganti halaman
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentPage > 1) {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const categories = ['Semua kategori', 'Agama', 'Kesehatan', 'Lingkungan', 'Pertanian', 'Hukum', 'Infrastruktur', 'Pendidikan', 'Sosial']

  // Fungsi handler ketika kategori dipilih
  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat)
    setIsDropdownOpen(false)
    setCurrentPage(1) // Wajib reset ke halaman 1 tiap kali ganti filter kategori
  }

  // Logika Filter: tampilkan semua jika belum ada kategori dipilih atau "Semua kategori"
  const filteredNews = (activeCategory === 'Pilih Kategori' || activeCategory === 'Semua kategori')
    ? allNews
    : allNews.filter(news => news.category === activeCategory)

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)

  // Memotong array berita sesuai halaman yang sedang aktif
  const currentNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper: hasilkan array nomor halaman + ellipsis ('...')
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section
        className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/news.webp')` }}
      >
        <div className="absolute inset-0 z-0 bg-slate-900/65" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Berita</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Kumpulan berita terkini dan liputan kegiatan seputar Kota Sukabumi.
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">

          {/* Filter Kategori Berita - Scalable Dropdown */}
          <div ref={contentRef} className="mb-10 flex flex-col sm:flex-row sm:items-center justify-start gap-4 pb-4 border-b border-slate-200">

            <div className="relative z-20">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full sm:w-auto min-w-[220px] items-center justify-between gap-4 px-5 py-3 rounded-xl text-sm font-bold bg-white text-slate-700 border-2 border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all shadow-sm cursor-pointer"
              >
                <span className="truncate">{activeCategory}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-full sm:w-64 max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-2 z-20 hide-scrollbar origin-top animate-[fadeInUp_0.2s_ease-out]">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`text-left px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${activeCategory === cat || (cat === 'Semua kategori' && activeCategory === 'Pilih Kategori')
                            ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                            : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daftar Berita */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
            {currentNews.length > 0 ? (
              currentNews.map((item, index) => (
                <Link
                  href={`/berita/${item.slug}`}
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-[#159447] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                    <ImageIcon size={40} opacity={0.5} />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#159447] mb-3 uppercase tracking-wider">
                      <span>{item.category}</span>
                    </div>
                    <h3 className="text-lg font-medium text-[#1d293d] mb-4 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                    <div className="mt-auto text-sm font-medium text-slate-500">
                      {item.date}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                Belum ada berita untuk kategori ini.
              </div>
            )}
          </div>

          {/* Navigasi Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">

              {/* Tombol Sebelumnya */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${currentPage === 1
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-sm cursor-pointer'
                  }`}
              >
                <ChevronLeft size={16} />

              </button>

              {/* Nomor Halaman */}
              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 font-semibold text-sm select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${currentPage === page
                          ? 'bg-[#159447] text-white shadow-md shadow-green-200 scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447]'
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Tombol Berikutnya */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${currentPage === totalPages
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-[#159447] text-white hover:bg-[#127a3a] shadow-sm shadow-green-200 cursor-pointer'
                  }`}
              >

                <ChevronRight size={16} />
              </button>

            </div>
          )}

        </div>
      </div>

    </main>
  )
}
