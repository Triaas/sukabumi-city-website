'use client'

import {
  FileText,
  Scale,
  BarChart3,
  ShoppingCart,
  Users,
  CheckCircle,
  Eye,
  Shield,
  HeartPulse,
  Heart,
  Activity,
  Stethoscope,
  AlertCircle,
  GraduationCap,
  BookOpen,
  School,
  Award,
  Building,
  Navigation,
  Globe,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Camera,
  CircleUserRound,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Play,
  Search,
  X,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react'

const profileCards = [
  { title: 'Sejarah', description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa.', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80'},
  { title: 'Visi Misi', description: 'Arah pembangunan dan tujuan yang ingin dicapai.', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80' },
  { title: 'Lambang', description: 'Makna filosofis di balik lambang resmi daerah.', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80' },
  { title: 'Geografi', description: 'Letak topografi, dan kondisi geografis wilayah.', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80' },
  { title: 'Sosial Ekonomi', description: 'Kondisi demografi dan pergerakan ekonomi masyarakat.', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80' },
  { title: 'Dalam Angka', description: 'Data statistik dan indikator kinerja daerah.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80' },
  { title: 'Unit Kesehatan Sekolah (UKS)', description: 'Program pembinaan kesehatan komprehensif di lingkungan sekolah.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80' },
]

const announcements = [
  ['SURAT EDARAN PELAKSANAAN KEGIATAN HARI JADI KOTA SUKABUMI KE-110', '24 Okt 2023', 'Edaran Resmi'],
  ['JADWAL SELEKSI KOMPETENSI DASAR (SKD) CALON APARATUR SIPIL NEGARA', '18 Okt 2023', 'Kepegawaian (BKPSDM)'],
  ['PEMBERITAHUAN PEMELIHARAAN SISTEM LAYANAN KEPENDUDUKAN DIGITAL', '12 Okt 2023', 'Pelayanan Publik'],
]

const news = [
  ['PELANTIKAN PENGURUS MUI KOTA SUKABUMI PERIODE 2023-2028 RESMI DISELENGGARAKAN', '25 Okt 2023', 'Bagian Kesra Kota Sukabumi'],
  ['WALIKOTA SUKABUMI APRESIASI GELAR BUDAYA DAN KULINER TRADISIONAL DI ALUN-ALUN', '22 Okt 2023', 'Disporapar Kota Sukabumi'],
  ['DINAS PEKERJAAN UMUM TINJAU PENYELESAIAN PROYEK DRAINASE DAN JALAN KOTA', '19 Okt 2023', 'DPUTR Kota Sukabumi'],
]

function SectionHeading({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return <div className="mb-9"><h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[#172135] md:text-4xl"><span className="h-10 w-1.5 rounded-full bg-[#159447]" />{children}</h2>{subtitle && <p className="mt-3 max-w-5xl text-lg leading-relaxed text-[#566276]">{subtitle}</p>}</div>
}

function Navbar() {
  const [activeSection, setActiveSection] = useState('beranda')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'profil', label: 'Profil' },
    { id: 'berita', label: 'Pengumuman & Berita' },
    { id: 'opd', label: 'Situs OPD' },
    { id: 'footer', label: 'Kebijakan Privasi' },
  ]

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemRefs.current[activeSection]
      if (activeEl && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const itemRect = activeEl.getBoundingClientRect()
        setIndicatorStyle({
          left: itemRect.left - navRect.left,
          width: itemRect.width,
        })
      }
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeSection])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180

      for (let i = navItems.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(navItems[i].id)
        if (sectionEl) {
          const top = sectionEl.offsetTop
          if (scrollPosition >= top) {
            setActiveSection(navItems[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 lg:px-12 flex justify-center w-full">
      <div className="w-full max-w-[1400px] bg-slate-900/70 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 px-6 py-3 shadow-xl transition-all duration-300 flex items-center justify-between gap-8 md:gap-12">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Kota Sukabumi" className="h-12 w-auto object-contain shrink-0" />
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-white/75">WEBSITE RESMI</p>
            <p className="text-xl font-bold md:text-2xl text-white">Pemerintah Kota Sukabumi</p>
            <p className="font-serif text-sm md:text-base italic text-[#f4ce4b]">Reugreug Pageuh Repeh Rapih</p>
          </div>
        </div>

        <nav ref={navRef} className="relative hidden items-center gap-4 md:gap-6 lg:gap-8 text-base font-semibold lg:flex py-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                ref={(el) => { itemRefs.current[item.id] = el }}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(item.id)
                  const el = document.getElementById(item.id)
                  if (el) {
                    const offsetTop = el.offsetTop - 100
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
                  }
                }}
                className={`pb-1 transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
              >
                {item.label}
              </a>
            )
          })}
          <span
            className="absolute bottom-0 bg-[#f9c74f] h-[3px] rounded-full transition-all duration-300 ease-in-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </nav>

        <button className="rounded-lg p-2 text-white lg:hidden" aria-label="Buka pencarian">
          <Search />
        </button>
      </div>
    </header>
  )
}

function Hero() {
  const images = ['/images/lapang-merdeka.webp', '/images/tugu-kota.webp']
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section id="beranda" className="relative flex h-[85vh] min-h-[650px] items-end overflow-hidden bg-[#0c1d26] pt-36 pb-20 md:pt-44 md:pb-28">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="Kota Sukabumi"
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/30 z-10" />
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 pb-12 md:px-8 lg:px-12">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#f3c338]">Selamat datang di</p>
          <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">Kota Sukabumi</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85 md:text-xl">
            Reugreug Pageuh Repeh Rapih — bersama membangun kota yang maju, unggul, berbudaya, dan berkah.
          </p>
        </div>
      </div>
    </section>
  )
}

function Welcome() { return <section className="bg-white px-4 py-20 md:px-8 lg:px-12 md:py-28"><div className="mx-auto flex max-w-[1400px] flex-col items-center gap-12 lg:flex-row lg:gap-16"><article className="max-w-[390px] rounded-3xl bg-[#eff4f8] p-8 shadow-sm md:p-10"><h2 className="text-3xl font-bold leading-tight text-[#ba8500]">Reugreug Pageuh Repeh Rapih</h2><p className="mt-6 text-lg leading-relaxed text-[#29364a]">Untuk mewujudkan masyarakat yang reugreug harinya, harus dipegang pageuh norma dan kebiasaan saling menghormati, tepa selira, dan toleran agar kehidupan masyarakat menjadi répeh, tidak dipenuhi oleh bentakan dan hentakkan, sebuah masyarakat yang mempertontonkan rapih dan saling memuliakan.</p></article><div className="flex flex-1 items-end justify-center gap-0"><div className="relative z-10 w-full max-w-[500px] self-end"><img src="/images/foto walikota dan wakil walikota.webp" className="w-full" alt="Walikota dan Wakil Walikota Sukabumi" /></div><div className="ml-10 hidden max-w-[270px] md:block"><p className="font-serif text-4xl italic text-[#516076]">Sukabumi</p><p className="text-5xl font-black tracking-tight text-[#18243b]"><span className="text-[#f29b10]">M</span>UBARAKAH</p><p className="mt-3 font-bold tracking-[0.22em] text-[#62738c]">MAJU, UNGGUL, BERBUDAYA &amp; BERKAH</p></div></div></div></section> }

function Profile() {
  return (
    <section id="profil" className="bg-[#f6f8fa] px-4 py-20 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading subtitle="Mengenal lebih dekat sejarah, visi misi, dan berbagai aspek penting lainnya dari Kota Sukabumi.">
          Profil Kota Sukabumi
        </SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {profileCards.slice(0, 4).map((card) => (
            <article
              key={card.title}
              className="group relative h-[160px] md:h-[180px] overflow-hidden rounded-2xl bg-[#172033] shadow-md md:col-span-3 cursor-pointer grayscale transition-all duration-500 ease-in-out hover:grayscale-0 hover:scale-[1.02] hover:shadow-xl"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 size-full object-cover object-center opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 md:p-5 text-white z-10">
                <h3 className="text-base md:text-lg font-bold">{card.title}</h3>
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">{card.description}</p>
              </div>
            </article>
          ))}
          {profileCards.slice(4).map((card) => (
            <article
              key={card.title}
              className="group relative h-[160px] md:h-[180px] overflow-hidden rounded-2xl bg-[#172033] shadow-md md:col-span-4 cursor-pointer grayscale transition-all duration-500 ease-in-out hover:grayscale-0 hover:scale-[1.02] hover:shadow-xl"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 size-full object-cover object-center opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 md:p-5 text-white z-10">
                <h3 className="text-base md:text-lg font-bold">{card.title}</h3>
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsList({ items, announcement = false }: { items: string[][]; announcement?: boolean }) { return <div className="flex flex-col gap-6">{items.map(([title, date, category]) => <article key={title} className="flex gap-5"><div className={`grid size-20 shrink-0 place-items-center rounded-lg ${announcement ? 'bg-[#eff4f8] text-[#f29b10]' : 'bg-[#d6d6d6] text-xs text-black'}`}>{announcement ? <Megaphone /> : 'img'}</div><div><h3 className="text-base font-bold leading-tight text-[#1d293d]">{title}</h3><p className="mt-1 text-sm text-[#687991]">{date} <span className="text-[#159447]">•</span> {category}</p></div></article>)}</div> }

function News() { return <section id="berita" className="bg-[#f6f8fa] px-4 py-20 md:px-8 lg:px-12"><div className="mx-auto max-w-[1400px]"><SectionHeading>Pengumuman &amp; Berita</SectionHeading><div className="grid gap-14 lg:grid-cols-2"><div><h3 className="mb-6 text-2xl font-bold text-[#263349]">Pengumuman</h3><div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" /><NewsList items={announcements} announcement /><a className="mt-8 inline-flex items-center gap-2 font-bold text-[#138c44]" href="#berita">Lihat Semua <ArrowRight size={18} /></a></div><div><h3 className="mb-6 text-2xl font-bold text-[#263349]">Berita</h3><div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" /><NewsList items={news} /><a className="mt-8 inline-flex items-center gap-2 font-bold text-[#138c44]" href="#berita">Lihat Semua <ArrowRight size={18} /></a></div></div></div></section> }

interface SubItem {
  id: string
  title: string
  subtitle: string
  href: string
}

interface ServiceCard {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
  subItems?: SubItem[]
}

interface ServiceGroup {
  title: string
  items: ServiceCard[]
}

interface OpdCategory {
  groups: ServiceGroup[]
}

const opdServices: { [key: string]: OpdCategory } = {
  'Pemerintahan': {
    groups: [
      {
        title: 'Sekretariat Daerah',
        items: [
          { id: '1', icon: <FileText size={24} />, title: 'Dokumentasi Pimpinan', subtitle: 'KDP Kota Sukabumi', href: 'https://kdp.sukabumikota.go.id/' },
          { id: '2', icon: <Scale size={24} />, title: 'Bag. Hukum', subtitle: 'Jaringan Dokumentasi dan Informasi Hukum', href: 'https://jdih.sukabumikota.go.id/beranda' },
          { id: '3', icon: <BarChart3 size={24} />, title: 'Bag. Organisasi', subtitle: 'Halaman Informasi Penyelenggaraan Pelayanan Publik', href: 'https://bagianorganisasi.sukabumikota.go.id/' },
          {
            id: '4',
            icon: <ShoppingCart size={24} />,
            title: 'Bag. Pengadaan Barang dan Jasa',
            subtitle: 'siCAMPERENIK, SiRUP, LPSE',
            subItems: [
              { id: 'm1', title: 'siCAMPERENIK', subtitle: 'Sistem Informasi Pengadaan', href: 'https://bpbj.sukabumikota.go.id' },
              { id: 'm2', title: 'SiRUP', subtitle: 'Sistem Informasi Rencana Umum Pengadaan', href: 'https://sirup.inaproc.id/sirup/loginctr/index' },
              { id: 'm3', title: 'LPSE', subtitle: 'Layanan Pengadaan Secara Elektronik', href: 'https://lpse.jabarprov.go.id/' },
            ],
          },
        ]
      },
      {
        title: 'Sekretariat Dewan',
        items: [
          { id: '7', icon: <Users size={24} />, title: 'Portal DPRD', subtitle: 'DPRD Kota Sukabumi', href: '#' },
          { id: '8', icon: <FileText size={24} />, title: 'JDIH DPRD', subtitle: 'JDIH DPRD Kota Sukabumi', href: '#' },
        ]
      },
      {
        title: 'Perencanaan & Keuangan Daerah',
        items: [
          { id: '7', icon: <Users size={24} />, title: 'BAPPEDA', subtitle: 'Sipeka, E-Rida , SIVAKA, SIGENKO', href: '#' },
          { id: '8', icon: <FileText size={24} />, title: 'BPKBD', subtitle: 'Website, Pantas, Smartelok, dll', href: '#' },
        ]
      },

    ]
  },
  'Inspektorat': {
    groups: [
      {
        title: 'Pengawasan & Pengaduan',
        items: [
          { id: '1', icon: <Users size={24} />, title: 'Portal Inspektorat', subtitle: 'Inspektorat Kota Sukabumi', href: 'https://inspektorat.sukabumikota.go.id' },
          { id: '2', icon: <FileText size={24} />, title: 'WBS', subtitle: 'Layanan Pengaduan dan Konsultasi Aparatur dan Masyarakat', href: 'https://layanan.sukabumikota.go.id' },
        ]
      }
    ]
  },
  'Kependudukan & Perizinan': {
    groups: [
      {
        title: 'DISDUKCAPIL',
        items: [
          { id: '1', icon: <Scale size={24} />, title: 'JDIH Kota Sukabumi', subtitle: 'Jaringan Dokumentasi Hukum', href: '#' },
          { id: '2', icon: <Eye size={24} />, title: 'Informasi Publik', subtitle: 'Portal Keterbukaan Informasi Publik', href: '#' },
          { id: '3', icon: <FileText size={24} />, title: 'Konsultasi Hukum', subtitle: 'Layanan Konsultasi Legal', href: '#' },
        ]
      }
    ]
  },
  'Kesehatan': {
    groups: [
      {
        title: 'Kesehatan',
        items: [
          { id: '1', icon: <Heart size={24} />, title: 'Portal Kesehatan Sukabumi', subtitle: 'Informasi Layanan Kesehatan', href: '#' },
          { id: '2', icon: <Activity size={24} />, title: 'Vaksinasi Online', subtitle: 'Pendaftaran dan Info Vaksinasi', href: '#' },
          { id: '3', icon: <Stethoscope size={24} />, title: 'Puskesmas Digital', subtitle: 'Lokasi dan Layanan Puskesmas', href: '#' },
          { id: '4', icon: <AlertCircle size={24} />, title: 'Monitoring Penyakit', subtitle: 'Data Epidemiologi Daerah', href: '#' },
        ]
      }
    ]
  },
  'Pendidikan': {
    groups: [
      {
        title: 'Pendidikan',
        items: [
          { id: '1', icon: <BookOpen size={24} />, title: 'Portal Pendidikan Sukabumi', subtitle: 'Informasi Layanan Pendidikan', href: '#' },
          { id: '2', icon: <GraduationCap size={24} />, title: 'PPDB Online', subtitle: 'Penerimaan Peserta Didik Baru', href: '#' },
          { id: '3', icon: <Users size={24} />, title: 'e-Learning Sukabumi', subtitle: 'Platform Pembelajaran Digital', href: '#' },
        ]
      }
    ]
  },
  'Daerah Kecamatan': {
    groups: [
      {
        title: 'Wilayah Administrasi Kecamatan',
        items: [
          { id: '1', icon: <MapPin size={24} />, title: 'Kecamatan Baros', subtitle: 'Website Kec. Baros', href: 'https://kecamatanbaros.sukabumikota.go.id' },
          { id: '2', icon: <MapPin size={24} />, title: 'Kecamatan Cibeureum', subtitle: 'Website Kec. Cibeureum', href: 'https://kecamatancibeureum.sukabumikota.go.id' },
          {
            id: '3', icon: <MapPin size={24} />, title: 'Kecamatan Cikole', subtitle: 'Web kec. Cikole, Kel. Cisarua, Kel. Selabatu', subItems: [
              { id: 'm1', title: 'Website Kec. Cikole', subtitle: 'Website Kec. Cikole', href: 'https://kecamatancikole.sukabumikota.go.id/' },
              { id: 'm2', title: 'Kelurahan Cisarua', subtitle: 'web perpustakaan', href: 'https://perpuscisarua.sukabumikota.go.id/' },
              { id: 'm3', title: 'Kelurahan Selabatu', subtitle: 'web Kel. Selabatu', href: 'https://kelurahanselabatu.sukabumikota.go.id' }
            ]
          },
          { id: '4', icon: <MapPin size={24} />, title: 'Kecamatan Citamiang', subtitle: 'Website Kec. Citamiang', href: 'https://kecamatancitamiang.sukabumikota.go.id/' },
          {
            id: '5', icon: <MapPin size={24} />, title: 'Kecamatan Gunungpuyuh', subtitle: 'Web Kec. Gunungpuyuh, Kel. Gunungpuyuh, Kel. Karamat, Kel. Karangtengah',
            subItems: [
              { id: 'm1', title: 'Website Kec. Gunungpuyuh', subtitle: 'Website Kec. Gunungpuyuh', href: 'https://kecamatangunungpuyuh.sukabumikota.go.id/' },
              { id: 'm2', title: 'Kelurahan Gunungpuyuh', subtitle: 'web Kel. Gunungpuyuh', href: 'https://kelurahangunungpuyuh.sukabumikota.go.id/' },
              { id: 'm3', title: 'Kelurahan Karamat', subtitle: 'web Kel. Karamat', href: 'https://kelurahankaramat.sukabumikota.go.id/' },
              { id: 'm4', title: 'Kelurahan Karangtengah', subtitle: 'web Kel. Karangtengah', href: 'https://kelurahankarangtengah.sukabumikota.go.id/' }
            ]
          },
          { id: '6', icon: <MapPin size={24} />, title: 'Kecamatan Lembursitu', subtitle: 'Website Kec. Lembursitu', href: 'https://kecamatanlembursitu.sukabumikota.go.id/' },
          { id: '7', icon: <MapPin size={24} />, title: 'Kecamatan Warudoyong', subtitle: 'Website Kec. Warudoyong', href: 'https://kecamatanwarudoyong.sukabumikota.go.id' },
        ]
      }
    ]
  },
}

function Opd() {
  const [activeCategory, setActiveCategory] = useState('Pemerintahan')
  const [cardPage, setCardPage] = useState(0)
  const cardsPerPage = 6

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModalData, setSelectedModalData] = useState<SubItem[]>([])
  const [selectedModalTitle, setSelectedModalTitle] = useState('')
  const [modalPage, setModalPage] = useState(0)
  const cardsPerModalPage = 4

  const categoryData = opdServices[activeCategory]

  // Process groups into pages with strict subheading separation
  const processedPages: Array<{
    title: string
    items: any[]
    groupIndex: number
  }> = []

  if (categoryData?.groups) {
    categoryData.groups.forEach((group, groupIndex) => {
      const groupItems = group.items || []

      // Chunk the group items into pages of max cardsPerPage
      for (let i = 0; i < groupItems.length; i += cardsPerPage) {
        const chunk = groupItems.slice(i, i + cardsPerPage)
        processedPages.push({
          title: group.title,
          items: chunk,
          groupIndex
        })
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

  const openModal = (service: ServiceCard) => {
    setSelectedModalData(service.subItems || [])
    setSelectedModalTitle(service.title)
    setModalPage(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Modal pagination
  const totalModalPages = Math.ceil(selectedModalData.length / cardsPerModalPage)
  const currentModalItems = selectedModalData.slice(
    modalPage * cardsPerModalPage,
    (modalPage + 1) * cardsPerModalPage
  )

  return (
    <>
      <section id="opd" className="bg-white px-4 py-20 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading subtitle="Akses langsung ke portal resmi Organisasi Perangkat Daerah (OPD) dan wilayah administratif Kecamatan di lingkungan Pemerintah Kota Sukabumi.">
            Organisasi Perangkat Daerah
          </SectionHeading>
          <div className="flex min-h-[500px] overflow-hidden rounded-xl border border-[#e2e8ed] bg-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.5)]">
            {/* Sidebar */}
            <div className="flex w-full flex-col space-y-1 md:w-[28%] border-r border-[#e2e8ed]">
              {Object.keys(opdServices).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`flex flex-1 items-center border-l-4 px-6 py-3 text-left font-medium transition ${activeCategory === category
                    ? 'border-[#16a34a] bg-[#edfff2] text-[#138d43]'
                    : 'border-transparent text-[#53627a] hover:bg-[#f7faf8]'
                    }`}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right Content - Service Cards */}
            <div className="hidden flex-1 flex-col p-8 md:flex min-h-[520px]">
              {/* Animated Content Wrapper */}
              <div
                key={`page-${activeCategory}-${cardPage}`}
                className="flex flex-1 flex-col animate-[fadeInUp_0.5s_ease-out]"
              >
                {/* Dynamic Heading */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-[#1b293c]">{currentPage.title}</h3>
                  <p className="text-sm text-[#66758a] mt-1">{activeCategory}</p>
                </div>

                {/* Service Cards Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 content-start">
                    {currentPage.items.map((service: ServiceCard) => {
                      const cardClasses = "flex cursor-pointer items-center gap-4 rounded-lg border border-[#e5ebf0] bg-white p-4 transition-all duration-200 hover:border-green-200 hover:bg-slate-50 hover:shadow-md w-full text-left"
                      const inner = (
                        <>
                          {/* Icon */}
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#16a34a]">
                            {service.icon}
                          </div>
                          {/* Title & Subtitle */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[#1b293c]">{service.title}</h4>
                            <p className="text-sm text-[#66758a]">{service.subtitle}</p>
                          </div>
                          {/* Chevron */}
                          <ChevronRight size={20} className="shrink-0 text-[#cbd5e1]" />
                        </>
                      )

                      if (service.subItems && service.subItems.length > 0) {
                        return (
                          <button
                            key={service.id}
                            onClick={() => openModal(service)}
                            className={cardClasses}
                          >
                            {inner}
                          </button>
                        )
                      }

                      return (
                        <a
                          key={service.id}
                          href={service.href || '#'}
                          target={service.href && service.href !== '#' ? '_blank' : undefined}
                          rel={service.href && service.href !== '#' ? 'noopener noreferrer' : undefined}
                          className={cardClasses}
                        >
                          {inner}
                        </a>
                      )
                    })}
                  </div>
                </div>

                {/* Pagination Controls */}
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
                          className={`rounded-full transition-all duration-200 ${index === cardPage
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

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-[#e5ebf0] text-[#66758a] hover:bg-slate-100 hover:text-[#1b293c] transition"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-10">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-6 w-1 rounded-full bg-[#159447]" />
                <h2 id="modal-title" className="text-xl font-bold text-[#1b293c]">{selectedModalTitle}</h2>
              </div>
              <p className="text-sm text-[#66758a] ml-4">Pilih layanan yang tersedia</p>
            </div>

            {/* Modal Cards Grid + Pagination — min-h keeps layout stable */}
            <div className="flex flex-col min-h-[260px]">
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                  {currentModalItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.href !== '#' ? '_blank' : undefined}
                      rel={item.href !== '#' ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-4 rounded-lg border border-[#e5ebf0] bg-[#f8fafc] p-4 transition-all duration-200 hover:border-green-200 hover:bg-[#f0fdf4] hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-[#e5ebf0] text-[#16a34a] shadow-sm">
                        <ShoppingCart size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1b293c]">{item.title}</h4>
                        <p className="text-xs text-[#66758a] leading-snug mt-0.5">{item.subtitle}</p>
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-[#cbd5e1]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Modal Pagination */}
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
                        className={`rounded-full transition-all duration-200 ${index === modalPage
                          ? 'w-4 h-3 bg-[#159447] cursor-default'
                          : 'size-3 bg-[#cbd5e1] cursor-pointer hover:bg-slate-400'
                          }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setModalPage((p) => Math.min(totalModalPages - 1, p + 1))}
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
    </>
  )
}

// Custom X (Twitter) Logo Component
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.73-8.835L1.08 2.25h6.82l4.713 6.231 5.45-6.231zM17.552 20.522h1.833L6.281 4.09H4.33l13.222 16.432z" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.63c-.79.297-1.427.772-1.944 1.289-.517.517-.992 1.155-1.289 1.944-.297.788-.498 1.658-.56 2.936C.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.062 1.278.263 2.148.56 2.936.297.788.772 1.427 1.289 1.944.517.517 1.155.992 1.944 1.289.788.297 1.658.498 2.936.56 1.28.057 1.687.072 4.947.072s3.667-.015 4.947-.072c1.280-.062 2.149-.263 2.937-.56.788-.297 1.426-.772 1.944-1.289.517-.517.992-1.155 1.289-1.944.297-.788.498-1.658.56-2.936.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.062-1.280-.263-2.149-.56-2.937-.297-.788-.772-1.426-1.289-1.944-.517-.517-1.155-.992-1.944-1.289-.788-.297-1.658-.498-2.937-.56C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.07 1.171.054 1.805.244 2.227.408.56.217.96.477 1.382.896.419.42.679.822.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.646.07 4.849 0 3.204-.009 3.586-.07 4.849-.054 1.171-.244 1.806-.408 2.228-.217.56-.477.96-.896 1.382-.42.419-.822.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.646.07-4.849.07-3.204 0-3.586-.009-4.849-.07-1.171-.054-1.806-.244-2.228-.408-.56-.217-.96-.477-1.382-.896-.419-.42-.679-.822-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.646-.07-4.849 0-3.204.009-3.586.07-4.849.054-1.171.244-1.806.408-2.228.217-.56.477-.96.896-1.382.42-.419.822-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.646-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
    </svg>
  )
}

function YoutubeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function Footer() {
  return (
    <footer id="footer" className="border-t-4 border-[#159447] bg-[#17253a] px-4 py-16 text-white md:px-8 lg:px-12 relative overflow-hidden">
      {/* Dotted background pattern */}
      <div className="footer-dots absolute inset-0 pointer-events-none opacity-100" />

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold">KONTAK</h3>
            <a
              href="https://diskominfo.sukabumikota.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img src="/images/Diskominfo.webp" alt="Diskominfo Logo" className="mt-8 h-auto w-74" />
            </a>
            <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-white/80">
              <a
                href="https://maps.app.goo.gl/CmbbaNogyg1h8DBA7"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-start gap-3"
              >
                <MapPin className="shrink-0 text-[#f04c71] group-hover:text-green-400 transition-colors mt-1" />
                <span>Alamat : Jl. R. Syamsudin, SH No.25, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113</span>
              </a>
              <a
                href="tel:+6226620229715"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Phone className="shrink-0 text-[#e8468a] group-hover:text-green-400 transition-colors" />
                <span>Telp : +62 (266) 20229715</span>
              </a>
              <a
                href="mailto:diskominfo@sukabumikota.go.id"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Mail className="shrink-0 text-[#e9c9eb] group-hover:text-green-400 transition-colors" />
                <span>Email : diskominfo@sukabumikota.go.id</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">TAUTAN TERKAIT</h3>
            <div className="mt-8 flex flex-col gap-5 text-white/80">
              <a
                href="https://lpse.jabarprov.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3">Layanan Pengadaan LPSE</a>
              <a href="https://ppid.sukabumikota.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >Layanan Informasi Publik (PPID)</a>
              <a href="https://jdih.sukabumikota.go.id/beranda"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3">Layanan Informasi Hukum (JDIH)</a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">STANDAR PROTOKOL</h3>
            <a
              href="https://www.immuniweb.com/ssl/diskominfo.sukabumikota.go.id/nZuRpnLm/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img src="/images/ImmuniWeb.webp" alt="ImmuniWeb Logo" className="mt-8 h-auto w-70" />
            </a>
          </div>
          <div>
            <h3 className="text-lg font-bold">MEDIA SOSIAL</h3>
            <div className="mt-8 flex gap-4">
              <a
                href="https://www.facebook.com/kotasukabumi.id?locale=id_ID"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <FacebookLogo />
              </a>
              <a
                href="https://x.com/Pemkot_Sukabumi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <XLogo />
              </a>
              <a
                href="https://www.instagram.com/pemkotsukabumi_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <InstagramLogo />
              </a>
              <a
                href="https://www.youtube.com/@pemerintahkotasukabumi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <YoutubeLogo />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-[1400px] border-t border-white/15 pt-8 text-center text-sm text-white/80">Copyright © 2026 Website Resmi Pemerintah Kota Sukabumi</div>
      </div>
    </footer>
  )
}

function Partners() {
  return (
    <section className="bg-[#F8F6F0] py-12 md:py-16 border-t border-[#e5ebf0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12">
          <img
            src="/images/Lambang_Kota_Sukabumi.png"
            className="h-16 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />
          <img
            src="/images/diskominfo-hitam.png"
            className="h-16 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />
          <img
            src="/images/Span-Lapor.png"
            className="h-16 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />

          {/* TODO: Ganti src dengan path gambar Logo Partner 4 */}
          <img
            // src="/logo-4.png"
            // alt="Logo Partner 4"
            className="h-16 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
      </div>
    </section>
  )
}

export default function Page() { return <main className="min-h-screen bg-white"><Navbar /><Hero /><Welcome /><Profile /><News /><Opd /><Partners /><Footer /></main> }
