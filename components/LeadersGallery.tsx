'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Leader } from '@/data/leadersData'

export default function LeadersGallery({ title, leaders }: { title: string, leaders: Leader[] }) {
  const [selected, setSelected] = useState<Leader>(leaders[0])
  const [isExpanded, setIsExpanded] = useState(false)
  const displayedLeaders = isExpanded ? leaders : leaders.slice(0, 7)

  // Tambahkan ini untuk reference scrolling
  const galleryRef = useRef<HTMLDivElement>(null)

  const handleLeaderSelect = (leader: Leader) => {
    setSelected(leader)
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!leaders || leaders.length === 0) return null

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
        className="scroll-mt-24 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start transition-all duration-500 min-h-[320px]"
      >
        {/* Foto Tokoh Utama */}
        <div className="w-48 h-64 md:w-56 md:h-72 shrink-0 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
          <img
            src={selected.image}
            alt={selected.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + selected.name + '&background=159447&color=fff&size=256' }}
          />
        </div>

        {/* Detail Biografi */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block px-3 py-1 rounded-md bg-[#159447]/10 text-[#159447] text-sm font-bold uppercase tracking-widest mb-3">
            Periode: {selected.period}
          </span>
          <h4 className="text-3xl md:text-4xl font-extrabold text-[#172135] mb-3">
            {selected.name}
          </h4>
          <div className="inline-block px-3 py-1.5 bg-slate-200/70 text-[#29364a] text-sm font-semibold rounded-md border border-slate-300/50 mb-5">
            {selected.role}
          </div>
          <div className="w-12 h-1 bg-[#f3c338] mx-auto md:mx-0 mb-5" />
          <p className="text-[#566276] text-base md:text-lg leading-relaxed">
            {selected.bio}
          </p>
          <div className="mt-6">
            <Link
              href={`/sejarah/pemimpin/${selected.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#159447] text-white text-sm font-semibold hover:bg-[#0f7a36] shadow-sm hover:shadow transition-all"
            >
              Lihat Biografi Penuh →
            </Link>
          </div>
        </div>
      </div>

      {/* Thumbnail List & Toggle */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider text-center md:text-left">
            Pilih Pemimpin Lainnya:
          </p>

          {leaders.length > 7 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-[#159447] hover:text-[#0f7a36] bg-[#159447]/10 hover:bg-[#159447]/20 px-4 py-2 rounded-md transition-colors mx-auto md:mx-0"
            >
              {isExpanded ? 'Tampilkan Lebih Sedikit ↑' : `Lihat Semua (${leaders.length}) ↓`}
            </button>
          )}
        </div>

        <div className={`
          ${isExpanded
            ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-8 gap-x-4 justify-items-center pt-6 pb-2'
            : 'flex gap-4 overflow-x-auto pb-6 pt-6 snap-x hide-scrollbar justify-start md:justify-around w-full'}
        `}>
          {displayedLeaders.map((leader) => (
            <button
              key={leader.id}
              onClick={() => handleLeaderSelect(leader)}
              className={`shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2 transition-all duration-300 focus:outline-none ${!isExpanded && 'snap-center'} ${selected.id === leader.id
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
                  onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + leader.name + '&background=159447&color=fff&size=128' }}
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
