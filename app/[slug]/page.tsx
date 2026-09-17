import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Data konten untuk setiap slug
const contentData: {
  [key: string]: {
    title: string
    description: string
    content: string[]
    heroImage: string
    contentImage?: string
    contentImageTitle?: string
    inlineImages?: { [key: number]: { src: string; caption?: string } }
    tableData?: Array<{
      title: string
      subtitle: string
      data: Array<{ no: string; nama: string; tahun: string }>
    }>
  }
} = {
  'sejarah': {
    title: 'Sejarah Kota Sukabumi',
    description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa',
    heroImage: '/images/sejarah-card.jpg',
    contentImage: '/images/soek4bum01.jpg',
    inlineImages: {
      2: {
        src: '/images/soek4bum04.jpg',
        caption: 'Jalan Stasiun – Kini JaIan Zainal Zakse dilihat dari arah seberah Barat',
      },
    },
    tableData: [
      {
        title: 'PERKEMBANGAN NOMENKLATUR',
        subtitle: 'KOTA SUKABUMI DARI MASA KE MASA',
        data: [
          { no: '1.', nama: 'Mr. R. Syamsudin', tahun: '1945-1946' },
          { no: '2.', nama: 'Nama Pimpinan Dummy 2', tahun: '1946-1948' },
        ]
      },
      {
        title: 'NAMA-NAMA PIMPINAN ',
        subtitle: 'PEMERINTAH DAERAH SUKABUMI',
        data: [
          { no: '1.', nama: ' Mr. R. Syamsudin.', tahun: '1945-1946' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '3.', nama: 'Raden Ebo Adinegara.', tahun: '1946-1948' },
          { no: '4.', nama: 'Raden Widjaja Soerija.', tahun: '1948-1950' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '(Acting)' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
          { no: '2.', nama: 'Raden Mamur Soeria Hoedaja.', tahun: '1946-1948' },
        ]
      }
    ],
    content: [
      'Kota Sukabumi berasal dari bahasa Sunda. Yaitu Suka-Bumen, menurut keterangan mengingat udaranya yang sejuk dan nyaman, mereka yang dating ke daerah ini tidak ingin untuk pindah lagi karena suka/ senang Bumen-Bumen atau bertempat tinggal di daerah ini.',
      'Pada tahun 1914 Pemerintah Hindia Belanda menjadikan Kota Sukabumi sebagai “Burgerlijk Bestuur” dengan status “Gemeente” dennan alasan bahwa di kota ini banyak berdiam orang-orang Belanda dan Eropa pemlik perkebunan-perkebunan yang berada di daerah Kabupaten Sukabumi bagian Selatan yang harus mendapatkan pengurusan dan pelayanan yang istimewa.',
      'Sejak ditetapkannya Sukabumi menjadi daerah otonomi pada bulan Mei 1926 makaresmi diangkat “Burgemeester” yaitu Mr. GF. Rambonnet. Pada masa ini dibangun stasiun kereta api, Mesjid Agung, Gereja dan Pembangkit Listrik. Setelah Mr. GF. Rambonnet memerintah ada tiga “Burgemesteester” sebagai penggantinya yaitu : Mr. WM Ouwekerk, Mr. A LA Van Unendan, dan Mr. W.J PH Van Waning.',
    ]
  },
  'visi-misi': {
    title: 'Visi dan Misi',
    description: 'Arah pembangunan dan tujuan yang ingin dicapai Kota Sukabumi',
    heroImage: '/images/visi misi-card.jpg',
    contentImage: '/images/Lambang_Kota_Sukabumi.png',
    contentImageTitle: 'WALIKOTA SUKABUMI',
    content: [
      '<strong>VISI</strong><br/><br/>"Terwujudnya Masyarakat Kota Sukabumi yang Inovatif, Mandiri, Agamis, Nasionalis"',
      '<strong>MISI</strong><br/><br/>1. Pengembangan sumber daya manusia dan keterampilan masyarakat berbasis vokasi serta peningkatan kualitas pelayanan kesehatan masyarakat;<br/>2. Pengamalan nilai-nilai agama, sosial, budaya, dan memperkuat toleransi, ketenteraman serta ketertiban umum;<br/>3. Pengembangan ekonomi kreatif dan pariwisata;<br/>4. Peningkatan kualitas lingkungan dan infrastruktur publik;<br/>5. Penguatan tata kelola pemerintahan untuk pelayanan publik berkualitas.',
      '<strong>Visi Pembangunan Kota Sukabumi Tahun 2025-2045 yang termuat dalam RPJPD Kota Sukabumi Tahun 2025-2045 yaitu :</strong><br><br>“Sukabumi Kota Kreatif, Unggul, Berbudaya dan Berkelanjutan”',
      '<strong>MISI</strong><br/><br/>1. Mengembangkan Sumber Daya Manusia yang Berakhlak dan Berdaya Saing;;<br/>2. Mempercepat Transformasi Ekonomi yang Inklusif dan Berkeadilan;;<br/>3. Menguatkan Tata Kelola Pemerintahan yang Modern dan Inovatif;;<br/>4. PMeningkatkan Stabilitas Ketenteraman dan Ketertiban Umum;<br/>5.Mewujudkan Masyarakat yang Religius, Berbudaya dan Ramah Lingkungan;<br/>6. Menyediakan Infrastrukur yang Merata dan Berkelanjutan;<br/>7. Menyiapkan Sarana dan Prasarana Perkotaan Berkualitas;<br/>8. Mewujudkan Kesinambungan Pembangunan.'
    ]
  },
  'lambang': {
    title: 'Lambang Kota Sukabumi',
    description: 'Makna filosofis di balik lambang resmi daerah',
    heroImage: '/images/logo-pemkoot-sukabumi-card.jpg',
    contentImage: '/images/Lambang_Kota_Sukabumi.png',
    content: [
      'Lambang Kota Sukabumi memiliki makna filosofis yang mendalam dan mencerminkan identitas serta cita-cita masyarakat Sukabumi.',
      'Setiap elemen dalam lambang memiliki arti khusus: warna, bentuk, dan simbol yang digunakan merepresentasikan nilai-nilai luhur dan karakteristik Kota Sukabumi.',
      'Lambang ini menjadi simbol kebanggaan dan identitas masyarakat Sukabumi yang terus dijaga dan dilestarikan dari generasi ke generasi.',
    ]
  },
  'geografi': {
    title: 'Geografi Kota Sukabumi',
    description: 'Letak, topografi, dan kondisi geografis wilayah',
    heroImage: '/images/geo-card.jpg',
    content: [
      'Kota Sukabumi terletak di bagian selatan Provinsi Jawa Barat dengan luas wilayah sekitar 48,25 km².',
      'Secara geografis, Kota Sukabumi berada pada ketinggian 584-750 meter di atas permukaan laut dengan topografi yang bergelombang.',
      'Kota ini memiliki iklim tropis dengan curah hujan yang cukup tinggi sepanjang tahun. Kondisi geografis ini mendukung pertanian dan pariwisata alam.',
      'Batas wilayah Kota Sukabumi berbatasan langsung dengan Kabupaten Sukabumi di semua sisi, menjadikannya sebagai enklave di tengah wilayah kabupaten.',
    ]
  },
  'sosial-ekonomi': {
    title: 'Sosial Ekonomi',
    description: 'Kondisi demografi dan pergerakan ekonomi masyarakat',
    heroImage: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
    content: [
      'Kondisi sosial ekonomi Kota Sukabumi terus menunjukkan perkembangan positif dengan berbagai sektor ekonomi yang tumbuh.',
      'Sektor perdagangan, jasa, dan industri menjadi tulang punggung perekonomian kota dengan kontribusi yang signifikan terhadap PDRB.',
      'Tingkat pendidikan masyarakat terus meningkat dengan berbagai fasilitas pendidikan dari tingkat dasar hingga perguruan tinggi.',
      'Program-program pemberdayaan ekonomi kerakyatan terus digalakkan untuk meningkatkan kesejahteraan masyarakat dan mengurangi angka kemiskinan.',
    ]
  },
  'dalam-angka': {
    title: 'Sukabumi Dalam Angka',
    description: 'Data statistik dan indikator kinerja daerah',
    heroImage: '/images/dalam angka-card.jpg',
    content: [
      'Luas Wilayah: 48,25 km²',
      'Jumlah Penduduk: ±330.000 jiwa (estimasi)',
      'Kepadatan Penduduk: ±6.800 jiwa/km²',
      'Jumlah Kecamatan: 7 kecamatan',
      'Jumlah Kelurahan: 38 kelurahan',
      'Tingkat Pertumbuhan Ekonomi: Menunjukkan tren positif dengan berbagai sektor yang berkembang pesat.',
    ]
  },
  'uks': {
    title: 'Unit Kesehatan Sekolah (UKS)',
    description: 'Program pembinaan kesehatan komprehensif di lingkungan sekolah',
    heroImage: '/images/UKS-card.jpg',
    content: [
      'Program UKS Kota Sukabumi merupakan upaya terpadu dalam membina dan mengembangkan kesehatan peserta didik di lingkungan sekolah.',
      'Kegiatan UKS meliputi pendidikan kesehatan, pelayanan kesehatan, dan pembinaan lingkungan sekolah sehat.',
      'Melalui UKS, peserta didik diajarkan tentang pentingnya hidup sehat, kebersihan diri, gizi seimbang, dan pencegahan penyakit.',
      'Program ini melibatkan kerjasama antara Dinas Kesehatan, Dinas Pendidikan, dan sekolah-sekolah untuk menciptakan generasi yang sehat dan produktif.',
    ]
  },
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = contentData[slug]

  // Jika slug tidak ditemukan, tampilkan 404
  if (!content) {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section
        className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${content.heroImage}')` }}
      >
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-slate-900/65 z-0" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {content.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            {content.description}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px]">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              {/* Gambar Utama di atas */}
              {content.contentImage && (
                <div className="text-center mb-10">
                  {content.contentImageTitle && (
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#172135] mb-4">
                      {content.contentImageTitle}
                    </h2>
                  )}
                  <img
                    src={content.contentImage}
                    alt={content.title}
                    className="w-full max-w-xs md:max-w-xs mx-auto h-auto block object-contain"
                  />
                </div>
              )}
              <div className="prose prose-lg max-w-none">
                {content.content.map((paragraph, index) => (
                  <div key={index}>
                    <p
                      className="text-[#29364a] leading-relaxed mb-6 text-base md:text-lg"
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />

                    {/* Gambar Sisipan di sela paragraf */}
                    {content.inlineImages && content.inlineImages[index] && (
                      <figure className="my-6 text-center">
                        <img
                          src={content.inlineImages[index].src}
                          alt={content.inlineImages[index].caption || `Ilustrasi bagian ${index}`}
                          className="w-full max-w-md mx-auto h-auto rounded-xl mb-2 shadow-sm block"
                        />
                        {content.inlineImages[index].caption && (
                          <figcaption className="text-xs md:text-sm text-[#566276] italic mt-2">
                            {content.inlineImages[index].caption}
                          </figcaption>
                        )}
                      </figure>
                    )}
                  </div>
                ))}
              </div>

              {/* Tabel Data (Mendukung Multiple Tables) */}
              {content.tableData && content.tableData.map((table, tableIdx) => (
                <div key={tableIdx} className="mt-12 pt-8 overflow-x-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-[#172135] uppercase mb-2">
                      {table.title}
                    </h3>
                    <h4 className="text-lg md:text-xl font-bold text-[#172135] uppercase">
                      {table.subtitle}
                    </h4>
                  </div>

                  <table className="w-full text-left border-collapse min-w-[600px] mb-8">
                    <thead>
                      <tr className="border-y-2 border-gray-200">
                        <th className="py-4 px-4 font-bold text-[#172135] w-20 text-center">No.</th>
                        <th className="py-4 px-4 font-bold text-[#172135]">NAMA</th>
                        <th className="py-4 px-4 font-bold text-[#172135] w-48 text-center">TAHUN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-center text-[#566276] font-medium">{row.no}</td>
                          <td className="py-4 px-4 text-[#29364a] font-medium">{row.nama}</td>
                          <td className="py-4 px-4 text-center text-[#566276] font-medium">{row.tahun}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Call to Action */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-[#566276] text-sm">
                    Untuk informasi lebih lengkap, silakan hubungi kami.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#159447] text-white font-semibold rounded-lg hover:bg-[#0f7a36] transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft size={20} />
                    Kembali ke Beranda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Generate static params untuk semua slug yang ada
export async function generateStaticParams() {
  const slugs = Object.keys(contentData)

  return slugs.map((slug) => ({
    slug: slug,
  }))
}

// Generate metadata untuk SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = contentData[slug]

  if (!content) {
    return {
      title: '404 - Halaman Tidak Ditemukan | Pemerintah Kota Sukabumi',
      description: 'Halaman yang Anda cari tidak ditemukan.',
    }
  }

  return {
    title: `${content.title} | Pemerintah Kota Sukabumi`,
    description: content.description,
  }
}
