import Link from 'next/link'
import { ArrowLeft, Megaphone } from 'lucide-react'

export const metadata = {
  title: 'Pengumuman | Pemerintah Kota Sukabumi',
  description: 'Pusat informasi, surat edaran, dan pengumuman resmi terbaru dari instansi Pemerintah Kota Sukabumi.',
}

// Dummy data (Nanti bisa diganti ambil dari API/Database)
const allAnnouncements = [
  { title: 'SURAT EDARAN PELAKSANAAN KEGIATAN HARI JADI KOTA SUKABUMI KE-110', date: '24 Okt 2023', category: 'Edaran Resmi' },
  { title: 'JADWAL SELEKSI KOMPETENSI DASAR (SKD) CALON APARATUR SIPIL NEGARA', date: '18 Okt 2023', category: 'Kepegawaian (BKPSDM)' },
  { title: 'PEMBERITAHUAN PEMELIHARAAN SISTEM LAYANAN KEPENDUDUKAN DIGITAL', date: '12 Okt 2023', category: 'Pelayanan Publik' },
  { title: 'HASIL SELEKSI ADMINISTRASI PENERIMAAN BEASISWA PEMUDA BERPRESTASI', date: '05 Okt 2023', category: 'Pendidikan' },
  { title: 'HIMBAUAN KEWASPADAAN MENGHADAPI MUSIM PENGHUJAN', date: '01 Okt 2023', category: 'BPBD' },
]

export default function PengumumanPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section
        className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/tugu-kota.webp')` }}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Pengumuman</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Pusat informasi, surat edaran, dan pengumuman resmi terbaru dari instansi Pemerintah Kota Sukabumi.
          </p>
        </div>
      </section>

      {/* Content List */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            {allAnnouncements.map((item, index) => (
              <article key={index} className="flex gap-5 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#eff4f8] text-[#f29b10]">
                  <Megaphone size={24} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-base md:text-lg font-bold leading-tight text-[#1d293d] mb-1.5">{item.title}</h3>
                  <p className="text-sm text-[#687991] font-medium">{item.date} <span className="text-[#159447] mx-1">•</span> {item.category}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
