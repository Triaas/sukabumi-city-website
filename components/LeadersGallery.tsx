'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Leader } from '@/data/leadersData'

export default function LeadersGallery({ title, leaders }: { title: string, leaders: Leader[] }) {
  const [selected, setSelected] = useState<Leader>(leaders[0])
  const [activeTab, setActiveTab] = useState<'mayor' | 'deputy'>('mayor')
  const [isExpanded, setIsExpanded] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)

  const handleLeaderSelect = (leader: Leader) => {
    setSelected(leader)
    setActiveTab('mayor') // Reset ke Wali Kota setiap ganti tokoh
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!leaders || leaders.length === 0) return null

  // Tentukan data yang sedang aktif ditampilkan (Wali Kota atau Wakil)
  const currentProfile = activeTab === 'deputy' && selected.deputy
    ? {
        name: selected.deputy.name,
        role: selected.deputy.role,
        image: selected.deputy.image,
        bio: selected.deputy.bio,
        slug: selected.deputy.slug || selected.slug,
      }
    : {
        name: selected.name,
        role: selected.role,
        image: selected.image,
        bio: selected.bio,
        slug: selected.slug,
      }

  return (
    <div className="mt-12 md:mt-16 pt-8 border-t border-gray-100">
      <div className="text-center mb-8 md:mb-10">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#172135] uppercase tracking-wide">
          {title}
        </h3>
        <div className="h-1 w-20 bg-[#159447] rounded-full mx-auto mt-3 md:mt-4" />
      </div>

      {/* Master View (Detail Tokoh Terpilih) */}
      <div
        ref={galleryRef}
        id="master-view"
        className="scroll-mt-32 md:scroll-mt-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start transition-all duration-500 h-auto md:h-[340px]"
      >
        {/* Foto Tokoh */}
        <div className="w-32 h-40 sm:w-40 sm:h-52 md:w-48 md:h-full shrink-0 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
          <img
            key={currentProfile.image}
            src={currentProfile.image}
            alt={currentProfile.name}
            className="w-full h-full object-cover object-top transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentProfile.name) + '&background=159447&color=fff&size=256' }}
          />
        </div>

        {/* Detail Biografi */}
        <div className="flex-1 text-center md:text-left flex flex-col h-full w-full min-w-0">
          <div>
            {/* Header Bar: Periode & Pill Tabs */}
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 mb-2.5">
              <span className="inline-block px-3 py-1 rounded-md bg-[#159447]/10 text-[#159447] text-xs md:text-sm font-bold uppercase tracking-wider sm:tracking-widest">
                Periode: {selected.period}
              </span>

              {/* Pill Tabs: Hanya muncul jika pemimpin memiliki wakil */}
              {selected.deputy && (
                <div className="inline-flex bg-slate-200/80 p-0.5 rounded-full border border-slate-300/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mayor')}
                    className={`px-3 py-1.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                      activeTab === 'mayor'
                        ? 'bg-[#159447] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Wali Kota
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('deputy')}
                    className={`px-3 py-1.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                      activeTab === 'deputy'
                        ? 'bg-[#159447] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Wakil Wali Kota
                  </button>
                </div>
              )}
            </div>

            <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#172135] mb-2 line-clamp-2">
              {currentProfile.name}
            </h4>
            <div className="inline-block px-3 py-1 bg-slate-200/70 text-[#29364a] text-xs md:text-sm font-semibold rounded-md border border-slate-300/50 mb-3">
              {currentProfile.role}
            </div>
            <div className="w-10 h-1 bg-[#f3c338] mx-auto md:mx-0 mb-3" />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-[#566276] text-sm md:text-base leading-relaxed line-clamp-4 md:line-clamp-3">
              {currentProfile.bio}
            </p>
          </div>
          
          <div className="mt-4 md:mt-3 shrink-0">
            <Link
              href={`/sejarah/pemimpin/${currentProfile.slug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#159447] text-white text-sm font-semibold hover:bg-[#0f7a36] shadow-sm hover:shadow transition-all"
            >
              Lihat Biografi Penuh →
            </Link>
          </div>
        </div>
      </div>

      {/* Thumbnail List & Toggle */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 md:mb-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider text-center sm:text-left">
            Pilih Pemimpin Lainnya:
          </p>

          {leaders.length > 7 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto text-sm font-semibold text-[#159447] hover:text-[#0f7a36] bg-[#159447]/10 hover:bg-[#159447]/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {isExpanded ? 'Tampilkan Lebih Sedikit ↑' : `Lihat Semua (${leaders.length}) ↓`}
            </button>
          )}
        </div>

        <div className={`w-full transition-all duration-300 ${
          isExpanded
            ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-5 gap-x-2 sm:gap-x-4 sm:gap-y-8 justify-items-center h-auto overflow-visible pt-4 sm:pt-6 pb-2'
            : 'flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-3 pt-4 pb-3 px-1 md:grid md:grid-cols-5 lg:grid-cols-7 md:gap-y-8 md:gap-x-4 md:justify-items-center md:max-h-[160px] md:overflow-y-auto md:overflow-x-hidden md:snap-y md:pt-6 md:pb-2 md:pr-2 md:px-0'
        }`}>
          {leaders.map((leader) => (
            <button
              type="button"
              key={leader.id}
              onClick={() => handleLeaderSelect(leader)}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-300 focus:outline-none cursor-pointer ${
                isExpanded
                  ? 'w-full max-w-[96px] sm:max-w-[112px]'
                  : 'shrink-0 w-20 snap-start md:w-full md:max-w-[112px] md:scroll-mt-6'
              } ${selected.id === leader.id
                ? 'scale-105 sm:scale-110 -translate-y-1 sm:-translate-y-2'
                : 'opacity-65 hover:opacity-100 hover:-translate-y-1'
                }`}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-sm shrink-0 bg-white ${selected.id === leader.id ? 'border-[#159447] shadow-md' : 'border-white'
                }`}>
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top bg-slate-200"
                  onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(leader.name) + '&background=159447&color=fff&size=128' }}
                />
              </div>
              <div className="text-center w-full">
                <p className={`text-[11px] sm:text-xs font-bold truncate ${selected.id === leader.id ? 'text-[#159447]' : 'text-slate-700'}`}>
                  {leader.period}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
