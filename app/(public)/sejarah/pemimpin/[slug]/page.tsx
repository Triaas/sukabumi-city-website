import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Metadata } from 'next'
import { leadersList } from '@/data/leadersData'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Profile {
  name: string
  role: string
  period: string
  image: string
  bio: string
  fullBio: string[]
}

// Cari profil berdasarkan slug: Wali Kota dulu, lalu Wakil Wali Kota
function findProfile(slug: string): Profile | null {
  const mayor = leadersList.find((l) => l.slug === slug)
  if (mayor) {
    return {
      name: mayor.name,
      role: mayor.role,
      period: mayor.period,
      image: mayor.image,
      bio: mayor.bio,
      fullBio: mayor.fullBio ?? [mayor.bio],
    }
  }
  const host = leadersList.find((l) => l.deputy?.slug === slug)
  if (host?.deputy) {
    const d = host.deputy
    return {
      name: d.name,
      role: d.role,
      period: host.period,
      image: d.image,
      bio: d.bio,
      fullBio: d.fullBio ?? [d.bio],
    }
  }
  return null
}

export async function generateStaticParams() {
  const slugs = new Set<string>()
  leadersList.forEach((l) => {
    slugs.add(l.slug)
    if (l.deputy?.slug) slugs.add(l.deputy.slug)
  })
  return Array.from(slugs).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const leader = findProfile(slug)

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
  const leader = findProfile(slug)

  if (!leader) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Spacer Navbar */}
      <div className="h-24 bg-[#1b293c]"></div>

      {/* Content Profile Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">
          <div className="mb-8">
            <Link
              href="/sejarah#hall-of-fame"
              className="inline-flex items-center gap-2 text-[#159447] font-bold hover:text-[#0f7a36] mb-6 transition-colors"
            >
              <ArrowLeft size={18} /> Kembali
            </Link>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Kartu Profil / Foto */}
            <aside className="lg:col-span-4 bg-white rounded-2xl shadow-md border border-slate-100 p-6 text-center flex flex-col h-full">
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


            </aside>

            {/* Biografi Lengkap */}
            <article className="lg:col-span-8 bg-white rounded-2xl shadow-md border border-slate-100 p-8 md:p-12 flex flex-col h-full">
              <div className="border-b border-slate-100 pb-6 mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#172135]">
                  {leader.name}
                </h1>
              </div>

              {/* Teks Bio Lengkap */}
              <div className="space-y-6 text-[#29364a] text-base md:text-lg leading-relaxed text-justify">
                {leader.fullBio.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

          </div>
        </div>
      </section>
    </main>
  )
}
