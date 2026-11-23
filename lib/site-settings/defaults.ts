import type {
  HeroSettings,
  WelcomeSettings,
  ProfileSettings,
  MediaSettings,
  OpdSettings,
  OpdCategory,
  PartnersSettings,
  HeaderFooterSettings,
  SiteSettingsMap,
} from './types';

export function normalizeYoutubeEmbedUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return 'https://www.youtube.com/embed/p2gcx5S5QJE';

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam) {
        return `https://www.youtube.com/embed/${vParam}`;
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (
        (pathParts[0] === 'shorts' ||
          pathParts[0] === 'embed' ||
          pathParts[0] === 'live') &&
        pathParts[1]
      ) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
    }
  } catch {
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return trimmed;
}

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  eyebrow: 'Selamat datang di',
  title: 'Kota Sukabumi',
  subtitle:
    'Bersama mewujudkan Masyarakat Kota Sukabumi yang Inovatif, Mandiri, Agamis, Nasionalis.',
  images: [
    '/images/lapang-merdeka.webp',
    '/images/tugu-kota.webp',
    '/images/gedung_juang.webp',
  ],
  slideIntervalMs: 3000,
};

export const DEFAULT_WELCOME_SETTINGS: WelcomeSettings = {
  leftContainerImage: '',
  leftContainerAlt: 'Banner Sambutan Kota Sukabumi',
  leaderImage: '/images/walikota dan wakil.png',
  leaderAlt: 'Walikota dan Wakil Walikota Sukabumi',
  sloganImage: '/images/Iman.png',
  sloganAlt: 'IMAN - Inovatif, Mandiri, Agamis, Nasionalis',
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  heading: 'Profil Kota Sukabumi',
  subtitle:
    'Mengenal lebih dekat sejarah, visi misi, dan berbagai aspek penting lainnya dari Kota Sukabumi.',
  cards: [
    {
      title: 'Sejarah',
      description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa.',
      image: '/images/sejarah-card.jpg',
      href: '/sejarah',
    },
    {
      title: 'Visi Misi',
      description: 'Arah pembangunan dan tujuan yang ingin dicapai.',
      image: '/images/visi misi-card.jpg',
      href: '/visi-misi',
    },
    {
      title: 'Lambang',
      description: 'Makna filosofis di balik lambang resmi daerah.',
      image: '/images/logo-pemkoot-sukabumi-card.jpg',
      href: '/lambang',
    },
    {
      title: 'Geografi dan Demografi',
      description:
        'Letak wilayah, kondisi geografis, serta demografi Kota Sukabumi.',
      image: '/images/geo-card.jpg',
      href: '/geografi',
    },
    {
      title: 'Sosial Ekonomi',
      description: 'Kondisi demografi dan pergerakan ekonomi masyarakat.',
      image:
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
      href: '/sosial-ekonomi',
    },
    {
      title: 'Dalam Angka',
      description: 'Data statistik dan indikator kinerja daerah.',
      image: '/images/dalam angka-card.jpg',
      href: '/dalam-angka',
    },
    {
      title: 'Unit Kesehatan Sekolah (UKS)',
      description:
        'Program pembinaan kesehatan komprehensif di lingkungan sekolah.',
      image: '/images/UKS-card.jpg',
      href: '/uks',
    },
  ],
};

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  youtubeEmbedUrl: 'https://www.youtube.com/embed/p2gcx5S5QJE',
  youtubeTitle: 'Profil Kota Sukabumi',
  gprTitle: 'GPR KOMDIGI',
  gprSubtitle: 'Kanal Berita Nasional',
  gprPortalUrl: 'https://www.komdigi.go.id',
};

