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
    <div className="mt-16 pt-8 border-t border-gray-100">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-bold text-[#172135] uppercase tracking-wide">
          {title}
        </h3>
        <div className="h-1 w-20 bg-[#159447] rounded-full mx-auto mt-4" />
      </div>

      {/* Master View (Detail Tokoh Terpilih) */}
      <div
        ref={galleryRef}
        id="master-view"
        className="scroll-mt-24 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start transition-all duration-500 h-[580px] md:h-[340px]"
      >
        {/* Foto Tokoh */}
        <div className="w-40 h-52 md:w-48 md:h-full shrink-0 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
          <img
            key={currentProfile.image}
            src={currentProfile.image}
            alt={currentProfile.name}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentProfile.name) + '&background=159447&color=fff&size=256' }}
          />
        </div>

        {/* Detail Biografi */}
        <div className="flex-1 text-center md:text-left flex flex-col h-full w-full">
          <div>
            {/* Header Bar: Periode & Pill Tabs */}
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-md bg-[#159447]/10 text-[#159447] text-xs md:text-sm font-bold uppercase tracking-widest">
                Periode: {selected.period}
              </span>

              {/* Pill Tabs: Hanya muncul jika pemimpin memiliki wakil */}
              {selected.deputy && (
                <div className="inline-flex bg-slate-200/80 p-0.5 rounded-full border border-slate-300/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mayor')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
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
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
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

            <h4 className="text-2xl md:text-3xl font-extrabold text-[#172135] mb-2 line-clamp-2">
              {currentProfile.name}
            </h4>
            <div className="inline-block px-3 py-1 bg-slate-200/70 text-[#29364a] text-xs md:text-sm font-semibold rounded-md border border-slate-300/50 mb-3">
              {currentProfile.role}
            </div>
            <div className="w-10 h-1 bg-[#f3c338] mx-auto md:mx-0 mb-3" />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-[#566276] text-sm md:text-base leading-relaxed line-clamp-3">
              {currentProfile.bio}
            </p>
          </div>
          
          <div className="mt-3 shrink-0">
            <Link
              href={`/sejarah/pemimpin/${currentProfile.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#159447] text-white text-sm font-semibold hover:bg-[#0f7a36] shadow-sm hover:shadow transition-all"
            >
              Lihat Biografi Penuh →
            </Link>
          </div>
        </div>
      </div>

      {/* Thumbnail List & Toggle */}
      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider text-center md:text-left">
            Pilih Pemimpin Lainnya:
          </p>

          {leaders.length > 7 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-[#159447] hover:text-[#0f7a36] bg-[#159447]/10 hover:bg-[#159447]/20 px-4 py-2 rounded-md transition-colors mx-auto md:mx-0 cursor-pointer"
            >
              {isExpanded ? 'Tampilkan Lebih Sedikit ↑' : `Lihat Semua (${leaders.length}) ↓`}
            </button>
          )}
        </div>

        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-8 gap-x-4 justify-items-center w-full transition-all duration-300 ${
          isExpanded
            ? 'h-auto overflow-visible pt-6 pb-2'
            : 'max-h-[160px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory pt-6 pb-2 pr-2'
        }`}>
          {leaders.map((leader) => (
            <button
              type="button"
              key={leader.id}
              onClick={() => handleLeaderSelect(leader)}
              className={`shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2 transition-all duration-300 focus:outline-none cursor-pointer ${!isExpanded ? 'snap-start scroll-mt-6' : ''} ${selected.id === leader.id
                ? 'scale-110 -translate-y-2'
                : 'opacity-60 hover:opacity-100 hover:-translate-y-1'
                }`}
            >
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow-sm flex-shrink-0 bg-white ${selected.id === leader.id ? 'border-[#159447] shadow-md' : 'border-white'
                }`}>
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover bg-slate-200"
                  onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(leader.name) + '&background=159447&color=fff&size=128' }}
                />
              </div>
              <div className="text-center w-full">
                <p className={`text-xs font-bold truncate ${selected.id === leader.id ? 'text-[#159447]' : 'text-slate-700'}`}>
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
