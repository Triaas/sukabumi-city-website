'use client'

import Link from 'next/link'
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
  Megaphone,
  Play,
  X,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react'

const profileCards = [
  { title: 'Sejarah', description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa.', image: '/images/sejarah-card.jpg', href: '/sejarah' },
  { title: 'Visi Misi', description: 'Arah pembangunan dan tujuan yang ingin dicapai.', image: '/images/visi misi-card.jpg', href: '/visi-misi' },
  { title: 'Lambang', description: 'Makna filosofis di balik lambang resmi daerah.', image: '/images/logo-pemkoot-sukabumi-card.jpg', href: '/lambang' },
  { title: 'Geografi dan Demografi', description: 'Letak wilayah, kondisi geografis, serta demografi Kota Sukabumi.', image: '/images/geo-card.jpg', href: '/geografi' },
  { title: 'Sosial Ekonomi', description: 'Kondisi demografi dan pergerakan ekonomi masyarakat.', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80', href: '/sosial-ekonomi' },
  { title: 'Dalam Angka', description: 'Data statistik dan indikator kinerja daerah.', image: '/images/dalam angka-card.jpg', href: '/dalam-angka' },
  { title: 'Unit Kesehatan Sekolah (UKS)', description: 'Program pembinaan kesehatan komprehensif di lingkungan sekolah.', image: '/images/UKS-card.jpg', href: '/uks' },
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

function Hero() {
  const images = ['/images/lapang-merdeka.webp', '/images/tugu-kota.webp', '/images/gedung_juang.webp']
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section id="beranda" className="relative flex h-screen min-h-[650px] items-end overflow-hidden bg-[#0c1d26] pt-36 pb-20 md:pt-44 md:pb-28">
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
            Bersama mewujudkan Masyarakat Kota Sukabumi yang Inovatif, Mandiri, Agamis, Nasionalis.
          </p>
        </div>
      </div>
    </section>
  )
}

function Welcome() {
  return (
    <section className="bg-white px-4 py-20 md:px-8 lg:px-12 md:py-28">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <article className="max-w-[390px] rounded-3xl bg-[#eff4f8] p-8 shadow-sm md:p-10">
          <h2 className="text-3xl font-bold leading-tight text-[#ba8500]">
            Reugreug Pageuh Repeh Rapih
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#29364a]">
            Untuk mewujudkan masyarakat yang reugreug harinya, harus dipegang pageuh norma dan kebiasaan saling menghormati, tepa selira, dan toleran agar kehidupan masyarakat menjadi répeh, tidak dipenuhi oleh bentakan dan hentakkan, sebuah masyarakat yang mempertontonkan rapih dan saling memuliakan.
          </p>
        </article>

        <div className="flex flex-1 items-end justify-center gap-0">
          <div className="relative z-10 w-full max-w-[500px] self-end">
            <img
              src="/images/foto walikota dan wakil walikota.webp"
              className="w-full"
              alt="Walikota dan Wakil Walikota Sukabumi"
            />
          </div>
          <div className="ml-10 hidden max-w-[270px] md:block">
            <p className="font-serif text-4xl italic text-[#516076]">Sukabumi</p>
            <p className="text-5xl font-black tracking-tight text-[#18243b]">
              <span className="text-[#f29b10]">M</span>UBARAKAH
            </p>
            <p className="mt-3 font-bold tracking-[0.22em] text-[#62738c]">
              MAJU, UNGGUL, BERBUDAYA &amp; BERKAH
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Profile() {
  return (
    <section id="profil" className="bg-slate-50 px-4 py-20 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading subtitle="Mengenal lebih dekat sejarah, visi misi, dan berbagai aspek penting lainnya dari Kota Sukabumi.">
          Profil Kota Sukabumi
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
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">{card.description}</p>
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
                <p className="mt-1 text-xs md:text-sm leading-snug text-white/85">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsList({ items, announcement = false }: { items: string[][]; announcement?: boolean }) { return <div className="flex flex-col gap-6">{items.map(([title, date, category]) => <article key={title} className="flex gap-5"><div className={`grid size-20 shrink-0 place-items-center rounded-lg ${announcement ? 'bg-[#eff4f8] text-[#f29b10]' : 'bg-[#d6d6d6] text-xs text-black'}`}>{announcement ? <Megaphone /> : 'img'}</div><div><h3 className="text-base font-bold leading-tight text-[#1d293d]">{title}</h3><p className="mt-1 text-sm text-[#687991]">{date} <span className="text-[#159447]">•</span> {category}</p></div></article>)}</div> }

function News() {
  return <section id="berita" className="bg-white px-4 py-20 md:px-8 lg:px-12">
    <div className="mx-auto max-w-[1400px]">
      <SectionHeading subtitle="Pengumuman dan berita terbaru dari Kota Sukabumi.">
        Pengumuman & Berita
      </SectionHeading>
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <h3 className="mb-6 text-2xl font-bold text-[#263349]">Pengumuman</h3>
          <div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" />
          <NewsList items={announcements} announcement />
          <a className="mt-8 inline-flex items-center gap-2 font-bold text-[#138c44]"
            href="https://portal.sukabumikota.go.id/category/pengumuman/">
            Lihat Semua <ArrowRight size={18} /></a>
        </div>
        <div>
          <h3 className="mb-6 text-2xl font-bold text-[#263349]">Berita</h3>
          <div className="mb-7 h-1 w-14 rounded-full bg-[#f4c13b]" />
          <NewsList items={news} /><a className="mt-8 inline-flex items-center gap-2 font-bold text-[#138c44]" href="https://portal.sukabumikota.go.id/category/berita-kota/">Lihat Semua <ArrowRight size={18} /></a>
        </div>
      </div>
    </div>
  </section>
}

interface SubItem {
  id: string
  image?: string
  title: string
  subtitle: string
  href?: string
  subItems?: SubItem[]
}

interface ServiceCard {
  id: string
  icon?: React.ReactNode
  image?: string
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
  'Sekretariat Daerah': {
    groups: [
      {
        title: 'Sekretariat Daerah',
        items: [
          { id: '1', image: '/images/dokpim.png', title: 'Dokumentasi Pimpinan', subtitle: 'KDP Kota Sukabumi', href: 'https://kdp.sukabumikota.go.id/' },
          { id: '2', image: '/images/JDIH-logo.png', title: 'Bag. Hukum', subtitle: 'Jaringan Dokumentasi dan Informasi Hukum', href: 'https://jdih.sukabumikota.go.id/beranda' },
          { id: '3', image: '/images/Logo_BagianOrganisasi.png', title: 'Bag. Organisasi', subtitle: 'Halaman Informasi Penyelenggaraan Pelayanan Publik', href: 'https://bagianorganisasi.sukabumikota.go.id/' },
          {
            id: '4',
            image: '/images/Lambang_Kota_Sukabumi.png',
            title: 'Bag. Pengadaan Barang dan Jasa',
            subtitle: 'siCAMPERENIK, SiRUP, LPSE',
            subItems: [
              { id: 'm1', image: '/images/Lambang_Kota_Sukabumi.png', title: 'siCAMPERENIK', subtitle: 'Sistem Informasi Pengadaan', href: 'https://bpbj.sukabumikota.go.id' },
              { id: 'm2', image: '/images/Sirup-logo.png', title: 'SiRUP', subtitle: 'Sistem Informasi Rencana Umum Pengadaan', href: 'https://sirup.inaproc.id/sirup/loginctr/index' },
              { id: 'm3', image: '/images/LPSE-logo.png', title: 'LPSE', subtitle: 'Layanan Pengadaan Secara Elektronik', href: 'https://lpse.jabarprov.go.id/' },
            ],
          },
        ]
      },
      // {
      //   title: 'Perencanaan & Aparatur Daerah',
      //   items: [
      //     
      //       ]
      //     },
      //   ]
      // },
      // {
      //   title: 'Informasi & Kesatuan Bangsa',
      //   items: [
      //     
      //     { id: '10', image: '/images/Bakesbangpol-logo.png', title: 'Bakesbangpol', subtitle: 'Portal Bakesbangpol Kota Sukabumi', href: 'https://kesbangpol.sukabumikota.go.id/' },
      //   ]
      // }
    ]
  },
  'Sekretariat Dewan': {
    groups: [
      {
        title: 'Sekretariat Dewan',
        items: [
          { id: '5', image: '/images/LOGO-DPRD-KOTA-SUKABUMI.png', title: 'Portal DPRD', subtitle: 'DPRD Kota Sukabumi', href: 'https://dprd.sukabumikota.go.id/' },
          { id: '6', image: '/images/LOGO-DPRD-KOTA-SUKABUMI.png', title: 'JDIH DPRD', subtitle: 'JDIH DPRD Kota Sukabumi', href: 'https://jdih-dprd.sukabumikota.go.id/' },
        ]
      }

    ]
  },
  'Inspektorat': {
    groups: [
      {
        title: 'Inspektorat',
        items: [
          { id: '1', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Portal Inspektorat', subtitle: 'Inspektorat Kota Sukabumi', href: 'https://inspektorat.sukabumikota.go.id' },
          { id: '2', image: '/images/Lambang_Kota_Sukabumi.png', title: 'WBS', subtitle: 'Layanan Pengaduan dan Konsultasi Aparatur dan Masyarakat', href: 'https://layanan.sukabumikota.go.id' },
        ]
      },
    ]
  },
  'Badan': {
    groups: [
      {
        title: 'Badan',
        items: [
          {
            id: '7', image: '/images/BAPPEDA-logo.png', title: 'BAPPEDA', subtitle: 'SIPEKA, E-Rida , SIVAKA, SIGENKO',
            subItems: [
              { id: 'm4', image: '/images/BAPPEDA-logo.png', title: 'SIPEKA', subtitle: 'Sistem Informasi Pengendalian dan Evaluasi Kinerja', href: 'https://sipeka.sukabumikota.go.id/app/sampeu/login/' },
              { id: 'm5', image: '/images/erida.png', title: 'E-Rida', subtitle: 'Elektronik Riset dan Inovasi Daerah', href: 'https://e-rida.sukabumikota.go.id/' },
              { id: 'm6', image: '/images/sivaka-logo.png', title: 'SIVAKA', subtitle: 'Sistem Informasi Verifikasi Anggaran Kota Sukabumi', href: 'https://sivaka.sukabumikota.go.id/' },
              { id: 'm7', image: '/images/BAPPEDA-logo.png', title: 'SIGENKO', subtitle: 'Sistem Informasi Geografis Kota', href: 'https://geoinfo.sukabumikota.go.id/' },
            ]
          },
          { id: '10', image: '/images/Bakesbangpol-logo.png', title: 'Bakesbangpol', subtitle: 'Portal Bakesbangpol Kota Sukabumi', href: 'https://kesbangpol.sukabumikota.go.id/' },
          {
            id: '8', image: '/images/BKPSDM-logo.png', title: 'BKPSDM', subtitle: 'Portal BKPSDM, Simpeg, SimpegIntegrasi, SiCantik',
            subItems: [
              { id: 'm8', image: '/images/BKPSDM-logo.png', title: 'Portal BKPSDM', subtitle: 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', href: 'https://bkpsdm.sukabumikota.go.id/' },
              { id: 'm9', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Simpeg', subtitle: 'Sistem Informasi Kepegawaian', href: 'https://simpeg.sukabumikota.go.id/' },
              { id: 'm10', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Simpegintegrasi', subtitle: 'Sistem Informasi Kepegawaian integrasi', href: 'https://simpegintegrasi.sukabumikota.go.id/login' },
              { id: 'm11', image: '/images/Lambang_Kota_Sukabumi.png', title: 'SiCantik', subtitle: 'Sistem Catatan Kinerja Elektronik', href: 'https://sicantik.sukabumikota.go.id/' }
            ]
          },
          {
            id: '2', image: '/images/BPBD-logo.png', title: 'BPBD', subtitle: 'portal BPBD Kota Sukabumi, SiEdan',
            subItems: [
              { id: 'm1', image: '/images/BPBD-logo.png', title: 'Portal BPBD Kota Sukabumi', subtitle: 'Badan Penanggulangan Bencana Daerah', href: 'https://bpbd.sukabumikota.go.id/' },
              { id: 'm2', image: '/images/BPBD-logo.png', title: 'SiEdan', subtitle: 'Sistem Informasi Kedaruratan Kota Sukabumi', href: 'https://siedan.sukabumikota.go.id/' }
            ]
          },
          {
            id: '1', image: '/images/bpkpd-logo.png', title: 'BPKPD', subtitle: 'Layanan BPKPD',
            subItems: [
              { id: 'm1', image: '/images/bpkpd-logo.png', title: 'Portal BPKPD', subtitle: 'Badan Pengelolaan Keuangan dan Pendapatan Daerah', href: 'https://bpkpd.sukabumikota.go.id/' },
              { id: 'm2', image: '/images/bpkpd-logo.png', title: 'Pantas', subtitle: 'Portal Pelayanan Pajak & Retribusi Daerah', href: 'https://pantas.sukabumikota.go.id/login' },
              { id: 'm3', image: '/images/smart_elok-logo.png', title: 'Smartelok', subtitle: 'Sistem Penerimaan Retribusi Elektronik', href: 'https://smartelok.sukabumikota.go.id/login' },
              { id: 'm4', image: '/images/sispeck-logo.png', title: 'Sispeck', subtitle: 'Sistem Informasi SPPT Cetak Elektronik', href: 'https://sispeck.sukabumikota.go.id/auth' },
              { id: 'm5', image: '/images/bpkpd-logo.png', title: 'BPHTB', subtitle: 'Bea Perolehan Hak atas Tanah dan Bangunan', href: 'https://bphtb.sukabumikota.go.id/bphtb/auth/login' },
              { id: 'm6', image: '/images/Spada-santun-logo.png', title: 'Spada Santun', subtitle: 'Sistem Informasi Kedaruratan Kota Sukabumi', href: 'https://spadasantun.sukabumikota.go.id/login' },
              { id: 'm7', image: '/images/bpkpd-logo.png', title: 'EIS', subtitle: 'Evaluasi Implementasi SIPP', href: 'https://eispantas.sukabumikota.go.id/' },
              { id: 'm8', image: '/images/bpkpd-logo.png', title: 'SIMASJELI', subtitle: 'Sistem Informasi Kedaruratan Kota Sukabumi', href: 'https://sekrebpkpd.sukabumikota.go.id/admin/login' },
              { id: 'm9', image: '/images/siadik-logo.png', title: 'SIADIK', subtitle: 'Sistem Arsip Digital Kuangan', href: 'https://siadik.sukabumikota.go.id/' },
              { id: 'm10', image: '/images/simonet-logo.png', title: 'SIMONET', subtitle: 'Sistem Informasi Monitoring Dana (BPKPD) Kota Sukabumi', href: 'https://simonet.sukabumikota.go.id/' },
              { id: 'm11', image: '/images/bpkpd-logo.png', title: 'SIMPPB', subtitle: ' Sistem Informasi Manajemen Pajak Bumi dan Bangunan', href: '#' }
            ]
          }

          // {
          //   id: '3', image:'/images/puskesmas-logo.png', title: 'Puskesmas', subtitle: 'Lokasi dan Layanan Puskesmas',
          //   subItems: [
          //     { id: 'm3', image:'/images/puskesmas-logo.png', title: 'Puskesmas Baros', subtitle: 'Portal Puskesmas Baros', href: 'https://puskesmasbaros.sukabumikota.go.id/' },
          //     { id: 'm4', image:'/images/puskesmas-logo.png', title: 'Puskesmas Benteng', subtitle: 'Portal Puskesmas Benteng', href: 'https://puskesmasbenteng.sukabumikota.go.id/' },
          //     { id: 'm5', image:'/images/puskesmas-logo.png', title: 'Puskesmas Cibeureum Hilir', subtitle: 'Profil Puskesmas Cibeureum Hilir', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-cibeureum-hilir' },
          //     { id: 'm6', image:'/images/puskesmas-logo.png', title: 'Puskesmas Cikundul', subtitle: 'Profil Puskesmas Cikundul', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-cikundul' },
          //     { id: 'm7', image:'/images/puskesmas-logo.png', title: 'Puskesmas Cipelang', subtitle: 'Portal Puskesmas Cipelang', href: 'https://puskesmascipelang.sukabumikota.go.id/' },
          //     { id: 'm8', image:'/images/puskesmas-logo.png', title: 'Puskesmas Gedongpanjang', subtitle: 'Profil Puskesmas Gedongpanjang', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-gedong-panjang' },
          //     { id: 'm9', image:'/images/puskesmas-logo.png', title: 'Puskesmas Karangtengah', subtitle: 'Profil Puskesmas Karangtengah', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-karangtengah' },
          //     { id: 'm10', image:'/images/puskesmas-logo.png', title: 'Puskesmas Lembursitu', subtitle: 'Profil Puskesmas Lembursitu', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-lembursitu' },
          //     
          //     { id: 'm12', image:'/images/puskesmas-logo.png', title: 'Puskesmas Nanggeleng', subtitle: 'Profil Puskesmas Nanggeleng', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-nanggeleng' },
          //     { id: 'm13', image:'/images/puskesmas-logo.png', title: 'Puskesmas Pabuaran', subtitle: 'Profil Puskesmas Pabuaran', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-pabuaran' },
          //     { id: 'm14', image:'/images/puskesmas-logo.png', title: 'Puskesmas Selabatu', subtitle: 'Portal Puskesmas Selabatu', href: 'https://puskesmasselabatu.sukabumikota.go.id/' },
          //     { id: 'm15', image:'/images/puskesmas-logo.png', title: 'Puskesmas Sukakarya', subtitle: 'Profil Puskesmas Sukakarya', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-sukakarya' },
          //   ]
          // },
        ]
      },
      {
        title: 'Sosial',
        items: [

        ]
      }
    ]
  },
  'Dinas': {
    groups: [
      {
        title: 'Dinas',
        items: [
          { id: '1', image: '/images/disnaker-logo.png', title: 'Disnaker', subtitle: 'Portal Dinas Ketenagakerjaan Kota Sukabumi', href: 'https://disnaker.sukabumikota.go.id/' },
          {
            id: '2', image: '/images/Diskumindag-logo.png', title: 'Diskumindag', subtitle: 'Portal Diskumindag Kota Sukabumi, Simpan UMKM',
            subItems: [
              { id: 'm1', image: '/images/Diskumindag-logo.png', title: 'Portal Diskumindag', subtitle: 'Dinas Koperasi, Usaha Mikro, Perindustrian dan Perdagangan', href: 'https://diskumindag.sukabumikota.go.id/' },
              { id: 'm2', image: '/images/Diskumindag-logo.png', title: 'Simpan UMKM', subtitle: 'Sistem Informasi Pendataan UMKM', href: 'https://dataumkm.sukabumikota.go.id/' }
            ]
          },
          { id: '3', image: '/images/dinsos-logo.png', title: 'Dinsos', subtitle: 'Portal Dinas Sosial Kota Sukabumi', href: 'https://dinsos.sukabumikota.go.id/' },
          {
            id: '4', image: '/images/dkp3-logo.png', title: 'DKP3', subtitle: 'Layanan Dinas Ketahanan Pangan, Pertanian, dan Perikanan',
            subItems: [
              { id: 'm12', image: '/images/dkp3-logo.png', title: 'Portal DKP3 Kota Sukabumi', subtitle: 'Dinas Ketahanan Pangan, Pertanian, dan Perikanan', href: 'https://distan.sukabumikota.go.id/' },
              { id: 'm13', image: '/images/pikachu-logo.png', title: 'Pikachu', subtitle: 'Perencanaan Terintegrasi Kepegawaian, Catatan Harian dan Umum', href: 'https://pikachu.sukabumikota.go.id/login.php' },
              { id: 'm14', image: '/images/Sipanda-logo.png', title: 'SIPANDA', subtitle: 'Sistem Informasi Pangan Daerah Kota Sukabumi', href: 'https://sipanda.sukabumikota.go.id/' },
              { id: 'm15', image: '/images/simpelkesrawan-logo.png', title: 'Simpel Kesrawan', subtitle: 'Sistem Informasi Pelayanan Kesehatan & Kesejahteraan Hewan', href: 'https://simpelkesrawan.sukabumikota.go.id/' },
              { id: 'm16', image: '/images/KAC-logo.png', title: 'KAC', subtitle: 'Kawasan Agroeduwisata Cikundul', href: 'https://kac.sukabumikota.go.id/' },
            ]
          },
          { id: '5', image: '/images/dispopapar-logo.png', title: 'Dispopapar', subtitle: 'Portal Dinas Olahraga dan Pariwisata Kota Sukabumi', href: 'https://disporapar.sukabumikota.go.id/' },
          {
            id: '1', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Dinkes', subtitle: 'Layanan Dinas Kesehatan Kota Sukabumi',
            subItems: [
              { id: 'm1', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Portal Dinkes Kota Sukabumi', subtitle: 'Dinas Kesehatan', href: 'https://dinkes.sukabumikota.go.id/' },
              {
                id: 'm2', image: '/images/puskesmas-logo.png', title: 'Puskesmas', subtitle: 'Daftar puskesmas di Kota Sukabumi', subItems: [
                  { id: 'm21', image: '/images/puskesmas-logo.png', title: 'Puskesmas Baros', subtitle: 'Portal Puskesmas Baros', href: 'https://puskesmasbaros.sukabumikota.go.id/' },
                  { id: 'm22', image: '/images/puskesmas-logo.png', title: 'Puskesmas Benteng', subtitle: 'Portal Puskesmas Benteng', href: 'https://puskesmasbenteng.sukabumikota.go.id/' },
                  { id: 'm25', image: '/images/puskesmas-logo.png', title: 'Puskesmas Cibeureum Hilir', subtitle: 'Profil Puskesmas Cibeureum Hilir', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-cibeureum-hilir' },
                  { id: 'm23', image: '/images/puskesmas-logo.png', title: 'Puskesmas Cipelang', subtitle: 'Portal Puskesmas Cipelang', href: 'https://puskesmascipelang.sukabumikota.go.id/' },
                  { id: 'm24', image: '/images/puskesmas-logo.png', title: 'Puskesmas Selabatu', subtitle: 'Portal Puskesmas Selabatu', href: 'https://puskesmasselabatu.sukabumikota.go.id/' },
                  { id: 'm26', image: '/images/puskesmas-logo.png', title: 'Puskesmas Cikole', subtitle: 'Profil Puskesmas Cikole', href: 'https://dinkes.sukabumikota.go.id/' },
                  { id: 'm27', image: '/images/puskesmas-logo.png', title: 'Puskesmas Citamiang', subtitle: 'Profil Puskesmas Citamiang', href: 'https://dinkes.sukabumikota.go.id/' },
                  { id: 'm28', image: '/images/puskesmas-logo.png', title: 'Puskesmas Lembursitu', subtitle: 'Profil Puskesmas Lembursitu', href: 'https://dinkes.sukabumikota.go.id/' },
                  { id: 'm11', image: '/images/puskesmas-logo.png', title: 'Puskesmas Limusnunggal', subtitle: 'Profil Puskesmas Limusnunggal', href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-limusnunggal' },
                  { id: 'm29', image: '/images/puskesmas-logo.png', title: 'Puskesmas Sukakarya', subtitle: 'Profil Puskesmas Sukakarya', href: 'https://dinkes.sukabumikota.go.id/' },
                ]
              }
            ]
          },
          {
            id: '2', image: '/images/Disdukcapil-logo.png', title: 'Disdukcapil', subtitle: 'Portal Disdukcapil, Moci Legit',
            subItems: [
              { id: 'm3', image: '/images/Disdukcapil-logo.png', title: 'Portal Disdukcapil', subtitle: 'Dinas Kependudukan dan Pencatatan Sipil', href: 'https://disdukcapil.sukabumikota.go.id/' },
              { id: 'm4', image: '/images/mocilegit-logo.png', title: 'Moci Legit', subtitle: 'Masyarakat kota Sukabumi Cepat, Terintegrasi, Lebih mudah, gratis, dan terpercaya', href: 'https://mocilegit.sukabumikota.go.id/login' }
            ]
          },
          {
            id: '9', image: '/images/diskominfo-hitam.png', title: 'Diskominfo', subtitle: 'Layanan Diskominfo Sukabumi',
            subItems: [
              { id: 'm12', image: '/images/diskominfo-hitam.png', title: 'Portal Diskominfo', subtitle: 'Portal Dinas Komunikasi dan Informatika', href: 'https://diskominfo.sukabumikota.go.id/' },
              { id: 'm13', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Simpan SPBE', subtitle: 'Sistem Manajemen Pengetahuan SPBE Kota Sukabumi', href: 'https://simpan-spbe.sukabumikota.go.id/' },
              { id: 'm14', image: '/images/diskominfo-hitam.png', title: 'SKM-Diskominfo', subtitle: 'Survei Kepuasan Masyarakat', href: 'http://skm-diskominfo.sukabumikota.go.id/survey' },
              { id: 'm15', image: '/images/diskominfo-hitam.png', title: 'Satu-Data', subtitle: 'pengelolaan dan berbagi pakai data antar Perangkat Daerah Kota Sukabumi', href: 'https://satudata.sukabumikota.go.id/login' },
              { id: 'm16', image: '/images/opendata-logo.png', title: 'Open Data', subtitle: 'koleksi dataset terlengkap di Kota Sukabumi', href: 'https://opendata.sukabumikota.go.id/' },
              { id: 'm17', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Data', subtitle: 'pengelolaan, perencanaan, dan pembagian data instansi', href: 'https://data.sukabumikota.go.id/login' },
              { id: 'm18', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Simponi', subtitle: 'Sistem Informasi Manajemen Pemerintahan Online', href: 'https://simponi.sukabumikota.go.id/' },
              { id: 'm19', image: '/images/PPID-logo.png', title: 'PPID', subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi', href: 'https://ppid.sukabumikota.go.id/' },
              { id: 'm20', image: '/images/diskominfo-hitam.png', title: 'Silantik', subtitle: 'Sistem Layanan TIK', href: 'https://diskominfo.sukabumikota.go.id/silantik/public/' },
            ]
          },
          {
            id: '1', image: '/images/DPMPTSP-logo.png', title: 'DPMPTSP', subtitle: 'Layanan DPMPTSP Kota Sukabumi',
            subItems: [
              { id: 'm1', image: '/images/DPMPTSP-logo.png', title: 'Portal MPP', subtitle: 'Mal Pelayanan Publik', href: 'https://mpp.sukabumikota.go.id/' },
              { id: 'm2', image: '/images/DPMPTSP-logo.png', title: 'Sakti', subtitle: 'Sistem Aplikasi Kolaborasi Antar Instansi', href: 'https://mpp.sukabumikota.go.id/sakti' }
            ]
          },
        ]
      },
    ]
  },
  'Daerah Kecamatan': {
    groups: [
      {
        title: 'Daerah Kecamatan',
        items: [
          { id: '3', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kecamatan Baros', subtitle: 'Website Kec. Baros', href: 'https://kecamatanbaros.sukabumikota.go.id' },
          { id: '4', image: '/images/CIBEUREUM-logo.png', title: 'Kecamatan Cibeureum', subtitle: 'Website Kec. Cibeureum', href: 'https://kecamatancibeureum.sukabumikota.go.id' },
          {
            id: '5', image: '/images/cikole-logo.png', title: 'Kecamatan Cikole', subtitle: 'Web kec. Cikole, Kel. Cisarua, Kel. Selabatu',
            subItems: [
              { id: 'm5', image: '/images/cikole-logo.png', title: 'Website Kec. Cikole', subtitle: 'Website Kec. Cikole', href: 'https://kecamatancikole.sukabumikota.go.id/' },
              { id: 'm6', image: '/images/perpuscisarua-logo.png', title: 'Kelurahan Cisarua', subtitle: 'web perpustakaan', href: 'https://perpuscisarua.sukabumikota.go.id/' },
              { id: 'm7', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kelurahan Selabatu', subtitle: 'web Kel. Selabatu', href: 'https://kelurahanselabatu.sukabumikota.go.id' }
            ]
          },
          { id: '6', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kecamatan Citamiang', subtitle: 'Website Kec. Citamiang', href: 'https://kecamatancitamiang.sukabumikota.go.id/' },
          {
            id: '7', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kecamatan Gunungpuyuh', subtitle: 'Web Kec. Gunungpuyuh, Kel. Gunungpuyuh, Kel. Karamat, Kel. Karangtengah',
            subItems: [
              { id: 'm8', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Website Kec. Gunungpuyuh', subtitle: 'Web Kec. Gunungpuyuh', href: 'https://kecamatangunungpuyuh.sukabumikota.go.id/' },
              { id: 'm9', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kelurahan Gunungpuyuh', subtitle: 'web Kel. Gunungpuyuh', href: 'https://kelurahangunungpuyuh.sukabumikota.go.id/' },
              { id: 'm10', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kelurahan Karamat', subtitle: 'web Kel. Karamat', href: 'https://kelurahankaramat.sukabumikota.go.id/' },
              { id: 'm11', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kelurahan Karangtengah', subtitle: 'web Kel. Karangtengah', href: 'https://kelurahankarangtengah.sukabumikota.go.id/' }
            ]
          },
          { id: '8', image: '/images/Lambang_Kota_Sukabumi.png', title: 'Kecamatan Lembursitu', subtitle: 'Website Kec. Lembursitu', href: 'https://kecamatanlembursitu.sukabumikota.go.id/' },
          { id: '9', image: '/images/warudoyong-logo.png', title: 'Kecamatan Warudoyong', subtitle: 'Website Kec. Warudoyong', href: 'https://kecamatanwarudoyong.sukabumikota.go.id' },
        ]
      }
    ]
  },
}

function Opd({ onIframeToggle }: { onIframeToggle?: (isOpen: boolean) => void }) {
  const [activeCategory, setActiveCategory] = useState('Sekretariat Daerah')
  const [cardPage, setCardPage] = useState(0)
  const cardsPerPage = 6

  // Modal state (Stack navigation for multi-level nested subItems)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStack, setModalStack] = useState<Array<{ title: string; items: SubItem[] }>>([])
  const [modalPage, setModalPage] = useState(0)
  const cardsPerModalPage = 4

  // iFrame Preview Modal state
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

  // Effect to control body scroll when iframe is open
  useEffect(() => {
    if (iframeUrl) {
      // Save current scroll position
      const scrollY = window.scrollY

      // Prevent scrolling on body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${scrollY}px`

      // Hide navbar when iframe is open
      document.body.classList.add('hide-navbar')

      // Prevent scroll wheel and touch events
      const preventScroll = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Add event listeners to prevent all scroll-related events
      document.addEventListener('wheel', preventScroll, { passive: false })
      document.addEventListener('touchmove', preventScroll, { passive: false })
      document.addEventListener('scroll', preventScroll, { passive: false })

      // Cleanup function
      return () => {
        const scrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''

        // Show navbar when iframe is closed
        document.body.classList.remove('hide-navbar')

        // Restore scroll position
        window.scrollTo(0, parseInt(scrollY || '0') * -1)

        document.removeEventListener('wheel', preventScroll)
        document.removeEventListener('touchmove', preventScroll)
        document.removeEventListener('scroll', preventScroll)
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''

      // Ensure navbar is shown when iframe is null
      document.body.classList.remove('hide-navbar')
    }
  }, [iframeUrl])

  const categoryData = opdServices[activeCategory]

  // Active modal level from stack
  const currentModalLevel = modalStack[modalStack.length - 1] || { title: '', items: [] }
  const selectedModalTitle = currentModalLevel.title
  const selectedModalData = currentModalLevel.items

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
    setModalStack([{ title: service.title, items: service.subItems || [] }])
    setModalPage(0)
    setIsModalOpen(true)
  }

  const openSubModal = (item: SubItem) => {
    if (item.subItems && item.subItems.length > 0) {
      setModalStack((prev) => [...prev, { title: item.title, items: item.subItems || [] }])
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

  // Mematikan scroll halaman utama saat pop-up menu OPD terbuka
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!iframeUrl) {
      document.body.style.overflow = '';
    }
    return () => {
      if (!iframeUrl) document.body.style.overflow = '';
    };
  }, [isModalOpen, iframeUrl]);

  // Modal pagination
  const totalModalPages = Math.ceil(selectedModalData.length / cardsPerModalPage)
  const currentModalItems = selectedModalData.slice(
    modalPage * cardsPerModalPage,
    (modalPage + 1) * cardsPerModalPage
  )

  return (
    <>
      <section id="opd" className="bg-slate-50 px-4 py-20 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading subtitle="Akses langsung ke portal resmi Organisasi Perangkat Daerah (OPD) dan wilayah administratif Kecamatan di lingkungan Pemerintah Kota Sukabumi.">
            Organisasi Perangkat Daerah
          </SectionHeading>
          <div className="flex min-h-[500px] overflow-hidden rounded-xl border border-[#e2e8ed] bg-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.5)]">
            {/* Sidebar */}
            <div className="flex w-full flex-col gap-5 md:w-[28%] p-5 md:p-8 border-r border-[#e5e7eb]">
              {Object.keys(opdServices).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-4 text-base text-left font-medium transition-all duration-200 rounded-lg border ${activeCategory === category
                    ? 'border-[#159447] bg-[#159447] text-white'
                    : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#d1d5db] hover:bg-[#f9fafb]'
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
                    {currentPage.items.map((service: ServiceCard, index: number) => {
                      const cardClasses = "flex cursor-pointer items-center gap-4 rounded-lg border border-[#e5ebf0] bg-white p-4 transition-all duration-200 hover:border-green-200 hover:bg-slate-50 hover:shadow-md w-full text-left"
                      const inner = (
                        <>
                          {/* Icon or Image */}
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${service.image ? '' : 'bg-[#f0fdf4] text-[#16a34a]'}`}>
                            {service.image ? (
                              <img src={service.image} alt={service.title} className="h-full w-full object-contain" />
                            ) : (
                              service.icon
                            )}
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

                      const itemKey = `${service.id || 'service'}-${index}`

                      if (service.subItems && service.subItems.length > 0) {
                        return (
                          <button
                            key={itemKey}
                            onClick={() => openModal(service)}
                            className={cardClasses}
                          >
                            {inner}
                          </button>
                        )
                      }

                      return (
                        <button
                          key={itemKey}
                          onClick={() => service.href && service.href !== '#' ? openIframeModal(service.href, service.title) : undefined}
                          className={cardClasses}
                        >
                          {inner}
                        </button>
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
              {modalStack.length > 1 && (
                <button
                  onClick={handleModalBack}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#159447] hover:underline mb-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke {modalStack[modalStack.length - 2].title}</span>
                </button>
              )}
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
                  {currentModalItems.map((item, index) => {
                    const cardClasses = "flex items-center gap-4 rounded-lg border border-[#e5ebf0] bg-[#f8fafc] p-4 transition-all duration-200 hover:border-green-200 hover:bg-[#f0fdf4] hover:shadow-md w-full text-left cursor-pointer"
                    const inner = (
                      <>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-[#e5ebf0] text-[#16a34a] shadow-sm overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="h-full w-full object-contain p-1" />
                          ) : (
                            <ShoppingCart size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1b293c]">{item.title}</h4>
                          <p className="text-xs text-[#66758a] leading-snug mt-0.5">{item.subtitle}</p>
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-[#cbd5e1]" />
                      </>
                    )

                    const itemKey = `${item.id || 'modal-item'}-${index}`

                    if (item.subItems && item.subItems.length > 0) {
                      return (
                        <button
                          key={itemKey}
                          onClick={() => openSubModal(item)}
                          className={cardClasses}
                        >
                          {inner}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={itemKey}
                        onClick={() => item.href && item.href !== '#' ? openIframeModal(item.href, item.title) : undefined}
                        className={cardClasses}
                      >
                        {inner}
                      </button>
                    )
                  })}
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

      {/* iFrame Preview Modal */}
      {iframeUrl && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm animate-[fadeIn_0.25s_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${iframeTitle}`}
        >
          {/* Toolbar — always visible */}
          <div className="flex items-center justify-between gap-3 bg-[#1b293c] px-4 py-2.5 shadow-lg">
            {/* Left: Back button + icon + title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Back button */}
              <button
                onClick={closeIframeModal}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                aria-label="Kembali"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Kembali</span>
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-white/15 shrink-0" />

              {/* Icon + title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <img
                    src="/images/Lambang_Kota_Sukabumi.png"
                    alt="Lambang Kota Sukabumi"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/60 leading-none mb-0.5">Pemerintah Kota Sukabumi</p>
                  <p className="text-base font-bold text-white truncate">{iframeTitle}</p>
                </div>
              </div>
            </div>

            {/* Center: URL bar */}
            <div className="hidden md:flex flex-1 mx-4 items-center gap-2.5 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 min-w-0">
              <Shield size={14} className="text-[#86efac]" />
              <span className="text-xs text-white/70 truncate font-mono">{iframeUrl}</span>
            </div>

            {/* Right: Open in new tab & Security Status */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Open in new tab */}
              <a
                href={iframeUrl ?? ''}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                title="Buka di tab baru"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                <span className="hidden sm:inline">Buka di Tab Baru</span>
              </a>

              {/* Security Status (Visible on larger screens) */}
              <div className="hidden xl:flex items-center gap-2 border-l border-white/15 pl-4">
                <div className="flex flex-col items-end justify-center gap-0.5">
                  <span className="text-[9px] font-bold text-white/40 tracking-wider">SECURITY STATUS</span>
                  <span className="text-[11px] font-bold text-[#4ade80]">PROTECTED CONNECTION</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20">
                  <Shield size={16} className="text-[#4ade80] fill-[#4ade80]/20" />
                </div>
              </div>
            </div>
          </div>

          {/* iFrame area */}
          <div className="relative flex-1 bg-white">
            {/* Loading overlay */}
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

          {/* Blocked-site fallback banner */}
          <div className="flex items-center justify-between gap-4 bg-[#1b293c]/90 px-5 py-2.5">
            <p className="text-xs md:text-sm text-white/60 font-medium">
              Jika halaman tidak tampil, situs OPD mungkin memblokir tampilan dalam bingkai.
            </p>
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs md:text-sm font-semibold text-[#4ade80] hover:underline"
            >
              Buka langsung →
            </a>
          </div>
        </div>
      )}
    </>
  )
}

// Data untuk transparansi dokumen
const transparansiDocuments = [
  {
    id: 1,
    title: "11. Laporan Keuangan BUMN/Penyelenggaran Daerah",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: 'Laporan Keuangan BUMN/Penyelenggaraan Daerah',
    publishedDate: '-'
  },
  {
    id: 2,
    title: "Kebijakan Umum Anggaran Pendapatan dan Belanja Daerah",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: 'Kebijakan Umum Anggaran Pendapatan dan Belanja Daerah',
    publishedDate: '-'
  },
  {
    id: 3,
    title: "13. Laporan Alokasi Belanja Wajib yang disusun dari Hasil Penerimaan Pajak Daerah",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: '13. Laporan Alokasi Belanja Wajib yang disusun dari Hasil Penerimaan Pajak Daerah',
    publishedDate: '-'
  },
  {
    id: 4,
    title: "Rencana Umum Pengadaan Barang/Jasa Pemerintah Daerah untuk Optimum Pengadaan Barang/Jasa",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: 'Rencana Umum Pengadaan Barang/Jasa Pemerintah Daerah untuk Optimum Pengadaan Barang/Jasa',
    publishedDate: '-'
  },
  {
    id: 5,
    title: "13. Peraturan Daerah tentang Pertanggungjawaban Pelaksanaan APBD (Batang Tubuh dan Lampiran)",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: '13. Peraturan Daerah tentang Pertanggungjawaban Pelaksanaan APBD (Batang Tubuh dan Lampiran)',
    publishedDate: '-'
  },
  {
    id: 6,
    title: "RKA PPKD Tahun Anggaran 2026",
    type: "PDF",
    views: "Lihat",
    downloads: "Unduh",
    url: '/docs/pdf-sample_0.pdf',
    previewUrl: '/docs/pdf-sample_0.pdf',
    category: 'Transparansi Pengelolaan Keuangan Daerah',
    description: 'RKA PPKD Tahun Anggaran 2026',
    publishedDate: '-'
  }
]

function TransparansiDokumen() {
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState<typeof transparansiDocuments[0] | null>(null)
  const [downloadConfirm, setDownloadConfirm] = useState<typeof transparansiDocuments[0] | null>(null)
  const itemsPerPage = 5
  const totalPages = Math.ceil(transparansiDocuments.length / itemsPerPage)

  const currentDocuments = transparansiDocuments.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleViewClick = (doc: typeof transparansiDocuments[0]) => {
    setSelectedDocument(doc)
  }

  const handleCloseModal = () => {
    setSelectedDocument(null)
  }

  const handlePrevDocument = () => {
    if (selectedDocument) {
      const currentIndex = transparansiDocuments.findIndex(doc => doc.id === selectedDocument.id)
      if (currentIndex > 0) {
        setSelectedDocument(transparansiDocuments[currentIndex - 1])
      }
    }
  }

  const handleNextDocument = () => {
    if (selectedDocument) {
      const currentIndex = transparansiDocuments.findIndex(doc => doc.id === selectedDocument.id)
      if (currentIndex < transparansiDocuments.length - 1) {
        setSelectedDocument(transparansiDocuments[currentIndex + 1])
      }
    }
  }

  const getCurrentDocumentIndex = () => {
    if (selectedDocument) {
      return transparansiDocuments.findIndex(doc => doc.id === selectedDocument.id) + 1
    }
    return 0
  }

  // Mematikan scroll halaman utama saat pop-up dokumen terbuka
  useEffect(() => {
    if (selectedDocument) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDocument]);

  return (
    <section id="transparansi" className="bg-white px-4 py-20 md:px-8 lg:px-12 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-start justify-between">
          <SectionHeading subtitle="Transparansi keuangan daerah adalah kunci pemerintahan yang bersih, akuntabel, dan dipercaya rakyat untuk membangun masa depan yang lebih baik.">
            Transparansi Keuangan Daerah
          </SectionHeading>
          {/* <div className="hidden md:block">
            <button className="rounded-lg bg-[#159447] px-4 py-2 font-medium text-white hover:bg-[#0f7a36] transition-colors">
              Lihat Selengkapnya →
            </button>
          </div> */}
        </div>

        {/* Document Cards Grid + Pagination — flex-col with min-h keeps pagination position stable */}
        <div className="flex flex-col" style={{ minHeight: '320px' }}>
          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 flex-1">
            {currentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col rounded-xl bg-white border border-[#e5e7eb] p-6 shadow-sm transition-all duration-200 hover:border-[#159447] hover:shadow-md"
              >
                {/* PDF Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-[#f0fdf4] border-2 border-[#159447]">
                    <FileText className="h-6 w-6 text-[#159447]" />
                    <span className="mt-1 text-xs font-bold text-[#159447]">{doc.type}</span>
                  </div>
                </div>

                {/* Document Title — flex-grow pushes buttons to bottom */}
                <h3 className="flex-grow mb-4 text-sm font-medium leading-tight text-[#1f2937] line-clamp-3">
                  {doc.title}
                </h3>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleViewClick(doc)}
                    className="flex-1 rounded-md bg-[#f8f9fa] px-3 py-2 text-center text-xs font-medium text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
                  >
                    {doc.views}
                  </button>
                  <button
                    onClick={() => setDownloadConfirm(doc)}
                    className="flex-1 rounded-md bg-[#159447] px-3 py-2 text-center text-xs font-medium text-white hover:bg-[#0f7a36] transition-colors"
                  >
                    {doc.downloads}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls — always at bottom of the fixed-height container */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${currentPage === 0
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
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${currentPage === totalPages - 1
                  ? 'cursor-not-allowed bg-[#f1f3f4] text-[#9ca3af]'
                  : 'bg-white text-[#374151] hover:bg-[#f9fafb] border border-[#e5e7eb]'
                  }`}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Pop-up */}
        {selectedDocument && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pt-24 md:pt-28"
            onClick={handleCloseModal}
          >
            <div
              className="bg-[#fafafa] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content Wrapper */}
              <div className="p-5 md:p-8 flex flex-col flex-1 min-h-0">
                {/* Grid Layout for Details & PDF Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                  {/* Left Column: Details */}
                  <div className="lg:col-span-5 flex flex-col gap-5 pr-0 md:pr-2">
                    {/* Category & Title */}
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
                    {/* Deskripsi Program */}
                    <div>
                      <div className="flex items-center gap-2 text-[#159447] mb-1">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-[#94a3b8] font-medium">Deskripsi Program</span>
                      </div>
                      <p className="text-[#334155] text-sm md:text-sm pl-6 leading-relaxed">
                        {selectedDocument.description}
                      </p>
                    </div>

                    {/* Tanggal Publikasi */}
                    <div>
                      <div className="flex items-center gap-2 text-[#159447] mb-1">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-xs text-[#94a3b8] font-medium">Tanggal Publikasi</span>
                      </div>
                      <p className="text-[#334155] text-sm md:text-sm pl-6">
                        {selectedDocument.publishedDate}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: PDF Preview */}
                  <div className="lg:col-span-7 h-full min-h-[300px] bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <embed
                      src={selectedDocument.previewUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Footer: Buttons */}
              <div className="border-t border-gray-200 px-5 py-3.5 bg-white shrink-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                  {/* Navigation Buttons (Left) */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={handlePrevDocument}
                      disabled={getCurrentDocumentIndex() === 1}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${getCurrentDocumentIndex() === 1
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <span className="text-xs text-[#94a3b8] font-semibold mx-1">
                      {getCurrentDocumentIndex()} / {transparansiDocuments.length}
                    </span>

                    <button
                      onClick={handleNextDocument}
                      disabled={getCurrentDocumentIndex() === transparansiDocuments.length}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${getCurrentDocumentIndex() === transparansiDocuments.length
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Action Buttons (Right) */}
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Unduh
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Confirmation Modal */}
        {downloadConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-[fadeInUp_0.2s_ease-out]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border-2 border-green-100">
                  <svg className="h-6 w-6 text-[#159447]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#1b293c]">Konfirmasi Unduhan</h3>
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
                    href={downloadConfirm.url || '#'}
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

function Partners() {

  const partners = [

    { id: 1, image: '/images/Jabar_prov-logo.png', href: 'https://jabarprov.go.id/' },

    { id: 2, image: '/images/Lambang_Kota_Sukabumi.png', href: 'https://portal.sukabumikota.go.id' },

    { id: 3, image: '/images/diskominfo-hitam.png', href: 'https://diskominfo.sukabumikota.go.id' },

    { id: 4, image: '/images/JDIH-logo.png', href: 'https://jdih.sukabumikota.go.id/' },

    { id: 5, image: '/images/Span-Lapor.png', href: 'https://www.lapor.go.id/' },

    { id: 6, image: '/images/Sirup-logo.png', href: 'https://sirup.inaproc.id/sirup/loginctr/index' },

  ];



  // We duplicate the array multiple times to ensure the marquee content is wide enough

  const displayPartners = [...partners, ...partners, ...partners];



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

                  alt={`Partner ${partner.id}`}

                  className="h-12 md:h-16 w-auto max-w-[150px] md:max-w-[200px] object-contain"

                />
              </a>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [isIframeOpen, setIsIframeOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Welcome />

      {/* Konten Utama */}
      <div className="bg-white">
        <Profile />
        <News />
        <Opd onIframeToggle={setIsIframeOpen} />
        <TransparansiDokumen />
      </div>
      <Partners />
    </main>
  )
}