export const DEFAULT_OPD_SETTINGS: OpdSettings = {
  heading: 'Organisasi Perangkat Daerah',
  subtitle:
    'Akses langsung ke portal resmi Organisasi Perangkat Daerah (OPD) dan wilayah administratif Kecamatan di lingkungan Pemerintah Kota Sukabumi.',
  categories: {
    'Sekretariat Daerah': {
      groups: [
        {
          title: 'Sekretariat Daerah',
          items: [
            {
              id: '1',
              image: '/images/dokpim.png',
              title: 'Dokumentasi Pimpinan',
              subtitle: 'KDP Kota Sukabumi',
              href: 'https://kdp.sukabumikota.go.id/',
            },
            {
              id: '2',
              image: '/images/JDIH-logo.png',
              title: 'Bag. Hukum',
              subtitle: 'Jaringan Dokumentasi dan Informasi Hukum',
              href: 'https://jdih.sukabumikota.go.id/beranda',
            },
            {
              id: '3',
              image: '/images/Logo_BagianOrganisasi.png',
              title: 'Bag. Organisasi',
              subtitle:
                'Halaman Informasi Penyelenggaraan Pelayanan Publik',
              href: 'https://bagianorganisasi.sukabumikota.go.id/',
            },
            {
              id: '4',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Bag. Pengadaan Barang dan Jasa',
              subtitle: 'siCAMPERENIK, SiRUP, LPSE',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'siCAMPERENIK',
                  subtitle: 'Sistem Informasi Pengadaan',
                  href: 'https://bpbj.sukabumikota.go.id',
                },
                {
                  id: 'm2',
                  image: '/images/Sirup-logo.png',
                  title: 'SiRUP',
                  subtitle: 'Sistem Informasi Rencana Umum Pengadaan',
                  href: 'https://sirup.inaproc.id/sirup/loginctr/index',
                },
                {
                  id: 'm3',
                  image: '/images/LPSE-logo.png',
                  title: 'LPSE',
                  subtitle: 'Layanan Pengadaan Secara Elektronik',
                  href: 'https://lpse.jabarprov.go.id/',
                },
              ],
            },
          ],
        },
      ],
    },
    'Sekretariat Dewan': {
      groups: [
        {
          title: 'Sekretariat Dewan',
          items: [
            {
              id: '5',
              image: '/images/LOGO-DPRD-KOTA-SUKABUMI.png',
              title: 'Portal DPRD',
              subtitle: 'DPRD Kota Sukabumi',
              href: 'https://dprd.sukabumikota.go.id/',
            },
            {
              id: '6',
              image: '/images/LOGO-DPRD-KOTA-SUKABUMI.png',
              title: 'JDIH DPRD',
              subtitle: 'JDIH DPRD Kota Sukabumi',
              href: 'https://jdih-dprd.sukabumikota.go.id/',
            },
          ],
        },
      ],
    },
    Inspektorat: {
      groups: [
        {
          title: 'Inspektorat',
          items: [
            {
              id: '1',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Portal Inspektorat',
              subtitle: 'Inspektorat Kota Sukabumi',
              href: 'https://inspektorat.sukabumikota.go.id',
            },
            {
              id: '2',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'WBS',
              subtitle:
                'Layanan Pengaduan dan Konsultasi Aparatur dan Masyarakat',
              href: 'https://layanan.sukabumikota.go.id',
            },
          ],
        },
      ],
    },
    Badan: {
      groups: [
        {
          title: 'Badan',
          items: [
            {
              id: '7',
              image: '/images/BAPPEDA-logo.png',
              title: 'BAPPEDA',
              subtitle: 'SIPEKA, E-Rida , SIVAKA, SIGENKO',
              subItems: [
                {
                  id: 'm4',
                  image: '/images/BAPPEDA-logo.png',
                  title: 'SIPEKA',
                  subtitle:
                    'Sistem Informasi Pengendalian dan Evaluasi Kinerja',
                  href: 'https://sipeka.sukabumikota.go.id/app/sampeu/login/',
                },
                {
                  id: 'm5',
                  image: '/images/erida.png',
                  title: 'E-Rida',
                  subtitle: 'Elektronik Riset dan Inovasi Daerah',
                  href: 'https://e-rida.sukabumikota.go.id/',
                },
                {
                  id: 'm6',
                  image: '/images/sivaka-logo.png',
                  title: 'SIVAKA',
                  subtitle:
                    'Sistem Informasi Verifikasi Anggaran Kota Sukabumi',
                  href: 'https://sivaka.sukabumikota.go.id/',
                },
                {
                  id: 'm7',
                  image: '/images/BAPPEDA-logo.png',
                  title: 'SIGENKO',
                  subtitle: 'Sistem Informasi Geografis Kota',
                  href: 'https://geoinfo.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '10',
              image: '/images/Bakesbangpol-logo.png',
              title: 'Bakesbangpol',
              subtitle: 'Portal Bakesbangpol Kota Sukabumi',
              href: 'https://kesbangpol.sukabumikota.go.id/',
            },
            {
              id: '8',
              image: '/images/BKPSDM-logo.png',
              title: 'BKPSDM',
              subtitle: 'Portal BKPSDM, Simpeg, SimpegIntegrasi, SiCantik',
              subItems: [
                {
                  id: 'm8',
                  image: '/images/BKPSDM-logo.png',
                  title: 'Portal BKPSDM',
                  subtitle:
                    'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia',
                  href: 'https://bkpsdm.sukabumikota.go.id/',
                },
                {
                  id: 'm9',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Simpeg',
                  subtitle: 'Sistem Informasi Kepegawaian',
                  href: 'https://simpeg.sukabumikota.go.id/',
                },
                {
                  id: 'm10',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Simpegintegrasi',
                  subtitle: 'Sistem Informasi Kepegawaian integrasi',
                  href: 'https://simpegintegrasi.sukabumikota.go.id/login',
                },
                {
                  id: 'm11',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'SiCantik',
                  subtitle: 'Sistem Catatan Kinerja Elektronik',
                  href: 'https://sicantik.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '2',
              image: '/images/BPBD-logo.png',
              title: 'BPBD',
              subtitle: 'portal BPBD Kota Sukabumi, SiEdan',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/BPBD-logo.png',
                  title: 'Portal BPBD Kota Sukabumi',
                  subtitle: 'Badan Penanggulangan Bencana Daerah',
                  href: 'https://bpbd.sukabumikota.go.id/',
                },
                {
                  id: 'm2',
                  image: '/images/BPBD-logo.png',
                  title: 'SiEdan',
                  subtitle:
                    'Sistem Informasi Kedaruratan Kota Sukabumi',
                  href: 'https://siedan.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '1',
              image: '/images/bpkpd-logo.png',
              title: 'BPKPD',
              subtitle: 'Layanan BPKPD',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/bpkpd-logo.png',
                  title: 'Portal BPKPD',
                  subtitle:
                    'Badan Pengelolaan Keuangan dan Pendapatan Daerah',
                  href: 'https://bpkpd.sukabumikota.go.id/',
                },
                {
                  id: 'm2',
                  image: '/images/bpkpd-logo.png',
                  title: 'Pantas',
                  subtitle: 'Portal Pelayanan Pajak & Retribusi Daerah',
                  href: 'https://pantas.sukabumikota.go.id/login',
                },
                {
                  id: 'm3',
                  image: '/images/smart_elok-logo.png',
                  title: 'Smartelok',
                  subtitle: 'Sistem Penerimaan Retribusi Elektronik',
                  href: 'https://smartelok.sukabumikota.go.id/login',
                },
                {
                  id: 'm4',
                  image: '/images/sispeck-logo.png',
                  title: 'Sispeck',
                  subtitle: 'Sistem Informasi SPPT Cetak Elektronik',
                  href: 'https://sispeck.sukabumikota.go.id/auth',
                },
                {
                  id: 'm5',
                  image: '/images/bpkpd-logo.png',
                  title: 'BPHTB',
                  subtitle:
                    'Bea Perolehan Hak atas Tanah dan Bangunan',
                  href: 'https://bphtb.sukabumikota.go.id/bphtb/auth/login',
                },
                {
                  id: 'm6',
                  image: '/images/Spada-santun-logo.png',
                  title: 'Spada Santun',
                  subtitle:
                    'Sistem Informasi Kedaruratan Kota Sukabumi',
                  href: 'https://spadasantun.sukabumikota.go.id/login',
                },
                {
                  id: 'm7',
                  image: '/images/bpkpd-logo.png',
                  title: 'EIS',
                  subtitle: 'Evaluasi Implementasi SIPP',
                  href: 'https://eispantas.sukabumikota.go.id/',
                },
                {
                  id: 'm8',
                  image: '/images/bpkpd-logo.png',
                  title: 'SIMASJELI',
                  subtitle:
                    'Sistem Informasi Kedaruratan Kota Sukabumi',
                  href: 'https://sekrebpkpd.sukabumikota.go.id/admin/login',
                },
                {
                  id: 'm9',
                  image: '/images/siadik-logo.png',
                  title: 'SIADIK',
                  subtitle: 'Sistem Arsip Digital Kuangan',
                  href: 'https://siadik.sukabumikota.go.id/',
                },
                {
                  id: 'm10',
                  image: '/images/simonet-logo.png',
                  title: 'SIMONET',
                  subtitle:
                    'Sistem Informasi Monitoring Dana (BPKPD) Kota Sukabumi',
                  href: 'https://simonet.sukabumikota.go.id/',
                },
                {
                  id: 'm11',
                  image: '/images/bpkpd-logo.png',
                  title: 'SIMPPB',
                  subtitle:
                    ' Sistem Informasi Manajemen Pajak Bumi dan Bangunan',
                  href: '#',
                },
              ],
            },
          ],
        },
        {
          title: 'Sosial',
          items: [],
        },
      ],
    },
    Dinas: {
      groups: [
        {
          title: 'Dinas',
          items: [
            {
              id: '1',
              image: '/images/disnaker-logo.png',
              title: 'Disnaker',
              subtitle: 'Portal Dinas Ketenagakerjaan Kota Sukabumi',
              href: 'https://disnaker.sukabumikota.go.id/',
            },
            {
              id: '2',
              image: '/images/Diskumindag-logo.png',
              title: 'Diskumindag',
              subtitle:
                'Portal Diskumindag Kota Sukabumi, Simpan UMKM',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/Diskumindag-logo.png',
                  title: 'Portal Diskumindag',
                  subtitle:
                    'Dinas Koperasi, Usaha Mikro, Perindustrian dan Perdagangan',
                  href: 'https://diskumindag.sukabumikota.go.id/',
                },
                {
                  id: 'm2',
                  image: '/images/Diskumindag-logo.png',
                  title: 'Simpan UMKM',
                  subtitle: 'Sistem Informasi Pendataan UMKM',
                  href: 'https://dataumkm.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '3',
              image: '/images/dinsos-logo.png',
              title: 'Dinsos',
              subtitle: 'Portal Dinas Sosial Kota Sukabumi',
              href: 'https://dinsos.sukabumikota.go.id/',
            },
            {
              id: '4',
              image: '/images/dkp3-logo.png',
              title: 'DKP3',
              subtitle:
                'Layanan Dinas Ketahanan Pangan, Pertanian, dan Perikanan',
              subItems: [
                {
                  id: 'm12',
                  image: '/images/dkp3-logo.png',
                  title: 'Portal DKP3 Kota Sukabumi',
                  subtitle:
                    'Dinas Ketahanan Pangan, Pertanian, dan Perikanan',
                  href: 'https://distan.sukabumikota.go.id/',
                },
                {
                  id: 'm13',
                  image: '/images/pikachu-logo.png',
                  title: 'Pikachu',
                  subtitle:
                    'Perencanaan Terintegrasi Kepegawaian, Catatan Harian dan Umum',
                  href: 'https://pikachu.sukabumikota.go.id/login.php',
                },
                {
                  id: 'm14',
                  image: '/images/Sipanda-logo.png',
                  title: 'SIPANDA',
                  subtitle:
                    'Sistem Informasi Pangan Daerah Kota Sukabumi',
                  href: 'https://sipanda.sukabumikota.go.id/',
                },
                {
                  id: 'm15',
                  image: '/images/simpelkesrawan-logo.png',
                  title: 'Simpel Kesrawan',
                  subtitle:
                    'Sistem Informasi Pelayanan Kesehatan & Kesejahteraan Hewan',
                  href: 'https://simpelkesrawan.sukabumikota.go.id/',
                },
                {
                  id: 'm16',
                  image: '/images/KAC-logo.png',
                  title: 'KAC',
                  subtitle: 'Kawasan Agroeduwisata Cikundul',
                  href: 'https://kac.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '5',
              image: '/images/dispopapar-logo.png',
              title: 'Dispopapar',
              subtitle:
                'Portal Dinas Olahraga dan Pariwisata Kota Sukabumi',
              href: 'https://disporapar.sukabumikota.go.id/',
            },
            {
              id: '6',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Dinkes',
              subtitle: 'Layanan Dinas Kesehatan Kota Sukabumi',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Portal Dinkes Kota Sukabumi',
                  subtitle: 'Dinas Kesehatan',
                  href: 'https://dinkes.sukabumikota.go.id/',
                },
                {
                  id: 'm2',
                  image: '/images/puskesmas-logo.png',
                  title: 'Puskesmas',
                  subtitle: 'Daftar puskesmas di Kota Sukabumi',
                  subItems: [
                    {
                      id: 'm21',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Baros',
                      subtitle: 'Portal Puskesmas Baros',
                      href: 'https://puskesmasbaros.sukabumikota.go.id/',
                    },
                    {
                      id: 'm22',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Benteng',
                      subtitle: 'Portal Puskesmas Benteng',
                      href: 'https://puskesmasbenteng.sukabumikota.go.id/',
                    },
                    {
                      id: 'm25',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Cibeureum Hilir',
                      subtitle: 'Profil Puskesmas Cibeureum Hilir',
                      href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-cibeureum-hilir',
                    },
                    {
                      id: 'm23',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Cipelang',
                      subtitle: 'Portal Puskesmas Cipelang',
                      href: 'https://puskesmascipelang.sukabumikota.go.id/',
                    },
                    {
                      id: 'm24',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Selabatu',
                      subtitle: 'Portal Puskesmas Selabatu',
                      href: 'https://puskesmasselabatu.sukabumikota.go.id/',
                    },
                    {
                      id: 'm26',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Cikole',
                      subtitle: 'Profil Puskesmas Cikole',
                      href: 'https://dinkes.sukabumikota.go.id/',
                    },
                    {
                      id: 'm27',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Citamiang',
                      subtitle: 'Profil Puskesmas Citamiang',
                      href: 'https://dinkes.sukabumikota.go.id/',
                    },
                    {
                      id: 'm28',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Lembursitu',
                      subtitle: 'Profil Puskesmas Lembursitu',
                      href: 'https://dinkes.sukabumikota.go.id/',
                    },
                    {
                      id: 'm11',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Limusnunggal',
                      subtitle: 'Profil Puskesmas Limusnunggal',
                      href: 'https://dinkes.sukabumikota.go.id/upt_rs/read/puskesmas-limusnunggal',
                    },
                    {
                      id: 'm29',
                      image: '/images/puskesmas-logo.png',
                      title: 'Puskesmas Sukakarya',
                      subtitle: 'Profil Puskesmas Sukakarya',
                      href: 'https://dinkes.sukabumikota.go.id/',
                    },
                  ],
                },
              ],
            },
            {
              id: '7',
              image: '/images/Disdukcapil-logo.png',
              title: 'Disdukcapil',
              subtitle: 'Portal Disdukcapil, Moci Legit',
              subItems: [
                {
                  id: 'm3',
                  image: '/images/Disdukcapil-logo.png',
                  title: 'Portal Disdukcapil',
                  subtitle: 'Dinas Kependudukan dan Pencatatan Sipil',
                  href: 'https://disdukcapil.sukabumikota.go.id/',
                },
                {
                  id: 'm4',
                  image: '/images/mocilegit-logo.png',
                  title: 'Moci Legit',
                  subtitle:
                    'Masyarakat kota Sukabumi Cepat, Terintegrasi, Lebih mudah, gratis, dan terpercaya',
                  href: 'https://mocilegit.sukabumikota.go.id/login',
                },
              ],
            },
            {
              id: '9',
              image: '/images/diskominfo-hitam.png',
              title: 'Diskominfo',
              subtitle: 'Layanan Diskominfo Sukabumi',
              subItems: [
                {
                  id: 'm12',
                  image: '/images/diskominfo-hitam.png',
                  title: 'Portal Diskominfo',
                  subtitle: 'Portal Dinas Komunikasi dan Informatika',
                  href: 'https://diskominfo.sukabumikota.go.id/',
                },
                {
                  id: 'm13',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Simpan SPBE',
                  subtitle:
                    'Sistem Manajemen Pengetahuan SPBE Kota Sukabumi',
                  href: 'https://simpan-spbe.sukabumikota.go.id/',
                },
                {
                  id: 'm14',
                  image: '/images/diskominfo-hitam.png',
                  title: 'SKM-Diskominfo',
                  subtitle: 'Survei Kepuasan Masyarakat',
                  href: 'http://skm-diskominfo.sukabumikota.go.id/survey',
                },
                {
                  id: 'm15',
                  image: '/images/diskominfo-hitam.png',
                  title: 'Satu-Data',
                  subtitle:
                    'pengelolaan dan berbagi pakai data antar Perangkat Daerah Kota Sukabumi',
                  href: 'https://satudata.sukabumikota.go.id/login',
                },
                {
                  id: 'm16',
                  image: '/images/opendata-logo.png',
                  title: 'Open Data',
                  subtitle: 'koleksi dataset terlengkap di Kota Sukabumi',
                  href: 'https://opendata.sukabumikota.go.id/',
                },
                {
                  id: 'm17',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Data',
                  subtitle:
                    'pengelolaan, perencanaan, dan pembagian data instansi',
                  href: 'https://data.sukabumikota.go.id/login',
                },
                {
                  id: 'm18',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Simponi',
                  subtitle:
                    'Sistem Informasi Manajemen Pemerintahan Online',
                  href: 'https://simponi.sukabumikota.go.id/',
                },
                {
                  id: 'm19',
                  image: '/images/PPID-logo.png',
                  title: 'PPID',
                  subtitle:
                    'Pejabat Pengelola Informasi dan Dokumentasi',
                  href: 'https://ppid.sukabumikota.go.id/',
                },
                {
                  id: 'm20',
                  image: '/images/diskominfo-hitam.png',
                  title: 'Silantik',
                  subtitle: 'Sistem Layanan TIK',
                  href: 'https://diskominfo.sukabumikota.go.id/silantik/public/',
                },
              ],
            },
            {
              id: '8',
              image: '/images/DPMPTSP-logo.png',
              title: 'DPMPTSP',
              subtitle: 'Layanan DPMPTSP Kota Sukabumi',
              subItems: [
                {
                  id: 'm1',
                  image: '/images/DPMPTSP-logo.png',
                  title: 'Portal MPP',
                  subtitle: 'Mal Pelayanan Publik',
                  href: 'https://mpp.sukabumikota.go.id/',
                },
                {
                  id: 'm2',
                  image: '/images/DPMPTSP-logo.png',
                  title: 'Sakti',
                  subtitle:
                    'Sistem Aplikasi Kolaborasi Antar Instansi',
                  href: 'https://mpp.sukabumikota.go.id/sakti',
                },
              ],
            },
          ],
        },
      ],
    },
    Kecamatan: {
      groups: [
        {
          title: 'Kecamatan',
          items: [
            {
              id: '3',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Kecamatan Baros',
              subtitle: 'Website Kec. Baros',
              href: 'https://kecamatanbaros.sukabumikota.go.id',
            },
            {
              id: '4',
              image: '/images/CIBEUREUM-logo.png',
              title: 'Kecamatan Cibeureum',
              subtitle: 'Website Kec. Cibeureum',
              href: 'https://kecamatancibeureum.sukabumikota.go.id',
            },
            {
              id: '5',
              image: '/images/cikole-logo.png',
              title: 'Kecamatan Cikole',
              subtitle: 'Web kec. Cikole, Kel. Cisarua, Kel. Selabatu',
              subItems: [
                {
                  id: 'm5',
                  image: '/images/cikole-logo.png',
                  title: 'Website Kec. Cikole',
                  subtitle: 'Website Kec. Cikole',
                  href: 'https://kecamatancikole.sukabumikota.go.id/',
                },
                {
                  id: 'm6',
                  image: '/images/perpuscisarua-logo.png',
                  title: 'Kelurahan Cisarua',
                  subtitle: 'web perpustakaan',
                  href: 'https://perpuscisarua.sukabumikota.go.id/',
                },
                {
                  id: 'm7',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Kelurahan Selabatu',
                  subtitle: 'web Kel. Selabatu',
                  href: 'https://kelurahanselabatu.sukabumikota.go.id',
                },
              ],
            },
            {
              id: '6',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Kecamatan Citamiang',
              subtitle: 'Website Kec. Citamiang',
              href: 'https://kecamatancitamiang.sukabumikota.go.id/',
            },
            {
              id: '7',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Kecamatan Gunungpuyuh',
              subtitle:
                'Web Kec. Gunungpuyuh, Kel. Gunungpuyuh, Kel. Karamat, Kel. Karangtengah',
              subItems: [
                {
                  id: 'm8',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Website Kec. Gunungpuyuh',
                  subtitle: 'Web Kec. Gunungpuyuh',
                  href: 'https://kecamatangunungpuyuh.sukabumikota.go.id/',
                },
                {
                  id: 'm9',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Kelurahan Gunungpuyuh',
                  subtitle: 'web Kel. Gunungpuyuh',
                  href: 'https://kelurahangunungpuyuh.sukabumikota.go.id/',
                },
                {
                  id: 'm10',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Kelurahan Karamat',
                  subtitle: 'web Kel. Karamat',
                  href: 'https://kelurahankaramat.sukabumikota.go.id/',
                },
                {
                  id: 'm11',
                  image: '/images/Lambang_Kota_Sukabumi.png',
                  title: 'Kelurahan Karangtengah',
                  subtitle: 'web Kel. Karangtengah',
                  href: 'https://kelurahankarangtengah.sukabumikota.go.id/',
                },
              ],
            },
            {
              id: '8',
              image: '/images/Lambang_Kota_Sukabumi.png',
              title: 'Kecamatan Lembursitu',
              subtitle: 'Website Kec. Lembursitu',
              href: 'https://kecamatanlembursitu.sukabumikota.go.id/',
            },
            {
              id: '9',
              image: '/images/warudoyong-logo.png',
              title: 'Kecamatan Warudoyong',
              subtitle: 'Website Kec. Warudoyong',
              href: 'https://kecamatanwarudoyong.sukabumikota.go.id',
            },
          ],
        },
      ],
    },
    Mitra: {
      groups: [
        {
          title: 'Mitra',
          items: [
            {
              id: '1',
              image: '/images/dekranasda.png',
              title: 'Dekranasda',
              subtitle:
                'portal Dewan Kerajinan Nasional Daerah sukabumi',
              href: 'https://dekranasda.sukabumikota.go.id/',
            },
          ],
        },
      ],
    },
  },
};

