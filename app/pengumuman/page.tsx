'use client'


import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Megaphone, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { getAnnouncements, AnnouncementItem } from '@/lib/announcements'

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Ambil data pengumuman saat halaman pertama kali dibuka
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const data = await getAnnouncements()
      setAnnouncements(data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  // Ref untuk scroll ke section pengumuman saat ganti halaman
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentPage > 1) {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const totalPages = Math.ceil(announcements.length / itemsPerPage)

  const currentAnnouncements = announcements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
        style={{ backgroundImage: `url('/images/tugu-kota.webp')` }}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Pengumuman</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Pusat informasi dan pengumuman resmi terbaru dari Pemerintah Kota Sukabumi.
          </p>
        </div>
      </section>

      {/* Content List */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
            {isLoading ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm flex flex-col"
                  >
                    <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm animate-pulse">
                      {/* Skeleton Gambar (Tingginya h-36 menyesuaikan kode asli) */}
                      <div className="h-36 bg-slate-200 flex items-center justify-center overflow-hidden">
                         <ImageIcon size={40} className="text-slate-300 opacity-50" />
                      </div>
                      
                      {/* Skeleton Teks */}
                      <div className="p-4 flex flex-col flex-1 mt-1">
                        {/* Judul 2 baris */}
                        <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-slate-200 rounded mb-6 flex-1"></div>
                        
                        {/* Tanggal di paling bawah */}
                        <div className="h-3 w-24 bg-slate-200 rounded mt-auto"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : currentAnnouncements.length > 0 ? (
              currentAnnouncements.map((item) => (
                /* Outer Transparent Wrapper (Double-Bezel) */
                <Link
                  href={`/pengumuman/${item.slug}`}
                  key={item.id}
                  className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col cursor-pointer"
                >
                  {/* Inner Main Card */}
                  <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
                    <div className="h-36 bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src="/images/toa_pengumuman.jpg" 
                        alt="Ilustrasi Pengumuman" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-[#1d293d] mb-3 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3 flex-1">
                        {item.title}
                      </h3>
                      <div className="mt-auto text-xs font-medium text-slate-500">
                        {item.date}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                Belum ada pengumuman.
              </div>
            )}
          </div>

          {/* Navigasi Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${currentPage === 1
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-sm cursor-pointer'
                  }`}
              >
                <ChevronLeft size={16} />
              </button>

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

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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