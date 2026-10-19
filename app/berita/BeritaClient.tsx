'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const categories = [
  'Semua kategori',
  'Agama',
  'Artikel',
  'Bencana',
  'Diskominfo',
  'Ekonomi',
  'Hukum',
  'Infrastruktur',
  'Kesehatan',
  'Layanan Publik',
  'Legislatif',
  'Lingkungan',
  'Olahraga',
  'Pariwisata',
  'Pendidikan',
  'Pertanian',
  'Politik',
  'Seni Budaya',
  'Sosial',
  'Teknologi',
  'Transportasi',
  'Umum',
  'Walikota'
]

// Terima data asli dari server
export default function BeritaClient({ initialNews }: { initialNews: any[] }) {
  const searchParams = useSearchParams()
  const contentRef = useRef<HTMLDivElement>(null)

  // Baca category dari URL param, validasi apakah ada di daftar kategori
  const getInitialCategory = () => {
    const param = searchParams.get('category')
    if (param) {
      const trimmed = param.trim()
      const found = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase())
      return found || trimmed
    }
    return 'Pilih Kategori'
  }

  const [activeCategory, setActiveCategory] = useState<string>(getInitialCategory)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Sync jika user navigasi back/forward dan URL param berubah
  useEffect(() => {
    const param = searchParams.get('category')
    if (param) {
      const trimmed = param.trim()
      const found = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase())
      setActiveCategory(found || trimmed)
      setCurrentPage(1)
    } else {
      setActiveCategory('Pilih Kategori')
    }
  }, [searchParams])

  useEffect(() => {
    if (currentPage > 1) {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat)
    setIsDropdownOpen(false)
    setCurrentPage(1)
  }

  const filteredNews = (activeCategory === 'Pilih Kategori' || activeCategory === 'Semua kategori')
    ? initialNews
    : initialNews.filter(news => news.category && news.category.toLowerCase().includes(activeCategory.toLowerCase()))

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const currentNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      <section className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/news.webp')` }}>
        <div className="absolute inset-0 z-0 bg-slate-900/65" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200">
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Berita</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">Kumpulan berita terkini dan liputan kegiatan seputar Kota Sukabumi.</p>
        </div>
      </section>

      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          {/* Dropdown Filter */}
          <div ref={contentRef} className="mb-10 flex flex-col sm:flex-row sm:items-center justify-start gap-4 pb-4 border-b border-slate-200">
            <div className="relative z-20">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex w-full sm:w-auto min-w-[220px] items-center justify-between gap-4 px-5 py-3 rounded-xl text-sm font-bold bg-white text-slate-700 border-2 border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all shadow-sm">
                <span className="truncate">{activeCategory}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-full sm:w-64 max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-2 z-20 hide-scrollbar">
                    {categories.map((cat: any) => (
                      <button key={cat} onClick={() => handleCategorySelect(cat)} className={`text-left px-5 py-3 text-sm font-bold transition-colors ${activeCategory.toLowerCase() === cat.toLowerCase() || (cat === 'Semua kategori' && activeCategory === 'Pilih Kategori') ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>


          </div>

          {/* Grid Berita */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
            {currentNews.length > 0 ? (
              currentNews.map((item, index) => (
                /* Outer Transparent Wrapper (Double-Bezel) */
                <Link
                  href={`/berita/${item.slug}`}
                  key={index}
                  className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col"
                >
                  {/* Inner Main Card */}
                  <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
                    <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/images/news.webp';
                            e.currentTarget.onerror = null; // Mencegah infinite loop jika fallback juga gagal
                          }}
                        />
                      ) : (
                        <ImageIcon size={40} className="text-slate-300" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#159447] mb-2 uppercase tracking-wider">
                        <span>{item.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1d293d] mb-3 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3 flex-1">
                        {item.title}
                      </h3>
                      <div className="mt-auto text-xs font-medium text-slate-500">{item.date}</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 font-medium">Belum ada berita untuk kategori ini.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
             <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
               {/* Tombol Sebelumnya */}
               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${currentPage === 1 ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-sm'}`}>
                 <ChevronLeft size={16} />
               </button>
               
               {/* Angka Pagination */}
               <div className="flex items-center gap-1.5">
                 {getPageNumbers().map((page, idx) => page === '...' ? (
                   <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-semibold text-sm">...</span>
                 ) : (
                   <button key={page} onClick={() => setCurrentPage(page as number)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${currentPage === page ? 'bg-[#159447] text-white shadow-md shadow-green-200 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447]'}`}>
                     {page}
                   </button>
                 ))}
               </div>

               {/* Tombol Selanjutnya */}
               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${currentPage === totalPages ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-[#159447] text-white hover:bg-[#127a3a] shadow-sm shadow-green-200'}`}>
                 <ChevronRight size={16} />
               </button>
             </div>
          )}
        </div>
      </div>
    </main>
  )
}