import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import { getLeaderBySlug } from '@/lib/profile-pages/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const leader = await getLeaderBySlug(slug)

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
  const leader = await getLeaderBySlug(slug)

  if (!leader) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16 md:pb-24">
      {/* Spacer Navbar */}
      <div className="h-[68px] md:h-24 bg-[#1b293c]"></div>

      {/* Content Profile Section */}
      <section className="py-6 sm:py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">
          <div className="mb-4 md:mb-8">
            <Link
              href="/sejarah#hall-of-fame"
              className="inline-flex items-center gap-2 py-1 text-sm md:text-base text-[#159447] font-bold hover:text-[#0f7a36] transition-colors"
            >
              <ArrowLeft size={18} /> Kembali
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-stretch">
            {/* Kartu Profil / Foto */}
            <aside className="lg:col-span-4 bg-white rounded-2xl shadow-md border border-slate-100 p-5 sm:p-6 text-center flex flex-col items-center h-full">
              <div className="w-40 sm:w-52 lg:w-full aspect-[3/4] mx-auto rounded-xl overflow-hidden shadow-sm lg:shadow-inner bg-slate-100 mb-4 lg:mb-6 border border-slate-200">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#159447]/10 text-[#159447] text-xs font-bold uppercase tracking-wider mb-1.5">
                Periode Pemerintahan
              </span>
              <p className="text-base sm:text-lg font-bold text-[#172135] mb-1 lg:mb-4">
                {leader.period}
              </p>
            </aside>

            {/* Biografi Lengkap */}
            <article className="lg:col-span-8 bg-white rounded-2xl shadow-md border border-slate-100 p-5 sm:p-8 md:p-12 flex flex-col h-full">
              <div className="border-b border-slate-100 pb-4 mb-5 md:pb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#172135] leading-tight text-center lg:text-left">
                  {leader.name}
                </h1>
              </div>

              {/* Teks Bio Lengkap */}
              <div className="space-y-4 md:space-y-6 text-[#29364a] text-[15px] sm:text-base md:text-lg leading-relaxed text-left sm:text-justify">
                {leader.fullBio.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