export const DEFAULT_PARTNERS_SETTINGS: PartnersSettings = {
  items: [
    {
      id: 1,
      image: '/images/Jabar_prov-logo.png',
      href: 'https://jabarprov.go.id/',
      alt: 'Pemerintah Provinsi Jawa Barat',
    },
    {
      id: 2,
      image: '/images/Lambang_Kota_Sukabumi.png',
      href: 'https://portal.sukabumikota.go.id',
      alt: 'Portal Kota Sukabumi',
    },
    {
      id: 3,
      image: '/images/diskominfo-hitam.png',
      href: 'https://diskominfo.sukabumikota.go.id',
      alt: 'Diskominfo Kota Sukabumi',
    },
    {
      id: 4,
      image: '/images/JDIH-logo.png',
      href: 'https://jdih.sukabumikota.go.id/',
      alt: 'JDIH Kota Sukabumi',
    },
    {
      id: 5,
      image: '/images/Span-Lapor.png',
      href: 'https://www.lapor.go.id/',
      alt: 'SP4N Lapor',
    },
    {
      id: 6,
      image: '/images/Sirup-logo.png',
      href: 'https://sirup.inaproc.id/sirup/loginctr/index',
      alt: 'SiRUP',
    },
  ],
};

export const DEFAULT_HEADER_FOOTER_SETTINGS: HeaderFooterSettings = {
  headerLogoUrl: '/logo.png',
  footerLogoUrl: '/images/Lambang_Kota_Sukabumi.png',
  topLabel: 'WEBSITE RESMI',
  orgName: 'Pemerintah Kota Sukabumi',
  mottoText: 'Reugreug Pageuh Repeh Rapih',
  footerDescription:
    'Website Pemerintah Kota Sukabumi merupakan layanan teknologi informasi untuk meningkatkan efisiensi, efektivitas, transparansi serta akuntabilitas dalam penyelenggaraan pemerintahan.',
  addressText:
    'Alamat : Jl. R. Syamsudin, SH No.25, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113',
  mapsUrl: 'https://maps.app.goo.gl/CmbbaNogyg1h8DBA7',
  phoneDisplay: 'Telp : +62 (266) 20229715',
  phoneTel: '+6226620229715',
  email: 'diskominfo@sukabumikota.go.id',
  relatedLinks: [
    {
      label: 'Layanan Pengadaan LPSE',
      href: 'https://lpse.jabarprov.go.id/',
    },
    {
      label: 'Layanan Informasi Publik (PPID)',
      href: 'https://ppid.sukabumikota.go.id/',
    },
    {
      label: 'Layanan Informasi Hukum (JDIH)',
      href: 'https://jdih.sukabumikota.go.id/beranda',
    },
  ],
  socialLinks: {
    facebook: 'https://www.facebook.com/kotasukabumi.id?locale=id_ID',
    x: 'https://x.com/Pemkot_Sukabumi',
    instagram: 'https://www.instagram.com/pemkotsukabumi_/',
    youtube: 'https://www.youtube.com/@pemerintahkotasukabumi',
  },
  copyrightText: 'Website Resmi Pemerintah Kota Sukabumi',
  managedByLabel: 'Diskominfo Kota Sukabumi',
  managedByUrl: 'https://diskominfo.sukabumikota.go.id/',
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsMap = {
  hero: DEFAULT_HERO_SETTINGS,
  welcome: DEFAULT_WELCOME_SETTINGS,
  profile: DEFAULT_PROFILE_SETTINGS,
  media: DEFAULT_MEDIA_SETTINGS,
  opd: DEFAULT_OPD_SETTINGS,
  partners: DEFAULT_PARTNERS_SETTINGS,
  headerFooter: DEFAULT_HEADER_FOOTER_SETTINGS,
};

// JSONB does not keep key order, so categories are re-sorted to the canonical order.
export function orderOpdCategories(
  categories: Record<string, OpdCategory>
): Record<string, OpdCategory> {
  const ordered: Record<string, OpdCategory> = {};
  for (const key of Object.keys(DEFAULT_OPD_SETTINGS.categories)) {
    if (categories[key]) ordered[key] = categories[key];
  }
  for (const key of Object.keys(categories)) {
    if (!(key in ordered)) ordered[key] = categories[key];
  }
  return ordered;
}
