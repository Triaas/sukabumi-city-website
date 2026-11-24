import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import LeadersGallery from '@/components/LeadersGallery'
import MeaningCarousel from '@/components/MeaningCarousel'
import NomenklaturTimeline from '@/components/NomenklaturTimeline'
import ScrollSpyNav from '@/components/ScrollSpyNav'
import { getProfilePageBySlug } from '@/lib/profile-pages/queries'

export const dynamic = 'force-dynamic'

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getProfilePageBySlug(slug)

  if (!page) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-[#159447] mb-4">404</h1>
              <h2 className="text-3xl md:text-4xl font-bold text-[#172135] mb-4">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-lg text-[#566276] mb-8">
                Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#159447] text-white font-semibold rounded-lg hover:bg-[#0f7a36] transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={20} />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const {
    contentImageClassName,
    quickLinks,
    timelineData,
    leadersData,
    meaningItems,
    featuredPublication,
  } = page.extraData || {}

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section
        className={`relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-no-repeat ${
          page.heroImageFit === 'contain'
            ? 'bg-contain bg-center'
            : 'bg-cover bg-center'
        }`}
        style={{ backgroundImage: `url('${page.heroImage}')` }}
      >
        <div
          className={`absolute inset-0 z-0 ${
            page.heroImageFit === 'contain'
              ? 'bg-slate-900/70 backdrop-blur-sm'
              : 'bg-slate-900/65'
          }`}
        />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {page.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            {page.description}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative">
          {quickLinks && quickLinks.length > 0 && (
            <ScrollSpyNav links={quickLinks} />
          )}

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative z-20">
              {/* Gambar Utama di atas */}
              {page.contentImage && (
                <figure className="text-center mb-10">
                  {page.contentImageTitle && (
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#172135] mb-4">
                      {page.contentImageTitle}
                    </h2>
                  )}
                  <img
                    src={page.contentImage}
                    alt={page.title}
                    className={`w-full mx-auto h-auto block object-contain ${
                      contentImageClassName || 'max-w-md md:max-w-md'
                    }`}
                  />
                  {page.contentImageCaption && (
                    <figcaption className="text-xs md:text-sm text-[#566276] italic mt-2 text-center">
                      {page.contentImageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Konten HTML Utama */}
              <div
                id="sejarah-content"
                className="profile-content prose prose-lg max-w-none scroll-mt-36 text-[#29364a] leading-relaxed text-base md:text-lg text-justify"
                dangerouslySetInnerHTML={{ __html: page.contentHtml }}
              />

              {/* Publikasi Unggulan (contoh: Sukabumi Dalam Angka / BPS) */}
              {featuredPublication?.src && (
                <figure
                  className={
                    featuredPublication.title
                      ? 'my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
                      : 'my-6 text-center'
                  }
                >
                  {featuredPublication.title && (
                    <div className="mb-4 text-center">
                      <h3 className="text-base font-bold text-[#172135] md:text-lg">
                        {featuredPublication.title}
                      </h3>
                      {featuredPublication.subtitle && (
                        <p className="text-xs text-[#566276] mt-1">
                          {featuredPublication.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {featuredPublication.link ? (
                    <a
                      href={featuredPublication.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-fit mx-auto"
                    >
                      <img
                        src={featuredPublication.src}
                        alt={
                          featuredPublication.title ||
                          featuredPublication.caption ||
                          page.title
                        }
                        className={
                          featuredPublication.imageClassName ||
                          'max-w-[300px] w-full h-auto mx-auto rounded-xl shadow-sm hover:scale-103 transition-transform duration-300 cursor-pointer block'
                        }
                      />
                    </a>
                  ) : (
                    <img
                      src={featuredPublication.src}
                      alt={
                        featuredPublication.title ||
                        featuredPublication.caption ||
                        page.title
                      }
                      className={
                        featuredPublication.imageClassName ||
                        'max-w-[300px] w-full h-auto mx-auto rounded-xl shadow-sm block'
                      }
                    />
                  )}

                  {featuredPublication.caption && (
                    <figcaption
                      className={`text-xs md:text-sm text-[#566276] italic ${
                        featuredPublication.title
                          ? 'mt-4 text-center'
                          : 'mt-2 text-center'
                      }`}
                    >
                      {featuredPublication.caption}
                    </figcaption>
                  )}

                  {featuredPublication.link && (
                    <div className="mt-4 flex justify-center">
                      <a
                        href={featuredPublication.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-[#159447] px-4 py-2 text-xs sm:text-sm font-medium text-[#159447] hover:bg-[#159447] hover:text-white transition-colors duration-200"
                      >
                        <span>Info Selengkapnya di BPS</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </figure>
              )}

              {/* Carousel Arti Lambang */}
              {meaningItems && meaningItems.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-100">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#172135]">
                      Arti & Makna Elemen Lambang
                    </h3>
                    <div className="h-1 w-20 bg-[#159447] rounded-full mx-auto mt-4" />
                  </div>

                  <MeaningCarousel items={meaningItems} />
                </div>
              )}

              {/* Vertical Timeline */}
              {timelineData && timelineData.items.length > 0 && (
                <NomenklaturTimeline
                  title={timelineData.title}
                  items={timelineData.items}
                  hasQuickLinks={Boolean(quickLinks && quickLinks.length > 0)}
                />
              )}

              {/* Leaders Hall of Fame Gallery */}
              {leadersData && leadersData.items.length > 0 && (
                <div id="hall-of-fame" className="scroll-mt-36">
                  <LeadersGallery
                    title={leadersData.title}
                    leaders={leadersData.items}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getProfilePageBySlug(slug)

  if (!page) {
    return {
      title: '404 - Halaman Tidak Ditemukan | Pemerintah Kota Sukabumi',
      description: 'Halaman yang Anda cari tidak ditemukan.',
    }
  }

  return {
    title: `${page.title} | Pemerintah Kota Sukabumi`,
    description: page.description,
  }
}
