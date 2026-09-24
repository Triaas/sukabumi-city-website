import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Metadata } from 'next'
import { leadersList } from '@/data/leadersData'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return leadersList.map((leader) => ({
    slug: leader.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const leader = leadersList.find((l) => l.slug === slug)

  if (!leader) {
    return {
      title: 'Pemimpin Tidak Ditemukan | Pemerintah Kota Sukabumi',
    }
  }

  return {
    title: `Biografi ${leader.name} | Pemerintah Kota Sukabumi`,
    description: leader.bio,
  }
}

export default async function LeaderDetailPage({ params }: PageProps) {
  const { slug } = await params
  const leader = leadersList.find((l) => l.slug === slug)

  if (!leader) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Hero Section */}
      <section className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-[#159447]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#159447] to-[#0f7a36] z-0" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px] relative z-10">
          <Link
            href="/sejarah"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Sejarah</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <User size={14} />
            Profil Pemimpin Daerah
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            {leader.name}
          </h1>

          <div className="flex items-center gap-2 text-white/90 text-sm md:text-base font-medium">
            <Calendar size={18} />
            <span>Masa Jabatan: {leader.period}</span>
          </div>
        </div>
      </section>

      {/* Content Profile Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Kartu Profil / Foto */}
            <aside className="lg:col-span-4 bg-white rounded-2xl shadow-md border border-slate-100 p-6 text-center">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-inner bg-slate-100 mb-6 border border-slate-200">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#159447]/10 text-[#159447] text-xs font-bold uppercase tracking-wider mb-2">
                Periode Pemerintahan
              </span>
              <p className="text-lg font-bold text-[#172135] mb-4">
                {leader.period}
              </p>

              <hr className="my-4 border-slate-100" />

              <p className="text-xs text-[#566276] leading-relaxed italic">
                Data arsip pimpinan daerah Pemerintah Kota Sukabumi.
              </p>
            </aside>

            {/* Biografi Lengkap */}
            <article className="lg:col-span-8 bg-white rounded-2xl shadow-md border border-slate-100 p-8 md:p-12">
              <div className="border-b border-slate-100 pb-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#172135] mb-2">
                  Biografi Lengkap
                </h2>
                <div className="h-1 w-16 bg-[#159447] rounded-full" />
              </div>

              {/* Teks Bio Lengkap */}
              <div className="space-y-6 text-[#29364a] text-base md:text-lg leading-relaxed text-justify">
                {leader.fullBio.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tombol Balik Bawah */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/sejarah"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Galeri Pemimpin
                </Link>
              </div>
            </article>

          </div>
        </div>
      </section>
    </main>
  )
}
