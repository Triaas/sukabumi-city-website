import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Pemerintah Kota Sukabumi',
  description: 'Kebijakan Privasi dan Ketentuan Penggunaan Portal Resmi Pemerintah Kota Sukabumi.',
}

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-[#159447]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#159447] to-[#0f7a36] z-0" />
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Pernyataan terkait perlindungan data, privasi, dan ketentuan penggunaan layanan portal.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-[#29364a] leading-relaxed">
                
                <h2 className="text-2xl font-bold text-[#172135] mb-4">1. Pendahuluan</h2>
                <p className="mb-6">
                  Pemerintah Kota Sukabumi berkomitmen untuk melindungi privasi dan data pribadi pengunjung Portal Resmi Pemerintah Kota Sukabumi. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                </p>

                <h2 className="text-2xl font-bold text-[#172135] mb-4">2. Pengumpulan Informasi</h2>
                <p className="mb-6">
                  Kami dapat mengumpulkan informasi non-pribadi terkait penggunaan situs ini, seperti alamat IP, jenis peramban (browser), dan halaman yang Anda kunjungi, murni untuk keperluan analitik dan peningkatan layanan publik.
                </p>

                <h2 className="text-2xl font-bold text-[#172135] mb-4">3. Penggunaan Data</h2>
                <p className="mb-6">
                  Data yang terkumpul tidak akan disebarluaskan, dijual, atau diberikan kepada pihak ketiga untuk kepentingan komersial, melainkan hanya digunakan untuk evaluasi kinerja situs web pemerintahan.
                </p>

                {/* Tambahkan poin kebijakan lainnya di sini sesuai kebutuhan */}

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
