'use client'

import { useState, useEffect, useRef } from 'react'
import {
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
} from 'lucide-react'

const profileCards = [
  { title: 'Sejarah', description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa.', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80' },
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

const opd = ['Pemerintahan', 'Kependudukan & Perizinan', 'Hukum dan transparansi', 'Kesehatan', 'Pendidikan', 'Daerah Kecamatan']

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

function Welcome() { return <section className="bg-white px-4 py-20 md:px-8 lg:px-12 md:py-28"><div className="mx-auto flex max-w-[1400px] flex-col items-center gap-12 lg:flex-row lg:gap-16"><article className="max-w-[390px] rounded-3xl bg-[#eff4f8] p-8 shadow-sm md:p-10"><h2 className="text-3xl font-bold leading-tight text-[#ba8500]">Reugreug Pageuh Repeh Rapih</h2><p className="mt-6 text-lg leading-relaxed text-[#29364a]">Untuk mewujudkan masyarakat yang reugreug harinya, harus dipegang pageuh norma dan kebiasaan saling menghormati, tepa selira, dan toleran agar kehidupan masyarakat menjadi répeh, tidak dipenuhi oleh bentakan dan hentakkan, sebuah masyarakat yang mempertontonkan rapih dan saling memuliakan.</p></article><div className="flex flex-1 items-end justify-center gap-0"><div className="relative z-10 w-1/2 max-w-[300px] self-end"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80" className="w-full grayscale" alt="Pemimpin daerah" /></div><div className="relative w-1/2 max-w-[300px] self-end"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80&sat=-100" className="w-full scale-x-[-1] grayscale" alt="Wakil pemimpin daerah" /></div><div className="ml-10 hidden max-w-[270px] md:block"><p className="font-serif text-4xl italic text-[#516076]">Sukabumi</p><p className="text-5xl font-black tracking-tight text-[#18243b]"><span className="text-[#f29b10]">M</span>UBARAKAH</p><p className="mt-3 font-bold tracking-[0.22em] text-[#62738c]">MAJU, UNGGUL, BERBUDAYA &amp; BERKAH</p></div></div></div></section> }

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

function Opd() { const [active, setActive] = useState(3); return <section id="opd" className="bg-white px-4 py-20 md:px-8 lg:px-12"><div className="mx-auto max-w-[1400px]"><SectionHeading subtitle="Akses langsung ke portal resmi Organisasi Perangkat Daerah (OPD) dan wilayah administratif Kecamatan di lingkungan Pemerintah Kota Sukabumi.">Organisasi Perangkat Daerah</SectionHeading><div className="flex min-h-[380px] overflow-hidden rounded-3xl border border-[#e2e8ed] bg-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.5)]"><div className="flex w-full flex-col md:w-[31%]">{opd.map((name, index) => <button key={name} onClick={() => setActive(index)} className={`flex flex-1 items-center border-l-4 px-8 text-left text-lg transition ${active === index ? 'border-[#16a34a] bg-[#edfff2] font-bold text-[#138d43]' : 'border-transparent text-[#53627a] hover:bg-[#f7faf8]'}`} aria-pressed={active === index}>{name}</button>)}</div><div className="relative hidden flex-1 flex-col justify-end border-l border-[#e8edf2] p-9 md:flex"><div className="mb-5 border-b border-[#e5ebf0] pb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#159447]">Portal layanan</p><h3 className="mt-3 text-4xl font-bold text-[#1b293c]">{opd[active]}</h3><p className="mt-4 max-w-xl text-lg leading-relaxed text-[#66758a]">Temukan informasi, layanan, dan kanal resmi Pemerintah Kota Sukabumi untuk kebutuhan masyarakat.</p></div><div className="flex items-center justify-center gap-4"><button onClick={() => setActive((active - 1 + opd.length) % opd.length)} className="z-20 grid size-11 place-items-center rounded-full border border-[#d5dfe8] bg-white text-[#cbd5e1] hover:text-[#159447]" aria-label="OPD sebelumnya"><ArrowLeft /></button><div className="flex gap-2">{opd.slice(0, 2).map((_, index) => <span key={index} className={`size-3 rounded-full ${index === active % 2 ? 'bg-[#159447]' : 'bg-[#cbd5e1]'}`} />)}</div><button onClick={() => setActive((active + 1) % opd.length)} className="z-20 grid size-11 place-items-center rounded-full border border-[#c4d2df] bg-white text-[#26354a] hover:text-[#159447]" aria-label="OPD berikutnya"><ArrowRight /></button></div></div></div></div></section> }

function Footer() { return <footer id="footer" className="border-t-4 border-[#159447] bg-[#17253a] px-4 py-16 text-white md:px-8 lg:px-12"><div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-4"><div><h3 className="text-lg font-bold">KONTAK</h3><p className="mt-8 text-4xl font-black italic text-[#f3911b]">diskominfo<span className="text-[#10a4d9]">_</span></p><div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-white/80"><p className="flex gap-3"><MapPin className="shrink-0 text-[#f04c71]" />Alamat : Jl. R. Syamsudin, SH No.25, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113</p><p className="flex gap-3"><Phone className="shrink-0 text-[#e8468a]" />Telp : +62 (266) 20229715</p><p className="flex gap-3"><Mail className="shrink-0 text-[#e9c9eb]" />Email : diskominfo@sukabumikota.go.id</p></div></div><div><h3 className="text-lg font-bold">TAUTAN TERKAIT</h3><div className="mt-8 flex flex-col gap-5 text-white/80"><a href="#footer">Layanan Pengadaan LPSE</a><a href="#footer">Layanan Informasi Publik (PPID)</a><a href="#footer">Layanan Informasi Hukum (JDIH)</a></div></div><div><h3 className="text-lg font-bold">STANDAR PROTOKOL</h3><p className="mt-10 text-3xl font-black text-[#ef3030]">Immuni<span className="text-[#1593d4]">Web</span><sup>®</sup></p><p className="text-sm font-semibold text-white/50">AI for Application Security</p></div><div><h3 className="text-lg font-bold">MEDIA SOSIAL</h3><div className="mt-8 flex gap-4"><a href="#footer" aria-label="Facebook" className="grid size-12 place-items-center rounded-2xl bg-white text-[#12623d]"><CircleUserRound /></a><a href="#footer" aria-label="Instagram" className="grid size-12 place-items-center rounded-2xl bg-white text-[#12623d]"><Camera /></a><a href="#footer" aria-label="Youtube" className="grid size-12 place-items-center rounded-2xl bg-white text-[#12623d]"><Play /></a></div></div></div><div className="mx-auto mt-14 max-w-[1400px] border-t border-white/15 pt-8 text-center text-sm text-white/80">© 2026 Pemerintah Kota Sukabumi. Semua Hak Dilindungi.</div></footer> }

export default function Page() { return <main className="min-h-screen bg-white"><Navbar /><Hero /><Welcome /><Profile /><News /><Opd /><Footer /></main> }
