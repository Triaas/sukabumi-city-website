import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'
import { getAnnouncementBySlug, getAnnouncements } from '@/lib/announcements'

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [announcement, allAnnouncements] = await Promise.all([
    getAnnouncementBySlug(slug),
    getAnnouncements(),
  ])

  const otherAnnouncements = allAnnouncements
    .filter((item) => item.slug !== slug)
    .slice(0, 4)

  if (!announcement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Pengumuman Tidak Ditemukan</h1>
        <Link href="/pengumuman" className="text-[#159447] font-bold hover:underline inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Kembali ke Daftar Pengumuman
        </Link>
      </div>
    )
  }

  // 1. Ekstrak URL PDF dari shortcode [embeddoc]
  const shortcodeRegex = /\[embeddoc\s+url="([^"]+)"[^\]]*\]/i
  const match = announcement.content.match(shortcodeRegex)
  let pdfUrl = match ? match[1] : null

  // 2. Ubah URL absolut web lama menjadi relative path (lokal Next.js)
  if (pdfUrl) {
    pdfUrl = pdfUrl.replace('https://portal.sukabumikota.go.id', '')
    // Jika format URL di database pakai http:// juga, bersihkan sekalian:
    pdfUrl = pdfUrl.replace('http://portal.sukabumikota.go.id', '')
  }

  // 3. Bersihkan teks shortcode dari konten agar tidak muncul di layar
  const cleanContent = announcement.content.replace(shortcodeRegex, '')

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Spacer Navbar */}
      <div className="h-24 bg-[#1b293c]"></div>

      {/* Article Body */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">
          <div className="mb-8">
            <Link href="/pengumuman" className="inline-flex items-center gap-2 text-[#159447] font-bold hover:text-[#0f7a36] transition-colors">
              <ArrowLeft size={18} /> Kembali ke Pengumuman
            </Link>
          </div>
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

              {/* Title & Meta */}
              <div className="mb-10">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#1d293d] leading-tight mb-6">
                  {announcement.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={16} /> {announcement.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User size={16} /> Diskominfo Kota Sukabumi
                  </span>
                </div>

                {/* Share Action Bar */}
                <ShareButtons title={announcement.title} />
              </div>

              {/* Text Content Bersih */}
              <article
                className="prose prose-lg prose-slate max-w-none text-[#334155] leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: cleanContent }}
              />

              <br />

              {/* File Preview Box */}
              {pdfUrl && (
                <div className="mb-10 w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 flex flex-col">
                  <iframe
                    src={pdfUrl}
                    className="w-full flex-1 border-0"
                    title="Lampiran Pengumuman"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Pengumuman Lainnya */}
          {otherAnnouncements && otherAnnouncements.length > 0 && (
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1d293d]">Pengumuman Lainnya</h2>
                <Link
                  href="/pengumuman"
                  className="text-sm font-bold text-[#159447] hover:text-[#0f7a36] transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherAnnouncements.map((item) => (
                  <Link
                    href={`/pengumuman/${item.slug}`}
                    key={item.id}
                    className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col cursor-pointer"
                  >
                    <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
                      <div className="h-36 bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img
                          src="/images/toa_pengumuman.jpg"
                          alt="Ilustrasi Pengumuman"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs font-bold text-[#159447] mb-2 uppercase tracking-wider">
                          Pengumuman
                        </div>
                        <h3 className="text-sm font-semibold text-[#1d293d] mb-3 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3 flex-1">
                          {item.title}
                        </h3>
                        <div className="mt-auto text-xs font-medium text-slate-500">
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}