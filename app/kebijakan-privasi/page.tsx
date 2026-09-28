import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Pemerintah Kota Sukabumi',
  description: 'Kebijakan Privasi dan Ketentuan Penggunaan Portal Resmi Pemerintah Kota Sukabumi.',
}

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section
        className="relative text-white pt-36 pb-20 md:pt-44 md:pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/privacy.webp')" }}
      >
        {/* Overlay transparan agar teks putih tetap terbaca */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            Pernyataan terkait perlindungan data, privasi, dan ketentuan penggunaan layanan portal.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="text-lg text-[#29364a] leading-relaxed text-justify">

                <p className="mb-6">
                  Website sukabumikota.go.id dimiliki oleh Pemerintah Daerah Kota Sukabumi, yang akan menjadi pengontrol atas data pribadi Anda.
                </p>

                <p className="mb-6">
                  Kami telah mengadopsi Kebijakan Privasi ini untuk menjelaskan bagaimana kami memproses informasi yang dikumpulkan oleh sukabumikota.go.id, yang juga menjelaskan alasan mengapa kami perlu mengumpulkan data pribadi tertentu tentang Anda. Oleh karena itu, Anda harus membaca Kebijakan Privasi ini sebelum menggunakan website sukabumikota.go.id.
                </p>

                <p className="mb-6">
                  Kami menjaga data pribadi Anda dan berjanji untuk menjamin kerahasiaan dan keamanannya..
                </p>
                <b>Informasi pribadi yang kami kumpulkan:</b>

                <p>
                  Saat Anda mengunjungi sukabumikota.go.id, kami secara otomatis mengumpulkan informasi tertentu mengenai perangkat Anda, termasuk informasi tentang browser web, alamat IP, zona waktu, dan sejumlah cookie yang terinstal di perangkat Anda. Selain itu, selama Anda menjelajahi Website, kami mengumpulkan informasi tentang setiap halaman web atau produk yang Anda lihat, website atau istilah pencarian apa yang mengarahkan Anda ke Website, dan cara Anda berinteraksi dengan Website. Kami menyebut informasi yang dikumpulkan secara otomatis ini sebagai “Informasi Perangkat”. Kemudian, kami mungkin akan mengumpulkan data pribadi yang Anda berikan kepada kami (termasuk tetapi tidak terbatas pada, Nama, Nama belakang, Alamat, informasi pembayaran, dll.) selama pendaftaran untuk dapat memenuhi perjanjian.
                </p><br></br>

                <b>Mengapa kami memproses data Anda?</b><br></br>
                <p>
                  Menjaga data pelanggan agar tetap aman adalah prioritas utama kami. Oleh karena itu, kami hanya dapat memproses sejumlah kecil data pengguna, sebanyak yang benar-benar diperlukan untuk menjalankan website. Informasi yang dikumpulkan secara otomatis hanya digunakan untuk mengidentifikasi kemungkinan kasus penyalahgunaan dan menyusun informasi statistik terkait penggunaan website. Informasi statistik ini tidak digabungkan sedemikian rupa hingga dapat mengidentifikasi pengguna tertentu dari sistem.
                </p> <br></br>

                <p>
                  Anda dapat mengunjungi website tanpa memberi tahu kami identitas Anda atau mengungkapkan informasi apa pun, yang dapat digunakan oleh seseorang untuk mengidentifikasi Anda sebagai individu tertentu yang dapat dikenali. Namun, jika Anda ingin menggunakan beberapa fitur website, atau Anda ingin menerima newsletter kami atau memberikan detail lainnya dengan mengisi formulir, Anda dapat memberikan data pribadi kepada kami, seperti email, nama depan, nama belakang, kota tempat tinggal, organisasi, dan nomor telepon Anda. Anda dapat memilih untuk tidak memberikan data pribadi Anda kepada kami, tetapi Anda mungkin tidak dapat memanfaatkan beberapa fitur website. Contohnya, Anda tidak akan dapat menerima Newsletter kami atau menghubungi kami secara langsung dari website. Pengguna yang tidak yakin tentang informasi yang wajib diberikan dapat menghubungi kami melalui hover <a href="mailto:[EMAIL_ADDRESS]" className="text-blue-600 hover:underline">helpdesk@sukabumikota.go.id</a>.
                </p> <br></br>

                <b>Hak-hak Anda:</b>
                <p>Jika Anda seorang warga Eropa, Anda memiliki hak-hak berikut terkait data pribadi Anda:</p> <br></br>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Hak untuk mendapatkan penjelasan.</li>
                  <li>Hak atas akses.</li>
                  <li>Hak untuk memperbaiki.</li>
                  <li>Hak untuk menghapus.</li>
                  <li>Hak untuk membatasi pemrosesan.</li>
                  <li>Hak atas portabilitas data.</li>
                  <li>Hak untuk menolak.</li>
                  <li>Hak-hak terkait pengambilan keputusan dan pembuatan profil otomatis.</li>
                </ul>
                <br></br>

                <p>
                  Jika Anda ingin menggunakan hak ini, silakan hubungi kami melalui informasi kontak di bawah ini.
                </p>
                <br></br>

                <p>
                  Selain itu, jika Anda seorang warga Eropa, perlu diketahui bahwa kami akan memproses informasi Anda untuk memenuhi kontrak yang mungkin kami miliki dengan Anda (misalnya, jika Anda melakukan pemesanan melalui Website), atau untuk memenuhi kepentingan bisnis sah kami seperti yang tercantum di atas. Di samping itu, harap diperhatikan bahwa informasi Anda mungkin dapat dikirim ke luar Eropa, termasuk Kanada dan Amerika Serikat.
                </p>
                <br />

                <b>Link ke website lain:</b>
                <p>
                  Website kami mungkin berisi tautan ke website lain yang tidak dimiliki atau dikendalikan oleh kami. Perlu diketahui bahwa kami tidak bertanggung jawab atas praktik privasi website lain atau pihak ketiga. Kami menyarankan Anda untuk selalu waspada ketika meninggalkan website kami dan membaca pernyataan privasi setiap website yang mungkin mengumpulkan informasi pribadi.
                </p>
                <br />

                <b>Keamanan informasi:</b>
                <p>
                  Kami menjaga keamanan informasi yang Anda berikan pada server komputer dalam lingkungan yang terkendali, aman, dan terlindungi dari akses, penggunaan, atau pengungkapan yang tidak sah. Kami menjaga pengamanan administratif, teknis, dan fisik yang wajar untuk perlindungan terhadap akses, penggunaan, modifikasi, dan pengungkapan tidak sah atas data pribadi dalam kendali dan pengawasannya. Namun, kami tidak menjamin tidak akan ada transmisi data melalui Internet atau jaringan nirkabel.
                </p><br></br>

                <b>Pengungkapan hukum:</b>
                <p>
                  Kami akan mengungkapkan informasi apa pun yang kami kumpulkan, gunakan, atau terima jika diwajibkan atau diizinkan oleh hukum, misalnya untuk mematuhi panggilan pengadilan atau proses hukum serupa, dan jika kami percaya dengan itikad baik bahwa pengungkapan diperlukan untuk melindungi hak kami, melindungi keselamatan Anda atau keselamatan orang lain, menyelidiki penipuan, atau menanggapi permintaan dari pemerintah.
                </p><br></br>

                <b>Informasi kontak:</b>
                <p>
                  Jika Anda ingin menghubungi kami untuk mempelajari Kebijakan ini lebih lanjut atau menanyakan masalah apa pun yang berkaitan dengan hak perorangan dan Informasi pribadi Anda, Anda dapat mengirim email ke <a href="mailto:[EMAIL_ADDRESS]" className="text-blue-600 hover:underline">helpdesk@sukabumikota.go.id</a>
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
