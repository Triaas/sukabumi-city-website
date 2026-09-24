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
      <div className="flex-1 bg-[#1b2b4e] rounded-3xl overflow-hidden relative shadow-xl min-h-[500px]">
        {/* Latar Belakang Dekoratif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[150%] h-[150%] border-[40px] border-white/20 rounded-[40%] animate-[spin_60s_linear_infinite]" />
        </div>

        {/* Konten Slide */}
        <div className="relative z-10 px-8 py-10 pb-20 flex flex-col items-center justify-between h-full">
          {/* Area Judul dengan tinggi minimum tetap agar posisi elemen bawah konsisten */}
          <div className="min-h-[84px] md:min-h-[96px] flex items-center justify-center w-full mb-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center tracking-wide drop-shadow-md leading-tight">
              {currentItem.title}
            </h3>
          </div>

          <div className="w-48 h-48 md:w-56 md:h-56 my-auto flex items-center justify-center">
            <img
              key={currentIndex}
              src={currentItem.image || '/images/Lambang_Kota_Sukabumi.png'}
              alt={currentItem.title}
              className="w-full h-full object-contain drop-shadow-2xl animate-[fadeIn_0.5s_ease-out]"
            />
          </div>

          <p className="text-white/90 text-center text-base md:text-lg leading-relaxed mt-8 max-w-md font-medium min-h-[80px]">
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
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-6 h-2 bg-[#f3c338]' : 'size-2 bg-white/40 hover:bg-white/60'
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
                className={`relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                  idx === currentIndex
                    ? 'border-[#1b2b4e] shadow-md ring-2 ring-[#1b2b4e]/20'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                }`}
                title={item.title}
              >
                <div className="absolute inset-0 p-1.5 flex items-center justify-center">
                  <img
                    src={item.image || '/images/Lambang_Kota_Sukabumi.png'}
                    alt={item.title}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      idx === currentIndex ? 'scale-110 drop-shadow-md' : 'opacity-70 hover:opacity-100'
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
