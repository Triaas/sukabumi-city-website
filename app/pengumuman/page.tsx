'use client'


import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react'
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
              <div className="col-span-full flex items-center justify-center py-20 text-slate-400">
                Memuat data pengumuman...
              </div>
            ) : currentAnnouncements.length > 0 ? (
              currentAnnouncements.map((item) => (
                <Link
                  href={`/pengumuman/${item.slug}`}
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-[#159447] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                    <Megaphone size={40} opacity={0.5} />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
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