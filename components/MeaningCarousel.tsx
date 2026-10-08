'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type MeaningItem = {
  title: string
  desc: string
  image?: string
}

export default function MeaningCarousel({ items }: { items: MeaningItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
  }

  if (!items || items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div className="mt-12 flex flex-col lg:flex-row gap-6 mx-auto max-w-5xl items-stretch">

      {/* Kolom Kiri: Slide Utama */}
      <div className="flex-1 bg-[#1b2b4e] rounded-3xl overflow-hidden relative shadow-xl min-h-[400px] md:min-h-[415px] flex flex-col justify-center">
        {/* Latar Belakang Dekoratif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[150%] h-[150%] border-[40px] border-white/20 rounded-[40%] animate-[spin_60s_linear_infinite]" />
        </div>

        {/* Konten Slide */}
        <div className="relative z-10 px-8 pt-4 pb-14 flex flex-col items-center justify-center gap-2 h-full">
          {/* Area Judul */}
          <div className="flex items-center justify-center w-full h-[72px] md:h-[96px]">
            <h3 className="text-xl sm:text-2xl md:text-3xl md:text-4xl font-bold text-white text-center tracking-wide drop-shadow-md leading-tight">
              {currentItem.title}
            </h3>
          </div>

          <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center my-1">
            <img
              key={currentIndex}
              src={currentItem.image || '/images/Lambang_Kota_Sukabumi.png'}
              alt={currentItem.title}
              className="w-full h-full object-contain drop-shadow-2xl animate-[fadeIn_0.5s_ease-out] transition-transform duration-300 hover:scale-115"
            />
          </div>

          <p className="text-white/90 text-center text-sm md:text-base leading-relaxed max-w-md font-medium">
            {currentItem.desc}
          </p>
        </div>

        {/* Tombol Navigasi Kiri */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 bottom-6 z-20 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'w-6 h-2 bg-[#f3c338]' : 'size-2 bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>

        {/* Tombol Navigasi Kanan */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 bottom-6 z-20 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Kolom Kanan: Navigasi Thumbnail - Mengikuti tinggi kolom kiri */}
      <div className="hidden lg:flex w-[200px] shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex-col overflow-hidden max-h-[500px] self-start h-fit">
        <div className="p-3 border-b border-slate-100 bg-white z-10 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Elemen</p>
        </div>
        {/* Kontainer ber-scroll agar pas dengan batas tinggi kotak di sebelahnya */}
        <div className="overflow-y-auto p-3 hide-scrollbar">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all duration-300 ${idx === currentIndex
                    ? 'border-[#1b2b4e] shadow-md ring-2 ring-[#1b2b4e]/20'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                title={item.title}
              >
                <div className="absolute inset-0 p-1.5 flex items-center justify-center">
                  <img
                    src={item.image || '/images/Lambang_Kota_Sukabumi.png'}
                    alt={item.title}
                    className={`w-full h-full object-contain transition-all duration-300 ${idx === currentIndex ? 'scale-110 drop-shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
