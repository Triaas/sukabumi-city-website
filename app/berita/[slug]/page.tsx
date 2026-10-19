import Link from 'next/link'
import { ArrowLeft, Calendar, User, Image as ImageIcon } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'
import { getNewsBySlug, getRelatedNews } from '@/lib/db'
import FallbackImage from '@/components/FallbackImage'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Ambil data langsung dari database
  const article = await getNewsBySlug(slug)

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Berita Tidak Ditemukan</h1>
        <Link href="/berita" className="text-[#159447] font-bold hover:underline inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Kembali ke Daftar Berita
        </Link>
      </div>
    )
  }

  // Ekstrak nama reporter dari konten HTML dan bersihkan dari artikel
  let reporterName = 'Diskominfo Kota Sukabumi';
  let cleanContent = article.content;

  const reporterRegex = /(?:Reporter|Penulis)\s*:\s*([A-Za-z\s'.,]+)/i;
  const match = cleanContent.match(reporterRegex);

  if (match && match[1]) {
    reporterName = match[1].trim();
    // Coba hapus seluruh tag <p> yang hanya berisi teks reporter/penulis
    const pRegex = new RegExp(
      `<p>(?:<strong>|<b>|<em>|<i>|\\s)*(?:Reporter|Penulis)\\s*:\\s*${reporterName.replace(/\s+/g, '\\s*')}(?:<\\/strong>|<\\/b>|<\\/em>|<\\/i>|\\s)*<\\/p>`,
      'i'
    );
    if (pRegex.test(cleanContent)) {
      cleanContent = cleanContent.replace(pRegex, '');
    } else {
      cleanContent = cleanContent.replace(reporterRegex, '');
    }
  }

  const mainCategory = article.categories && article.categories.length > 0 ? article.categories[0] : 'Umum';
  const relatedNews = await getRelatedNews(mainCategory, slug);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Spacer Navbar */}
      <div className="h-24 bg-[#1b293c]"></div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">
          <div className="mb-8">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-[#159447] font-bold hover:text-[#0f7a36] transition-colors"
            >
              <ArrowLeft size={18} /> Kembali ke Berita
            </Link>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

              {/* Title & Meta */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#1d293d] leading-tight mb-6">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={16} /> {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User size={16} /> Diskominfo Kota Sukabumi
                  </span>
                </div>

                <ShareButtons title={article.title} />
              </div>

              {/* Featured Image */}
              <figure className="mb-10 w-full">
                <div className="relative w-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm mb-3 border border-slate-200">
                  {article.image ? (
                    <FallbackImage
                      src={article.image}
                      alt={article.title}
                      className="w-full h-auto max-h-[650px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 h-[300px] md:h-[450px] w-full">
                      <ImageIcon size={48} opacity={0.5} />
                      <span className="mt-2 text-sm">Tidak ada gambar sampul</span>
                    </div>
                  )}
                </div>
              </figure>

              {/* Content Typography dengan dangerouslySetInnerHTML */}
              <article
                className="prose prose-lg prose-slate max-w-none text-[#29364a] leading-relaxed [&>p]:mb-6 [&_img]:rounded-xl [&_img]:my-8 [&>iframe]:w-full [&>iframe]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: cleanContent }}
              />

              {/* Category Tags */}
              {article.categories && article.categories.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    {article.categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/berita?category=${encodeURIComponent(cat)}`}
                        className="
                          inline-flex items-center px-4 py-1.5
                          rounded-full border border-slate-200 bg-slate-50
                          text-sm font-semibold text-slate-600
                          hover:border-[#159447] hover:bg-[#f0fdf4] hover:text-[#159447]
                          transition-all duration-200 cursor-pointer
                        "
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter Card */}
              <div className="mt-8 bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100 flex flex-col w-full sm:w-fit">
                <h3 className="text-sm font-bold text-[#1d293d] mb-3">Reporter</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    <User size={24} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#159447] text-base">
                      {reporterName}
                    </span>
                    <span className="text-xs text-slate-500">Reporter</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Berita Terkait */}
          {relatedNews && relatedNews.length > 0 && (
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1d293d]">Berita Terkait</h2>
                <Link
                  href={
                    article.categories && article.categories.length > 0
                      ? `/berita?category=${encodeURIComponent(article.categories[0])}`
                      : '/berita'
                  }
                  className="text-sm font-bold text-[#159447] hover:text-[#0f7a36] transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedNews.map((news: any, index: number) => (
                  /* Outer Transparent Wrapper (Double-Bezel) */
                  <Link
                    href={`/berita/${news.slug}`}
                    key={index}
                    className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col"
                  >
                    {/* Inner Main Card */}
                    <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
                      <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                        {news.image ? (
                          <FallbackImage src={news.image} alt={news.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <ImageIcon size={40} className="text-slate-300" />
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#159447] mb-3 uppercase tracking-wider">
                          <span>{news.category.split(',')[0]}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#1d293d] mb-4 leading-snug group-hover:text-[#159447] transition-colors line-clamp-3">
                          {news.title}
                        </h3>
                        <div className="mt-auto text-xs font-medium text-slate-500">{news.date}</div>
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