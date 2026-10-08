import Link from 'next/link'
import { ArrowLeft, Calendar, User, Image as ImageIcon } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'

// Fungsi untuk mencari data berita berdasarkan slug (Nantinya diganti fetch dari Database/API)
function getNewsBySlug(slug: string) {
  const allNews = [
    { slug: 'pelantikan-mui-2023', title: 'PELANTIKAN PENGURUS MUI KOTA SUKABUMI PERIODE 2023-2028 RESMI DISELENGGARAKAN', date: '25 Okt 2023', category: 'Agama', author: 'Diskominfo Kota Sukabumi', reporter: 'Rizki Firmansyah', reporterRole: 'Liputan Daerah', reporterImage: '', tags: ['Agama', 'Kelembagaan', 'Pemerintahan'], heroCaption: 'Suasana khidmat saat prosesi pelantikan pengurus MUI Kota Sukabumi periode 2023-2028. (Diskominfo/Rizki)', imageSource: 'Reuters' },
    { slug: 'vaksinasi-gratis-lansia', title: 'PROGRAM VAKSINASI GRATIS DAN CEK KESEHATAN LANSIA DI PUSKESMAS BAROS', date: '22 Okt 2023', category: 'Kesehatan', author: 'Dinas Kesehatan', reporter: 'Siti Rahmawati', reporterRole: 'Koresponden Kesehatan', reporterImage: '', tags: ['Kesehatan', 'Sosial', 'Layanan Publik'], heroCaption: 'Lansia di Kecamatan Baros antusias mengikuti program pemeriksaan kesehatan gratis. (Dinkes/Siti)', imageSource: 'Dinkes Kota Sukabumi' },
    { slug: 'kampanye-penghijauan-sungai', title: 'KAMPANYE PENGHIJAUAN DAN BERSIH SUNGAI CIKUNDUL BERSAMA MASYARAKAT', date: '19 Okt 2023', category: 'Lingkungan', author: 'DLH Kota Sukabumi', reporter: 'Ahmad Fauzi', reporterRole: 'Jurnalis Lingkungan', reporterImage: '', tags: ['Lingkungan', 'Sosial', 'Infrastruktur'], heroCaption: 'Aksi gotong royong warga dan aparat dalam membersihkan bantaran Sungai Cikundul. (DLH/Ahmad)', imageSource: 'DLH Kota Sukabumi' },
    { slug: 'distribusi-pupuk-subsidi', title: 'DISTRIBUSI PUPUK BERSUBSIDI UNTUK KELOMPOK TANI MULAI DILAKUKAN', date: '10 Okt 2023', category: 'Pertanian', author: 'DKP3 Kota Sukabumi', reporter: 'Dedi Supriadi', reporterRole: 'Koresponden Pangan', reporterImage: '', tags: ['Pertanian', 'Ekonomi', 'Pemerintahan'], heroCaption: 'Penyaluran pupuk bersubsidi langsung kepada perwakilan kelompok tani andalan daerah. (DKP3/Dedi)', imageSource: 'DKP3 Kota Sukabumi' },
    { slug: 'penyuluhan-hukum-gratis', title: 'PENYULUHAN HUKUM GRATIS UNTUK MASYARAKAT KOTA SUKABUMI TAHUN 2023', date: '02 Okt 2023', category: 'Hukum', author: 'Bagian Hukum Setda', reporter: 'Nurul Hidayah', reporterRole: 'Staf Liputan Khusus', reporterImage: '', tags: ['Hukum', 'Pemerintahan', 'Layanan Publik'], heroCaption: 'Masyarakat antusias menyimak materi penyuluhan bantuan hukum gratis dari Setda. (Setda/Nurul)', imageSource: 'Setda Kota Sukabumi' },
  ]
  return allNews.find(news => news.slug === slug)
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getNewsBySlug(slug)

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Spacer Navbar */}
      <div className="h-24 bg-[#1b293c]"></div>

      {/* Article Body */}
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
                    <User size={16} /> Diskominfo
                  </span>
                </div>

                {/* Share Action Bar */}
                <ShareButtons title={article.title} />
              </div>

              {/* Hero Image & Caption */}
              <figure className="mb-10 w-full">
                <div className="relative w-full h-[250px] md:h-[400px] rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm mb-3">
                  <ImageIcon size={64} opacity={0.3} />
                  <span className="ml-4 font-medium">Gambar Utama Berita</span>
                  {article.imageSource && (
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white/90 text-xs px-3 py-1.5 rounded-tl-lg backdrop-blur-sm">
                      {article.imageSource}
                    </div>
                  )}
                </div>
                {article.heroCaption && (
                  <figcaption className="text-sm md:text-base text-[#687991]">
                    {article.heroCaption}
                  </figcaption>
                )}
              </figure>

              {/* Content Typography */}
              <article className="prose prose-lg max-w-none">
                <p className="text-[#29364a] leading-relaxed text-base md:text-lg text-justify">
                  SUKABUMI — Pemerintah Kota Sukabumi terus berupaya meningkatkan kualitas pelayanan publik dan pembangunan infrastruktur secara merata. Hal ini sejalan dengan visi misi untuk mewujudkan masyarakat yang Inovatif, Mandiri, Agamis, dan Nasionalis.
                </p>
                <p className="text-[#29364a] leading-relaxed text-base md:text-lg text-justify">
                  Dalam kegiatan yang berlangsung pada tanggal {article.date} tersebut, berbagai elemen masyarakat turut hadir dan memberikan apresiasi atas langkah konkret yang telah diambil oleh jajaran pemerintahan terkait. Sinergi antara pemerintah dan warga menjadi kunci utama dalam mensukseskan program ini.
                </p>
                <p className="text-[#29364a] leading-relaxed text-base md:text-lg text-justify">
                  &quot;Kami berkomitmen untuk terus menghadirkan kebijakan yang berdampak langsung pada kesejahteraan warga. Program ini adalah salah satu bukti nyata kehadiran pemerintah di tengah masyarakat,&quot; ujar perwakilan dari {article.author} saat memberikan sambutan.
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-10">Langkah Strategis ke Depan</h2>
                <p className="text-[#29364a] leading-relaxed text-base md:text-lg text-justify">
                  Ke depannya, Pemerintah Kota Sukabumi akan terus melakukan evaluasi dan pemantauan secara berkala. Hal ini bertujuan untuk memastikan bahwa setiap program yang dijalankan tidak hanya bersifat seremonial, tetapi benar-benar memberikan manfaat yang berkelanjutan.
                </p>
                <ul className="text-[#29364a] space-y-2 text-base md:text-lg">
                  <li>Peningkatan koordinasi antar Organisasi Perangkat Daerah (OPD).</li>
                  <li>Pemberdayaan masyarakat lokal melalui edukasi dan sosialisasi.</li>
                  <li>Penyediaan ruang aspirasi yang lebih mudah diakses oleh warga.</li>
                </ul>
                <p className="text-[#29364a] leading-relaxed text-base md:text-lg text-justify">
                  Dengan semangat <em>Reugreug Pageuh Repeh Rapih</em>, diharapkan seluruh komponen kota dapat bersatu padu menghadapi berbagai tantangan pembangunan di masa yang akan datang.
                </p>
              </article>

              {/* Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex flex-wrap gap-3">
                    {article.tags.map((tag, idx) => (
                      <Link
                        key={idx}
                        href={`/berita?kategori=${encodeURIComponent(tag)}`}
                        className="inline-flex px-4 py-2 bg-transparent text-[#159447] text-sm font-bold rounded-full border border-[#159447] hover:bg-[#159447] hover:text-white transition-all"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Card */}
              {article.reporter && (
                <div className="mt-8 bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                  <h4 className="text-sm font-bold text-[#1d293d] mb-3">Penulis</h4>
                  <div className="flex items-center gap-3.5">
                    {/* Avatar Penulis */}
                    <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                      {article.reporterImage ? (
                        <img src={article.reporterImage} alt={article.reporter} className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} opacity={0.5} />
                      )}
                    </div>
                    {/* Info Penulis */}
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#159447] leading-tight">{article.reporter}</span>
                      <span className="text-xs font-medium text-slate-500 mt-0.5">{article.reporterRole || 'Reporter'}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
