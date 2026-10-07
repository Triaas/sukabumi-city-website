export interface NewsItem {
  slug: string
  title: string
  date: string
  category: string
}

// Sumber data tunggal berita: dipakai oleh beranda (card berita) dan halaman /berita
export const allNews: NewsItem[] = [
  { slug: 'pelantikan-mui-2023', title: 'PELANTIKAN PENGURUS MUI KOTA SUKABUMI PERIODE 2023-2028 RESMI DISELENGGARAKAN', date: '25 Okt 2023', category: 'Agama' },
  { slug: 'vaksinasi-gratis-lansia', title: 'PROGRAM VAKSINASI GRATIS DAN CEK KESEHATAN LANSIA DI PUSKESMAS BAROS', date: '22 Okt 2023', category: 'Kesehatan' },
  { slug: 'kampanye-penghijauan-sungai', title: 'KAMPANYE PENGHIJAUAN DAN BERSIH SUNGAI CIKUNDUL BERSAMA MASYARAKAT', date: '19 Okt 2023', category: 'Lingkungan' },
  { slug: 'distribusi-pupuk-subsidi', title: 'DISTRIBUSI PUPUK BERSUBSIDI UNTUK KELOMPOK TANI MULAI DILAKUKAN', date: '10 Okt 2023', category: 'Pertanian' },
  { slug: 'penyuluhan-hukum-gratis', title: 'PENYULUHAN HUKUM GRATIS UNTUK MASYARAKAT KOTA SUKABUMI TAHUN 2023', date: '02 Okt 2023', category: 'Hukum' },
  { slug: 'perbaikan-jalan-lingkar', title: 'PERBAIKAN JALAN LINGKAR SELATAN DITARGETKAN RAMPUNG AKHIR TAHUN', date: '28 Sep 2023', category: 'Infrastruktur' },
  { slug: 'bantuan-sosial-tunai', title: 'PEMKOT SALURKAN BANTUAN SOSIAL TUNAI KEPADA 1000 KELUARGA', date: '25 Sep 2023', category: 'Sosial' },
  { slug: 'lomba-sekolah-sehat', title: 'SMPN 1 KOTA SUKABUMI JUARA 1 LOMBA SEKOLAH SEHAT TINGKAT PROVINSI', date: '20 Sep 2023', category: 'Pendidikan' },
  { slug: 'festival-seni-budaya', title: 'FESTIVAL SENI DAN BUDAYA KOTA SUKABUMI 2023 DIIKUTI RIBUAN PESERTA', date: '15 Sep 2023', category: 'Sosial' },
]
