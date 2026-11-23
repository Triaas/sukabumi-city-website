'use client'

import Link from 'next/link'
import {
  FileText,
  ShoppingCart,
  Shield,
  Building,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getAnnouncements, AnnouncementItem } from '@/lib/announcements'
import { fetchNews } from '@/lib/news'
import type {
  SiteSettingsMap,
  HeroSettings,
  WelcomeSettings,
  ProfileSettings,
  MediaSettings,
  OpdSettings,
  OpdSubItem,
  OpdServiceCard,
  PartnersSettings,
} from '@/lib/site-settings/types'

interface EventBanner {
  id: number
  title: string
  image: string
  href: string
}

function SectionHeading({
  children,
  subtitle,
}: {
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[#172135] md:text-4xl">
        <span className="h-10 w-1.5 rounded-full bg-[#159447]" />
        {children}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-5xl text-lg leading-relaxed text-[#566276]">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function Hero({ settings }: { settings: HeroSettings }) {
  const images =
    settings.images && settings.images.length > 0
      ? settings.images
      : [
          '/images/lapang-merdeka.webp',
          '/images/tugu-kota.webp',
          '/images/gedung_juang.webp',
        ]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const intervalMs =
    settings.slideIntervalMs && settings.slideIntervalMs >= 1000
      ? settings.slideIntervalMs
      : 3000

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  return (
    <section
      id="beranda"
      className="relative flex min-h-[82dvh] sm:min-h-[88dvh] lg:h-screen lg:min-h-[650px] items-center overflow-hidden bg-[#0c1d26] pt-24 pb-12 lg:py-0 lg:pt-20"
    >
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt={settings.title || 'Kota Sukabumi'}
          fetchPriority={index === 0 ? 'high' : undefined}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/30 z-10" />
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="max-w-xl">
          <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-[#f3c338]">
            {settings.eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">
            {settings.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/85 sm:mt-5 sm:text-lg md:text-xl">
            {settings.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}

function Welcome({ settings }: { settings: WelcomeSettings }) {
  return (
    <section className="bg-white px-4 py-10 md:px-8 lg:px-12 md:py-16">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-10 lg:flex-row lg:gap-8">
        <div className="w-full max-w-[440px] aspect-[4/3] rounded-3xl bg-[#eff4f8] shadow-sm overflow-hidden flex items-center justify-center">
          {settings.leftContainerImage ? (
            <img
              src={settings.leftContainerImage}
              alt={settings.leftContainerAlt || 'Sambutan Kota Sukabumi'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-slate-400">Foto</span>
          )}
        </div>

        <div className="flex flex-1 min-w-0 w-full items-center justify-center gap-4 lg:gap-6">
          <div className="relative z-10 flex-1 min-w-0 max-w-[500px] lg:max-w-[560px] self-end">
            <img
              src={settings.leaderImage || '/images/walikota dan wakil.png'}
              className="w-full h-auto"
              alt={settings.leaderAlt || 'Walikota dan Wakil Walikota Sukabumi'}
            />
          </div>
          <div className="hidden max-w-[200px] lg:max-w-[240px] xl:max-w-[300px] flex-1 min-w-0 md:block self-center">
            <img
              src={settings.sloganImage || '/images/Iman.png'}
              alt={
                settings.sloganAlt ||
                'IMAN - Inovatif, Mandiri, Agamis, Nasionalis'
              }
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Profile({ settings }: { settings: ProfileSettings }) {
  const profileCards = settings.cards || []
  return (
    <section
      id="profil"
      className="bg-slate-50 px-4 py-10 md:px-8 lg:px-12 md:py-16"
    >
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading subtitle={settings.subtitle}>
          {settings.heading}
        </SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {profileCards.slice(0, 4).map((card) => (
            <Link
              key={card.title}
              href={card.href || '#'}
              className="group relative h-[160px] md:h-[180px] overflow-hidden rounded-2xl bg-[#172033] shadow-md md:col-span-3 cursor-pointer grayscale transition-all duration-500 ease-in-out hover:grayscale-0 hover:scale-[1.02] hover:shadow-xl"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 size-full object-cover object-center opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 md:p-5 text-white z-10">
                <h3 className="text-base md:text-lg font-bold">{card.title}</h3>
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
          {profileCards.slice(4).map((card) => (
            <Link
              key={card.title}
              href={card.href || '#'}
              className="group relative h-[160px] md:h-[180px] overflow-hidden rounded-2xl bg-[#172033] shadow-md md:col-span-4 cursor-pointer grayscale transition-all duration-500 ease-in-out hover:grayscale-0 hover:scale-[1.02] hover:shadow-xl"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 size-full object-cover object-center opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 md:p-5 text-white z-10">
                <h3 className="text-base md:text-lg font-bold">{card.title}</h3>
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function EventSlider() {
  const [banners, setBanners] = useState<EventBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetch('/api/event-banners', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: EventBanner[]) => setBanners(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Gagal memuat event banners:', err))
      .finally(() => setIsLoading(false))
  }, [])

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % Math.max(banners.length, 1))
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1)
    )

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentSlide, banners.length])

  if (!isLoading && banners.length === 0) {
    return null
  }

  return (
    <section
      id="banner"
      className="bg-white pt-10 pb-2 px-4 md:px-8 lg:px-12 scroll-mt-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="relative w-full h-[135px] sm:h-[195px] md:h-[270px] lg:h-[315px] rounded-2xl md:rounded-3xl overflow-hidden shadow-md group bg-slate-100">
          {isLoading ? (
            <div className="absolute inset-0 animate-pulse bg-slate-100" />
          ) : (
            <>
              {banners.map((banner, index) => {
                const hasValidLink = Boolean(
                  banner.href && banner.href !== '#' && banner.href.trim() !== ''
                )

                return (
                  <a
                    key={banner.id}
                    href={hasValidLink ? banner.href : '#'}
                    target={hasValidLink ? '_blank' : undefined}
                    rel={hasValidLink ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (!hasValidLink) {
                        e.preventDefault()
                      }
                    }}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 z-10'
                        : 'opacity-0 z-0'
                    } ${hasValidLink ? 'cursor-pointer' : 'cursor-default'}`}
                    tabIndex={index === currentSlide ? 0 : -1}
                    aria-hidden={index !== currentSlide}
                  >
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </a>
                )
              })}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  prevSlide()
                }}
                aria-label="Slide sebelumnya"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/75 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  nextSlide()
                }}
                aria-label="Slide berikutnya"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/75 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/65 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2.5 shadow-lg">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Pergi ke slide ${index + 1}: ${banner.title}`}
                    className={
                      index === currentSlide
                        ? 'w-7 h-2.5 rounded-full bg-[#159447] transition-all duration-300'
                        : 'w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/90 transition-all duration-300 cursor-pointer'
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

interface NewsItem {
  slug: string
  title: string
  date: string
  category?: string
  image?: string
}

function AnnouncementList({ items }: { items: NewsItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/pengumuman/${item.slug}`}
          className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col"
        >
          <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
            <div className="h-36 bg-[#fffbeb] flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/news.webp'
                    e.currentTarget.onerror = null
                  }}
                />
              ) : (
                <img
                  src="/images/toa_pengumuman.jpg"
                  alt="Pengumuman"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs font-bold text-[#159447] mb-2 uppercase tracking-wider">
                Pengumuman
              </div>
              <h3 className="text-sm font-semibold text-[#1d293d] leading-snug group-hover:text-[#159447] transition-colors line-clamp-3 flex-1">
                {item.title}
              </h3>
              <div className="mt-3 text-xs font-medium text-slate-400">
                {item.date}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function NewsCardList({ items }: { items: NewsItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/berita/${item.slug}`}
          className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col"
        >
          <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
            <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/news.webp'
                    e.currentTarget.onerror = null
                  }}
                />
              ) : (
                <ImageIcon size={32} className="text-slate-300" />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs font-bold text-[#159447] mb-2 uppercase tracking-wider">
                {item.category}
              </div>
              <h3 className="text-sm font-semibold text-[#1d293d] leading-snug group-hover:text-[#159447] transition-colors line-clamp-3 flex-1">
                {item.title}
              </h3>
              <div className="mt-3 text-xs font-medium text-slate-400">
                {item.date}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm flex flex-col">
      <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm animate-pulse">
        <div className="h-36 bg-slate-200" />
        <div className="p-4 flex flex-col flex-1">
          <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-full bg-slate-200 rounded mb-2" />
          <div className="h-4 w-3/4 bg-slate-200 rounded mb-4" />
          <div className="h-3 w-24 bg-slate-200 rounded mt-auto" />
        </div>
      </div>
    </div>
  )
}

function News() {
  const [dbAnnouncements, setDbAnnouncements] = useState<AnnouncementItem[]>([])
  const [dbNews, setDbNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        getAnnouncements().then((data) => setDbAnnouncements(data.slice(0, 3))),
        fetchNews().then((data) => setDbNews(data.slice(0, 3))),
      ])
      setIsLoading(false)
    }
    loadData()
  }, [])

  return (
    <section id="berita" className="bg-white px-4 py-10 md:px-8 lg:px-12 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading subtitle="Pengumuman dan berita terbaru dari Kota Sukabumi.">
          Pengumuman {'&'} Berita
        </SectionHeading>
        <div className="grid gap-14 lg:grid-cols-2 items-start">
          <div className="flex flex-col">
            <h3 className="mb-6 text-2xl font-bold text-[#263349]">
              Pengumuman
            </h3>
            <div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" />
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <AnnouncementList items={dbAnnouncements} />
            )}
            <div className="mt-8 flex justify-end">
              <Link
                href="/pengumuman"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#159447] bg-white px-6 py-2 text-sm font-bold text-[#159447] transition-all hover:bg-[#f0fdf4] hover:shadow-sm"
              >
                Lainnya <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-6 text-2xl font-bold text-[#263349]">Berita</h3>
            <div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" />
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <NewsCardList items={dbNews} />
            )}
            <div className="mt-8 flex justify-end">
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#159447] bg-white px-6 py-2 text-sm font-bold text-[#159447] transition-all hover:bg-[#f0fdf4] hover:shadow-sm"
              >
                Lainnya <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Opd({
  settings,
  onIframeToggle,
}: {
  settings: OpdSettings
  onIframeToggle?: (isOpen: boolean) => void
}) {
  const opdServices = settings.categories || {}
  const categoryKeys = Object.keys(opdServices)
  const [activeCategory, setActiveCategory] = useState(
    categoryKeys[0] || 'Sekretariat Daerah'
  )
  const [cardPage, setCardPage] = useState(0)
  const cardsPerPage = 6

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStack, setModalStack] = useState<
    Array<{ title: string; items: OpdSubItem[] }>
  >([])
  const [modalPage, setModalPage] = useState(0)
  const cardsPerModalPage = 4

  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [iframeTitle, setIframeTitle] = useState('')
  const [iframeLoading, setIframeLoading] = useState(false)

  const openIframeModal = (url: string, title: string) => {
    setIframeUrl(url)
    setIframeTitle(title)
    setIframeLoading(true)
    onIframeToggle?.(true)
  }

  const closeIframeModal = () => {
    setIframeUrl(null)
    setIframeTitle('')
    setIframeLoading(false)
    onIframeToggle?.(false)
  }

  useEffect(() => {
    if (iframeUrl) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${scrollY}px`
      document.body.classList.add('hide-navbar')

      const preventScroll = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      document.addEventListener('wheel', preventScroll, { passive: false })
      document.addEventListener('touchmove', preventScroll, { passive: false })
      document.addEventListener('scroll', preventScroll, { passive: false })

      return () => {
        const savedScrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.body.classList.remove('hide-navbar')
        window.scrollTo(0, parseInt(savedScrollY || '0') * -1)
        document.removeEventListener('wheel', preventScroll)
        document.removeEventListener('touchmove', preventScroll)
        document.removeEventListener('scroll', preventScroll)
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      document.body.classList.remove('hide-navbar')
    }
  }, [iframeUrl])

  const categoryData = opdServices[activeCategory]

  const currentModalLevel = modalStack[modalStack.length - 1] || {
    title: '',
    items: [],
  }
  const selectedModalTitle = currentModalLevel.title
  const selectedModalData = currentModalLevel.items

  const processedPages: Array<{
    title: string
    items: OpdServiceCard[]
    groupIndex: number
  }> = []

  if (categoryData?.groups) {
    categoryData.groups.forEach((group, groupIndex) => {
      const groupItems = group.items || []

      if (groupItems.length === 0) {
        processedPages.push({
          title: group.title,
          items: [],
          groupIndex,
        })
      } else {
        for (let i = 0; i < groupItems.length; i += cardsPerPage) {
          const chunk = groupItems.slice(i, i + cardsPerPage)
          processedPages.push({
            title: group.title,
            items: chunk,
            groupIndex,
          })
        }
      }
    })
  }

  const currentPage = processedPages[cardPage] || { title: '', items: [] }
  const totalPages = processedPages.length

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setCardPage(0)
  }

  const handlePrevPage = () => {
    setCardPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCardPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const openModal = (service: OpdServiceCard) => {
    setModalStack([{ title: service.title, items: service.subItems || [] }])
    setModalPage(0)
    setIsModalOpen(true)
  }

  const openSubModal = (item: OpdSubItem) => {
    if (item.subItems && item.subItems.length > 0) {
      setModalStack((prev) => [
        ...prev,
        { title: item.title, items: item.subItems || [] },
      ])
      setModalPage(0)
    }
  }

  const handleModalBack = () => {
    if (modalStack.length > 1) {
      setModalStack((prev) => prev.slice(0, prev.length - 1))
      setModalPage(0)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalStack([])
  }

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else if (!iframeUrl) {
      document.body.style.overflow = ''
    }
    return () => {
      if (!iframeUrl) document.body.style.overflow = ''
    }
  }, [isModalOpen, iframeUrl])

  const totalModalPages = Math.ceil(selectedModalData.length / cardsPerModalPage)
  const currentModalItems = selectedModalData.slice(
    modalPage * cardsPerModalPage,
    (modalPage + 1) * cardsPerModalPage
  )

  return (
    <>
      <section
        id="opd"
        className="bg-slate-50 px-4 py-10 md:px-8 lg:px-12 md:py-16"
      >
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading subtitle={settings.subtitle}>
            {settings.heading}
          </SectionHeading>
          <div className="flex flex-col md:flex-row md:min-h-[560px] overflow-hidden rounded-xl border border-[#e2e8ed] bg-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.5)]">
            <div className="flex w-full flex-row overflow-x-auto hide-scrollbar gap-2 p-3.5 border-b border-[#e5e7eb] md:w-[28%] md:flex-col md:gap-4 md:p-8 md:border-b-0 md:border-r">
              {categoryKeys.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`shrink-0 whitespace-nowrap md:whitespace-normal min-h-[44px] px-4 py-2.5 md:px-6 md:py-4 text-sm md:text-base text-left font-medium transition-all duration-200 rounded-lg border-2 ${
                    activeCategory === category
                      ? 'border-[#159447] bg-[#159447] text-white'
                      : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-slate-50 hover:shadow-md'
                  }`}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 md:min-h-[560px]">
              <div
                key={`page-${activeCategory}-${cardPage}`}
                className="flex flex-1 flex-col animate-[fadeInUp_0.5s_ease-out]"
              >
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1b293c]">
                    {currentPage.title}
                  </h3>
                </div>

                <div className="flex-1 md:min-h-[350px]">
                  {currentPage.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[220px] md:min-h-[350px] text-center p-6 md:p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Building size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        Belum ada daftar mitra
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Daftar portal dan layanan mitra akan segera ditambahkan.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5 md:gap-4 md:grid-cols-2 content-start md:min-h-[350px]">
                      {currentPage.items.map(
                        (service: OpdServiceCard, index: number) => {
                          const outerClasses =
                            'group p-1.5 rounded-[20px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex w-full text-left cursor-pointer'
                          const inner = (
                            <div className="flex items-center gap-4 flex-1 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm transition-all duration-300 group-hover:border-[#159447]/40 w-full min-w-0">
                              <div
                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl p-1 transition-transform duration-300 group-hover:scale-105 ${
                                  service.image
                                    ? ''
                                    : 'bg-[#f0fdf4] text-[#16a34a]'
                                }`}
                              >
                                {service.image ? (
                                  <img
                                    src={service.image}
                                    alt={service.title}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Building size={22} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#1b293c] group-hover:text-[#159447] transition-colors">
                                  {service.title}
                                </h4>
                                <p className="text-sm text-[#66758a] mt-0.5 truncate">
                                  {service.subtitle}
                                </p>
                              </div>
                              <ChevronRight
                                size={20}
                                className="shrink-0 text-[#cbd5e1] group-hover:text-[#159447] group-hover:translate-x-0.5 transition-all"
                              />
                            </div>
                          )

                          const itemKey = `${service.id || 'service'}-${index}`

                          if (
                            service.subItems &&
                            service.subItems.length > 0
                          ) {
                            return (
                              <button
                                key={itemKey}
                                onClick={() => openModal(service)}
                                className={outerClasses}
                              >
                                {inner}
                              </button>
                            )
                          }

                          return (
                            <button
                              key={itemKey}
                              onClick={() =>
                                service.href && service.href !== '#'
                                  ? openIframeModal(service.href, service.title)
                                  : undefined
                              }
                              className={outerClasses}
                            >
                              {inner}
                            </button>
                          )
                        }
                      )}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-auto pt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={cardPage === 0}
                      className="z-20 grid size-11 place-items-center rounded-full border border-[#d5dfe8] bg-white text-[#cbd5e1] hover:text-[#159447] disabled:opacity-50"
                      aria-label="Halaman sebelumnya"
                    >
                      <ArrowLeft />
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCardPage(index)}
                          aria-label={`Go to page ${index + 1}`}
                          className={`rounded-full transition-all duration-200 ${
                            index === cardPage
                              ? 'w-4 h-3 bg-[#159447] cursor-default'
                              : 'size-3 bg-[#cbd5e1] cursor-pointer hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={cardPage === totalPages - 1}
                      className="z-20 grid size-11 place-items-center rounded-full border border-[#c4d2df] bg-white text-[#26354a] hover:text-[#159447] disabled:opacity-50"
                      aria-label="Halaman berikutnya"
                    >
                      <ArrowRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-[#e5ebf0] text-[#66758a] hover:bg-slate-100 hover:text-[#1b293c] transition"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-10">
              {modalStack.length > 1 && (
                <button
                  onClick={handleModalBack}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#159447] hover:underline mb-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>
                    Kembali ke {modalStack[modalStack.length - 2].title}
                  </span>
                </button>
              )}
              <div className="flex items-center gap-3 mb-1">
                <span className="h-6 w-1 rounded-full bg-[#159447]" />
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-[#1b293c]"
                >
                  {selectedModalTitle}
                </h2>
              </div>
              <p className="text-sm text-[#66758a] ml-4">
                Pilih layanan yang tersedia
              </p>
            </div>

            <div className="flex flex-col min-h-[260px]">
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                  {currentModalItems.map((item, index) => {
                    const outerClasses =
                      'group p-1.5 rounded-[20px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex w-full text-left cursor-pointer'
                    const inner = (
                      <div className="flex items-center gap-4 flex-1 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm transition-all duration-300 group-hover:border-[#159447]/40 w-full min-w-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1 transition-transform duration-300 group-hover:scale-105 ${
                            item.image ? '' : 'bg-[#f0fdf4] text-[#16a34a]'
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <ShoppingCart size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1b293c] group-hover:text-[#159447] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#66758a] leading-snug mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="shrink-0 text-[#cbd5e1] group-hover:text-[#159447] group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    )

                    const itemKey = `${item.id || 'modal-item'}-${index}`

                    if (item.subItems && item.subItems.length > 0) {
                      return (
                        <button
                          key={itemKey}
                          onClick={() => openSubModal(item)}
                          className={outerClasses}
                        >
                          {inner}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={itemKey}
                        onClick={() =>
                          item.href && item.href !== '#'
                            ? openIframeModal(item.href, item.title)
                            : undefined
                        }
                        className={outerClasses}
                      >
                        {inner}
                      </button>
                    )
                  })}
                </div>
              </div>

              {totalModalPages > 1 && (
                <div className="mt-auto pt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setModalPage((p) => Math.max(0, p - 1))}
                    disabled={modalPage === 0}
                    className="grid size-11 place-items-center rounded-full border border-[#d5dfe8] bg-white text-[#cbd5e1] hover:text-[#159447] disabled:opacity-50"
                    aria-label="Halaman modal sebelumnya"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalModalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setModalPage(index)}
                        aria-label={`Modal page ${index + 1}`}
                        className={`rounded-full transition-all duration-200 ${
                          index === modalPage
                            ? 'w-4 h-3 bg-[#159447] cursor-default'
                            : 'size-3 bg-[#cbd5e1] cursor-pointer hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setModalPage((p) => Math.min(totalModalPages - 1, p + 1))
                    }
                    disabled={modalPage === totalModalPages - 1}
                    className="grid size-11 place-items-center rounded-full border border-[#c4d2df] bg-white text-[#26354a] hover:text-[#159447] disabled:opacity-50"
                    aria-label="Halaman modal berikutnya"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {iframeUrl && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm animate-[fadeIn_0.25s_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${iframeTitle}`}
        >
          <div className="flex items-center justify-between gap-3 bg-[#1b293c] px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={closeIframeModal}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                aria-label="Kembali"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Kembali</span>
              </button>

              <div className="h-8 w-px bg-white/15 shrink-0" />

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <img
                    src="/images/Lambang_Kota_Sukabumi.png"
                    alt="Lambang Kota Sukabumi"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/60 leading-none mb-0.5">
                    Pemerintah Kota Sukabumi
                  </p>
                  <p className="text-base font-bold text-white truncate">
                    {iframeTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-1 mx-4 items-center gap-2.5 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 min-w-0">
              <Shield size={14} className="text-[#86efac]" />
              <span className="text-xs text-white/70 truncate font-mono">
                {iframeUrl}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={iframeUrl ?? ''}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                title="buka di tab baru"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="hidden sm:inline">buka di Tab Baru</span>
              </a>

              <div className="hidden xl:flex items-center gap-2 border-l border-white/15 pl-4">
                <div className="flex flex-col items-end justify-center gap-0.5">
                  <span className="text-[9px] font-bold text-white/40 tracking-wider">
                    SECURITY STATUS
                  </span>
                  <span className="text-[11px] font-bold text-[#4ade80]">
                    PROTECTED CONNECTION
                  </span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20">
                  <Shield
                    size={16}
                    className="text-[#4ade80] fill-[#4ade80]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-1 bg-white">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5ebf0] border-t-[#159447]" />
                <p className="text-sm text-[#66758a]">Memuat halaman...</p>
              </div>
            )}
            <iframe
              src={iframeUrl}
              title={iframeTitle}
              className="h-full w-full border-0"
              onLoad={() => setIframeLoading(false)}
              onError={() => setIframeLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          <div className="flex items-center justify-between gap-4 bg-[#1b293c]/90 px-5 py-2.5">
            <p className="text-xs md:text-sm text-white/60 font-medium">
              Jika situs tidak muncul,{' '}
              <a
                href={iframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs md:text-sm font-semibold text-[#4ade80] hover:underline"
              >
                buka di tab baru{' '}
                <ArrowRight size={14} className="inline-flex items-center" />
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

interface TransparansiDoc {
  id: number
  title: string
  type: string
  category: string
  description: string
  date: string
  pdfUrl: string | null
}

function TransparansiDokumen() {
  const [documents, setDocuments] = useState<TransparansiDoc[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedDocument, setSelectedDocument] =
    useState<TransparansiDoc | null>(null)
  const [downloadConfirm, setDownloadConfirm] =
    useState<TransparansiDoc | null>(null)
  const itemsPerPage = 6
  const totalPages = Math.ceil(documents.length / itemsPerPage)

  useEffect(() => {
    fetch('/api/transparansi-dokumen', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: TransparansiDoc[]) => {
        setDocuments(Array.isArray(data) ? data : [])
        setIsLoadingDocs(false)
      })
      .catch((err) => {
        console.error('Gagal memuat transparansi dokumen:', err)
        setIsLoadingDocs(false)
      })
  }, [])

  const currentDocuments = documents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleViewClick = (doc: TransparansiDoc) => {
    setSelectedDocument(doc)
  }

  const handleCloseModal = () => {
    setSelectedDocument(null)
  }

  const handlePrevDocument = () => {
    if (selectedDocument) {
      const currentIndex = documents.findIndex(
        (doc) => doc.id === selectedDocument.id
      )
      if (currentIndex > 0) {
        setSelectedDocument(documents[currentIndex - 1])
      }
    }
  }

  const handleNextDocument = () => {
    if (selectedDocument) {
      const currentIndex = documents.findIndex(
        (doc) => doc.id === selectedDocument.id
      )
      if (currentIndex < documents.length - 1) {
        setSelectedDocument(documents[currentIndex + 1])
      }
    }
  }

  const getCurrentDocumentIndex = () => {
    if (selectedDocument) {
      return documents.findIndex((doc) => doc.id === selectedDocument.id) + 1
    }
    return 0
  }

  useEffect(() => {
    if (selectedDocument) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedDocument])

  return (
    <section
      id="transparansi"
      className="bg-white px-4 py-10 md:px-8 lg:px-12 md:py-16"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-start justify-between">
          <SectionHeading subtitle="Akses mudah ke dokumen resmi sebagai wujud transparansi dan akuntabilitas pemerintahan.">
            Transparansi Dokumen Daerah
          </SectionHeading>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {isLoadingDocs ? (
              <div className="col-span-full flex items-center justify-center py-16 text-slate-400 text-sm">
                Memuat dokumen...
              </div>
            ) : documents.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-16 text-slate-400 text-sm">
                Belum ada dokumen transparansi yang diterbitkan.
              </div>
            ) : (
              currentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col min-w-0 w-full"
                >
                  <div className="flex flex-col flex-1 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm transition-all duration-300 group-hover:border-[#159447]/40 min-w-0 overflow-hidden">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#f0fdf4] border border-[#159447] transition-transform duration-300 group-hover:scale-105">
                        <FileText className="h-5 w-5 text-[#159447]" />
                        <span className="text-[10px] font-bold text-[#159447] leading-none mt-0.5">
                          {doc.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-[#159447] mb-1.5 uppercase tracking-wider">
                      Transparansi Dokumen
                    </div>

                    <h3
                      title={doc.title}
                      className="text-sm font-semibold leading-snug text-[#1d293d] line-clamp-3 group-hover:text-[#159447] transition-colors break-words [overflow-wrap:anywhere]"
                    >
                      {doc.title}
                    </h3>

                    <div className="mt-1.5 mb-3 text-xs font-medium text-slate-400">
                      {doc.date}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleViewClick(doc)}
                        className="flex-1 rounded-lg bg-[#f8f9fa] border border-slate-200/80 px-2.5 py-1.5 text-center text-xs font-semibold text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#1f2937] transition-colors cursor-pointer"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => setDownloadConfirm(doc)}
                        className="flex-1 rounded-lg bg-[#159447] px-2.5 py-1.5 text-center text-xs font-semibold text-white hover:bg-[#0f7a36] transition-colors cursor-pointer"
                      >
                        Unduh
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  currentPage === 0
                    ? 'cursor-not-allowed bg-[#f1f3f4] text-[#9ca3af]'
                    : 'bg-white text-[#374151] hover:bg-[#f9fafb] border border-[#e5e7eb]'
                }`}
              >
                <ArrowLeft size={16} />
              </button>

              <span className="text-sm text-[#6b7280]">
                {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  currentPage === totalPages - 1
                    ? 'cursor-not-allowed bg-[#f1f3f4] text-[#9ca3af]'
                    : 'bg-white text-[#374151] hover:bg-[#f9fafb] border border-[#e5e7eb]'
                }`}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {selectedDocument && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pt-24 md:pt-28"
            onClick={handleCloseModal}
          >
            <div
              className="bg-[#fafafa] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 md:p-8 flex flex-col flex-1 min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                  <div className="lg:col-span-5 flex flex-col gap-5 pr-0 md:pr-2">
                    <div>
                      <div className="mb-3">
                        <span className="inline-block bg-[#f1f5f9] text-[#475569] text-xs font-medium px-4 py-1.5 rounded-md">
                          {selectedDocument.category}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-[#159447] leading-snug">
                        {selectedDocument.title}
                      </h2>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[#159447] mb-1">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs text-[#94a3b8] font-medium">
                          Deskripsi Program
                        </span>
                      </div>
                      <p className="text-[#334155] text-sm md:text-sm pl-6 leading-relaxed">
                        {selectedDocument.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[#159447] mb-1">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                        <span className="text-xs text-[#94a3b8] font-medium">
                          Tanggal Pemberlakuan
                        </span>
                      </div>
                      <p className="text-[#334155] text-sm md:text-sm pl-6">
                        {selectedDocument.date}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 h-full min-h-[300px] bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {selectedDocument.pdfUrl ? (
                      <embed
                        src={selectedDocument.pdfUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Dokumen tidak tersedia
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-5 py-3.5 bg-white shrink-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={handlePrevDocument}
                      disabled={getCurrentDocumentIndex() === 1}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                        getCurrentDocumentIndex() === 1
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <span className="text-xs text-[#94a3b8] font-semibold mx-1">
                      {getCurrentDocumentIndex()} / {documents.length}
                    </span>

                    <button
                      onClick={handleNextDocument}
                      disabled={getCurrentDocumentIndex() === documents.length}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                        getCurrentDocumentIndex() === documents.length
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-xs md:text-sm rounded-lg border-2 border-[#159447] text-[#159447] font-bold hover:bg-[#159447]/5 transition-colors"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => setDownloadConfirm(selectedDocument)}
                      className="px-4 py-2 text-xs md:text-sm rounded-lg bg-[#159447] text-white font-bold hover:bg-[#0f7a36] shadow-md transition-all flex items-center gap-1.5"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Unduh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {downloadConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-[fadeInUp_0.2s_ease-out]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border-2 border-green-100">
                  <svg
                    className="h-6 w-6 text-[#159447]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                  Konfirmasi Unduhan
                </h3>
                <p className="mb-6 text-sm text-[#66758a]">
                  Apakah yakin ingin unduh dokumen ini?
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setDownloadConfirm(null)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tidak
                  </button>
                  <a
                    href={downloadConfirm.pdfUrl || '#'}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDownloadConfirm(null)}
                    className="flex-1 rounded-lg bg-[#159447] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f7a36] transition-colors flex items-center justify-center"
                  >
                    Ya
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Partners({ settings }: { settings: PartnersSettings }) {
  const partners = settings.items || []
  const displayPartners = [...partners, ...partners, ...partners]

  return (
    <section className="bg-[#F8F9FA] py-12 md:py-16 border-t border-[#e5ebf0] overflow-hidden">
      <div className="w-full relative">
        <div className="relative flex overflow-hidden w-full before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[50px] md:before:w-[200px] before:bg-gradient-to-r before:from-[#F8F9FA] before:to-transparent before:content-[''] after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[50px] md:after:w-[200px] after:bg-gradient-to-l after:from-[#F8F9FA] after:to-transparent after:content-['']">
          <div className="flex w-max animate-marquee items-center gap-16 md:gap-32 pr-16 md:pr-32">
            {displayPartners.map((partner, idx) => (
              <a
                key={`${partner.id}-${idx}`}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform duration-500 hover:scale-110 flex-shrink-0"
              >
                <img
                  src={partner.image}
                  alt={partner.alt || `Partner ${partner.id}`}
                  className="h-12 md:h-16 w-auto max-w-[150px] md:max-w-[200px] object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MediaSection({ settings }: { settings: MediaSettings }) {
  const widgetViewportRef = useRef<HTMLDivElement>(null)
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    const container = document.getElementById('gpr-kominfo-widget-container')
    if (!container) return

    container.innerHTML = ''
    setWidgetLoaded(false)

    const oldScript = document.getElementById('gpr-kominfo-script')
    if (oldScript) {
      oldScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'gpr-kominfo-script'
    script.src = 'https://widget.komdigi.go.id/gpr-widget-kominfo.min.js'
    script.type = 'text/javascript'
    script.async = true

    document.body.appendChild(script)

    const adjustWidgetLayout = () => {
      const viewport = widgetViewportRef.current
      if (!viewport || !container) return

      if (container.childElementCount > 0) {
        setWidgetLoaded(true)
      }

      const viewportH = viewport.clientHeight
      if (viewportH <= 0) return

      const rootWidget = container.firstElementChild as HTMLElement | null
      if (rootWidget) {
        rootWidget.style.width = '100%'
        rootWidget.style.maxWidth = '100%'
        rootWidget.style.height = `${viewportH}px`
        rootWidget.style.maxHeight = `${viewportH}px`
        rootWidget.style.overflow = 'hidden'
        rootWidget.style.boxSizing = 'border-box'
      }

      const allEls = Array.from(container.querySelectorAll<HTMLElement>('*'))
      const scrollableList = allEls.find((el) => {
        const s = window.getComputedStyle(el)
        return (
          (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
          el.clientHeight > 100
        )
      })

      if (!scrollableList) return

      const footerEl = container.querySelector<HTMLElement>(
        '#gpr-kominfo-widget-footer, .gpr-kominfo-widget-footer'
      )
      if (footerEl) {
        footerEl.style.paddingTop = '6px'
        footerEl.style.paddingBottom = '6px'
        footerEl.style.minHeight = '0px'
        footerEl.style.height = 'auto'
      }

      const viewportRect = viewport.getBoundingClientRect()
      const listRect = scrollableList.getBoundingClientRect()
      const topOffset = Math.max(0, listRect.top - viewportRect.top)

      const bottomFooterSpace = 14
      const targetListHeight = Math.max(
        180,
        viewportH - topOffset - bottomFooterSpace
      )

      scrollableList.style.height = `${targetListHeight}px`
      scrollableList.style.maxHeight = `${targetListHeight}px`

      if (rootWidget) {
        rootWidget.style.paddingBottom = `${bottomFooterSpace}px`
      }
    }

    const mutationObserver = new MutationObserver(() => {
      adjustWidgetLayout()
    })
    mutationObserver.observe(container, { childList: true, subtree: true })

    const resizeObserver = new ResizeObserver(() => {
      adjustWidgetLayout()
    })
    if (widgetViewportRef.current) {
      resizeObserver.observe(widgetViewportRef.current)
    }

    window.addEventListener('resize', adjustWidgetLayout)

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('resize', adjustWidgetLayout)
      const s = document.getElementById('gpr-kominfo-script')
      if (s) {
        s.remove()
      }
    }
  }, [])

  return (
    <section className="bg-white px-4 pb-10 md:px-8 lg:px-12 md:pb-16">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4 lg:relative lg:h-full">
          <div className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col lg:absolute lg:inset-0">
            <div className="flex flex-col flex-1 h-full rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-5 shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
              <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 sm:pb-4 sm:mb-4 border-b border-slate-100 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold tracking-wide text-[#172135] uppercase">
                    {settings.gprTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {settings.gprSubtitle}
                  </p>
                </div>
                <a
                  href={settings.gprPortalUrl || 'https://www.komdigi.go.id'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-[#172135] transition-colors hover:border-[#159447] hover:text-[#159447]"
                >
                  Portal
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17L17 7M17 7H8M17 7V16"
                    />
                  </svg>
                </a>
              </div>

              <div
                ref={widgetViewportRef}
                className="relative w-full h-[440px] sm:h-[480px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-xl bg-[#1e1b6e]"
              >
                {!widgetLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-medium text-white/80 pointer-events-none">
                    Memuat widget GPR Komdigi...
                  </div>
                )}
                <div
                  id="gpr-kominfo-widget-container"
                  className="w-full h-full max-w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="group p-1.5 rounded-[22px] bg-slate-200/55 border border-slate-300/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#159447]/10 hover:border-[#159447]/35 hover:shadow-lg flex flex-col">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-sm transition-all duration-300 group-hover:border-[#159447]/40">
              <iframe
                src={settings.youtubeEmbedUrl}
                title={settings.youtubeTitle || 'Profil Kota Sukabumi'}
                className="h-full w-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomeClient({
  settings,
}: {
  settings: SiteSettingsMap
}) {
  const [, setIsIframeOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <Hero settings={settings.hero} />
      <Welcome settings={settings.welcome} />

      <div className="bg-white">
        <Profile settings={settings.profile} />
        <EventSlider />
        <News />
        <MediaSection settings={settings.media} />
        <Opd settings={settings.opd} onIframeToggle={setIsIframeOpen} />
        <TransparansiDokumen />
      </div>
      <Partners settings={settings.partners} />
    </main>
  )
}
