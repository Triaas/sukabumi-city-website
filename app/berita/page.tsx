import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export const metadata = {
  title: 'Berita Kota | Pemerintah Kota Sukabumi',
  description: 'Kumpulan berita terkini, liputan kegiatan, dan rilis pers seputar pembangunan di Kota Sukabumi.',
}

const allNews = [
  { title: 'PELANTIKAN PENGURUS MUI KOTA SUKABUMI PERIODE 2023-2028 RESMI DISELENGGARAKAN', date: '25 Okt 2023', category: 'Bagian Kesra Kota Sukabumi' },
  { title: 'WALIKOTA SUKABUMI APRESIASI GELAR BUDAYA DAN KULINER TRADISIONAL DI ALUN-ALUN', date: '22 Okt 2023', category: 'Disporapar Kota Sukabumi' },
  { title: 'DINAS PEKERJAAN UMUM TINJAU PENYELESAIAN PROYEK DRAINASE DAN JALAN KOTA', date: '19 Okt 2023', category: 'DPUTR Kota Sukabumi' },
  { title: 'KOTA SUKABUMI KEMBALI RAIH PENGHARGAAN KOTA LAYAK ANAK TINGKAT NASIONAL', date: '10 Okt 2023', category: 'Pemkot Sukabumi' },
  { title: 'PEMBUKAAN FESTIVAL SENTRA UMKM LOKAL DI LAPANG MERDEKA BERLANGSUNG MERIAH', date: '02 Okt 2023', category: 'Diskumindag' },
]

export default function BeritaPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section
        className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/news.webp')` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-900/65" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Berita Kota</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Kumpulan berita terkini, liputan kegiatan, dan rilis pers seputar pembangunan di Kota Sukabumi.
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNews.map((item, index) => (
              <article key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-[#159447] transition-all cursor-pointer group flex flex-col">
                {/* Image Placeholder */}
                <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                  <ImageIcon size={40} opacity={0.5} />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#159447] mb-3 uppercase tracking-wider">
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1d293d] mb-4 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                  <div className="mt-auto text-sm font-medium text-slate-500">
                    {item.date}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
