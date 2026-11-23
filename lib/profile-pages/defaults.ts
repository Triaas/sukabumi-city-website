import { leadersList } from '@/data/leadersData';
import type { ProfilePageData, ProfilePageSlug } from './types';

export const DEFAULT_PROFILE_PAGES: Record<ProfilePageSlug, ProfilePageData> = {
  sejarah: {
    slug: 'sejarah',
    title: 'Sejarah Kota Sukabumi',
    description: 'Jejak perkembangan Kota Sukabumi dari masa ke masa',
    heroImage: '/images/sejarah-card.jpg',
    heroImageFit: 'cover',
    contentImage: '/images/soek4bum01.jpg',
    contentImageTitle: null,
    contentImageCaption:
      'Rumah dinas residen (Residentswoning) Sukabumi tempo dulu',
    contentHtml: `<p>Kota Sukabumi berasal dari bahasa Sunda. Yaitu Suka-Bumen, menurut keterangan mengingat udaranya yang sejuk dan nyaman, mereka yang dating ke daerah ini tidak ingin untuk pindah lagi karena suka/ senang Bumen-Bumen atau bertempat tinggal di daerah ini.</p>
<p>Pada tahun 1914 Pemerintah Hindia Belanda menjadikan Kota Sukabumi sebagai “Burgerlijk Bestuur” dengan status “Gemeente” dennan alasan bahwa di kota ini banyak berdiam orang-orang Belanda dan Eropa pemlik perkebunan-perkebunan yang berada di daerah Kabupaten Sukabumi bagian Selatan yang harus mendapatkan pengurusan dan pelayanan yang istimewa.</p>
<p>Sejak ditetapkannya Sukabumi menjadi daerah otonomi pada bulan Mei 1926 makaresmi diangkat “Burgemeester” yaitu Mr. GF. Rambonnet. Pada masa ini dibangun stasiun kereta api, Mesjid Agung, Gereja dan Pembangkit Listrik. Setelah Mr. GF. Rambonnet memerintah ada tiga “Burgemesteester” sebagai penggantinya yaitu : Mr. WM Ouwekerk, Mr. A LA Van Unendan, dan Mr. W.J PH Van Waning.</p>
<figure class="my-6 text-center">
  <img src="/images/soek4bum04.jpg" alt="Jalan Stasiun, Mei 1926 - Kini Jalan Zainal Zakse dilihat dari arah sebelah Barat" class="w-full max-w-md mx-auto h-auto rounded-xl mb-2 shadow-sm block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-2 text-center">Jalan Stasiun, Mei 1926 – Kini Jalan Zainal Zakse dilihat dari arah sebelah Barat</figcaption>
</figure>`,
    extraData: {
      contentImageClassName:
        'w-full max-w-md mx-auto h-auto rounded-xl shadow-sm block',
      quickLinks: [
        { label: 'Sejarah', targetId: 'sejarah-content' },
        { label: 'Nomenklatur', targetId: 'nomenklatur' },
        { label: 'Pimpinan', targetId: 'hall-of-fame' },
      ],
      timelineData: {
        title: 'Perkembangan Nomenklatur Kota Sukabumi',
        items: [
          {
            period: '1914 - 1942',
            title: 'Gemeente Soeka Boemi',
            badge: 'Staatsblad 1914 No. 310',
            description:
              'Ditetapkan pada 1 April 1914. Berstatus Kotapraja Burgerlijk Bestuur dengan Burgemeester Eropa untuk melayani eksklusivitas fasilitas para pemilik perkebunan.',
          },
          {
            period: '1942 - 1945',
            title: 'Soekaboemi SHI',
            badge: 'Pemerintahan Gunseikanbu',
            description:
              'Reorganisasi di bawah militer Jepang. Jabatan Burgemeester dibubarkan, diganti dengan Shityo yang diisi oleh elite birokrat pribumi pertama kalinya.',
          },
          {
            period: '1950',
            title: 'Kota Kecil Sukabumi',
            badge: 'UU No. 17 Tahun 1950',
            description:
              'Diundangkan pada 14 Agustus 1950. Menjadi tonggak restrukturisasi wilayah administrasi sipil pasca-kemerdekaan RI dalam lingkup desentralisasi awal.',
          },
          {
            period: '1957',
            title: 'Kota Praja Sukabumi',
            badge: 'UU No. 1 Tahun 1957',
            description:
              'Implementasi kebijakan Pokok-Pokok Pemerintahan Daerah. Melembagakan kemandirian otonom dan pembentukan awal institusi legislatif lokal (DPRD).',
          },
          {
            period: '1965',
            title: 'Kotamadya Sukabumi',
            badge: 'UU No. 18 Tahun 1965',
            description:
              'Perubahan nomenklatur di masa transisi politik bergejolak (Orde Lama ke Orde Baru), menandai kembalinya paradigma sentralisasi pemerintahan daerah.',
          },
          {
            period: '1974',
            title: 'Kotamadya DT II Sukabumi',
            badge: 'UU No. 5 Tahun 1974',
            description:
              'Puncak era sentralisasi Orde Baru (Dekonsentrasi). Kota difungsikan murni sebagai subordinat pelaksana administratif dari Provinsi Jawa Barat.',
          },
          {
            period: '1999',
            title: 'Kota Sukabumi',
            badge: 'UU No. 22 Tahun 1999',
            description:
              "Penghapusan hierarki 'Tingkat II'. Lahirnya era Reformasi yang mengembalikan kedaulatan mutlak otonomi yang luas, nyata, dan bertanggung jawab.",
          },
          {
            period: '2004 - Sekarang',
            title: 'Kota Sukabumi',
            badge: 'UU No. 32/2004 & UU 23/2014',
            description:
              'Penguatan demokrasi lokal melalui sistem Pilkada Langsung dan modernisasi birokrasi, mengamankan hak tata kelola keuangan, perizinan, serta pelayanan digital terpadu.',
          },
        ],
      },
      leadersData: {
        title: 'Nama-Nama Pimpinan Pemerintahan Daerah',
        items: leadersList,
      },
    },
  },

  'visi-misi': {
    slug: 'visi-misi',
    title: 'Visi dan Misi',
    description: 'Arah pembangunan dan tujuan yang ingin dicapai Kota Sukabumi',
    heroImage: '/images/visi misi-card.jpg',
    heroImageFit: 'cover',
    contentImage: '/images/Lambang_Kota_Sukabumi.png',
    contentImageTitle: 'WALI KOTA SUKABUMI',
    contentImageCaption: null,
    contentHtml: `<p><strong>VISI</strong><br/><br/>"Terwujudnya Masyarakat Kota Sukabumi yang Inovatif, Mandiri, Agamis, Nasionalis"</p>
<p><strong>MISI</strong><br/><br/>1. Pengembangan sumber daya manusia dan keterampilan masyarakat berbasis vokasi serta peningkatan kualitas pelayanan kesehatan masyarakat;<br/>2. Pengamalan nilai-nilai agama, sosial, budaya, dan memperkuat toleransi, ketenteraman serta ketertiban umum;<br/>3. Pengembangan ekonomi kreatif dan pariwisata;<br/>4. Peningkatan kualitas lingkungan dan infrastruktur publik;<br/>5. Penguatan tata kelola pemerintahan untuk pelayanan publik berkualitas.</p>
<p><strong>Visi Pembangunan Kota Sukabumi Tahun 2025-2045 yang termuat dalam RPJPD Kota Sukabumi Tahun 2025-2045 yaitu :</strong><br/><br/>“Sukabumi Kota Kreatif, Unggul, Berbudaya dan Berkelanjutan”</p>
<p><strong>MISI</strong><br/><br/>1. Mengembangkan Sumber Daya Manusia yang Berakhlak dan Berdaya Saing;;<br/>2. Mempercepat Transformasi Ekonomi yang Inklusif dan Berkeadilan;;<br/>3. Menguatkan Tata Kelola Pemerintahan yang Modern dan Inovatif;;<br/>4. PMeningkatkan Stabilitas Ketenteraman dan Ketertiban Umum;<br/>5.Mewujudkan Masyarakat yang Religius, Berbudaya dan Ramah Lingkungan;<br/>6. Menyediakan Infrastrukur yang Merata dan Berkelanjutan;<br/>7. Menyiapkan Sarana dan Prasarana Perkotaan Berkualitas;<br/>8. Mewujudkan Kesinambungan Pembangunan.</p>`,
    extraData: {},
  },

  lambang: {
    slug: 'lambang',
    title: 'Lambang Kota Sukabumi',
    description: 'Makna filosofis di balik lambang resmi daerah',
    heroImage: '/images/Lambang_Kota_Sukabumi.png',
    heroImageFit: 'contain',
    contentImage: '/images/Lambang_Kota_Sukabumi.png',
    contentImageTitle: null,
    contentImageCaption: null,
    contentHtml: `<p>Lambang Kota Sukabumi memiliki makna filosofis yang mendalam dan mencerminkan identitas serta cita-cita masyarakat Sukabumi.</p>`,
    extraData: {
      contentImageClassName: 'max-w-[220px] md:max-w-[260px]',
      meaningItems: [
        {
          title: 'Perisai',
          desc: 'Melambangkan Ketangguhan Fisik dan Mental dalam menghadapi segala tantangan pembangunan.',
          image: '/images/perisai.png',
        },
        {
          title: 'Warna Hijau',
          desc: 'Merupakan perlambangan dari Kesuburan dan Kemakmuran alam di Kota Sukabumi.',
          image: '/images/hijau.png',
        },
        {
          title: 'Bintang Segi Lima',
          desc: 'Perlambangan PANCASILA yang merupakan Dasar Negara Kesatuan Republik Indonesia.',
          image: '/images/bintang.png',
        },
        {
          title: 'Kujang',
          desc: 'Senjata Pusaka Luhur Bangsa Indonesia di Daerah Pasundan, bertindak sebagai lambang keberanian.',
          image: '/images/kujang.png',
        },
        {
          title: 'Setangkai Padi & Teh',
          desc: 'Perlambangan Ketentraman dan Perdamaian bagi seluruh lapisan masyarakat.',
          image: '/images/padi dan teh.png',
        },
        {
          title: 'Pita Merah Putih',
          desc: 'Melambangkan Kebangsaan Indonesia yang kokoh dan tak tergoyahkan.',
          image: '/images/pita merah putih.png',
        },
        {
          title: 'Motto "Reugreug Pageuh Repeh Rapih"',
          desc: 'Bermakna Tangguh, Kukuh, Aman, Tentram, dan Bersatu padu.',
          image: '/images/motto.png',
        },
      ],
    },
  },

  geografi: {
    slug: 'geografi',
    title: 'Geografi Kota Sukabumi',
    description: 'Letak wilayah, kondisi geografis, serta demografi Kota Sukabumi.',
    heroImage: '/images/geo-card.jpg',
    heroImageFit: 'cover',
    contentImage: null,
    contentImageTitle: null,
    contentImageCaption: null,
    contentHtml: `<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-2">Posisi dan Peran Strategis</h2>
<p>Daerah merupakan sebuah kota terkecil ketiga (setelah Kota Cirebon dan Kota Cimahi) di Provinsi Jawa Barat. Daerah merupakan dataran tinggi terletak pada posisi 106 ˚45’50” Bujur Timur dan 106˚45’10” Bujur Timur,6˚50’44” Lintang Selatan, di kaki Gunung Gede dan Gunung Pangrango yang ketinggiannya 584 meter di atas permukaan laut, dan berjarak 120 Km dari Jakarta serta 96 Km dari Ibukota Provinsi Jawa Barat (Kota Bandung). Adapun batas wilayahnya adalah sebagai berikut:</p>
<p>1. Sebelah utara berbatasan dengan Kecamatan Sukabumi, Kabupaten Sukabumi;<br/>2. Sebelah selatan berbatasan dengan Kecamatan Nyalindung, Kabupaten Sukabumi;<br/>3. Sebelah barat berbatasan dengan Kecamatan Cisaat, Kabupaten Sukabumi;<br/>4. Sebelah timur berbatasan dengan Kecamatan Sukaraja, Kabupaten Sukabumi.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">Peta Administrasi Kota Sukabumi</h3>
  </div>
  <img src="/images/peta_kota_sukabumi.jpg" alt="Peta Administrasi Kota Sukabumi" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: Bappeda Kota Sukabumi, 2025</figcaption>
</figure>
<p>Wilayah administrasi Daerah terdiri dari 7 kecamatan, yaitu Kecamatan Baros dengan luas 5,58 km², Kecamatan Lembursitu 10.70 km², Kecamatan Cibeureum 9,13 km², Kecamatan Citamiang 4,00 km², Kecamatan Warudoyong 7,56 km², Kecamatan Gunungpuyuh 5,13 km², dan Kecamatan Cikole 6,21 km². Adapun jumlah wilayah administrasi di bawah kecamatan terdiri dari 33 kelurahan, 357 rukun warga dan 1.576 rukun tetangga.</p>
<p>Meskipun berada di kaki gunung, letak Daerah cukup strategis karena berada pada jalur lintasan Ibukota Provinsi Jawa Barat dengan Daerah Khusus Jakarta. Dalam konstelasi sebagai pusat kegiatan wilayah Jawa Barat yang berada di dalam jalur lintasan Jabodetabek dan Bandung Raya, Daerah mempunyai peran yang cukup signifikan dalam pengembangan sektor ekonomi dan sosial kawasan. Karena itu, Daerah sangat berpeluang dalam pengembangan perekonomian daerah dan masyarakat. Di samping itu, Daerah juga dapat berperan lebih besar dalam memenuhi kebutuhan investasi, konsumsi, dan distribusi bagi wilayah sekitarnya. Sebagai kota dengan luas wilayah yang relatif kecil, Daerah masih berpotensi untuk dikembangkan lagi secara optimal. Pola penggunaan lahan di Daerah tahun 2018 berdasarkan pada hasil pengamatan lapangan dan interpretasi dari foto citra didominasi oleh kegiatan sawah, bangunan permukiman kota, kebun campuran, dan bangunan industri, perdagangan dan perkantoran. Penggunaan lahan terluas yaitu untuk bangunan permukiman kota seluas 1.736,63 Ha atau 35,93 persen dari luas wilayah. Penggunaan lahan sawah seluas 1.661,03 Ha atau seluas 34,37 persen dari total luas wilayah Sedangkan bangunan industri, perdagangan dan perkantoran seluas 340,66 Ha atau 7,05 persen dari luas wilayah</p>
<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-12 border-t border-slate-200 pt-8">Potensi Sumber Daya Alam</h2>
<p>Daerah tidak dianugerahi kekayaan alam yang melimpah. Dengan karakteristik geografis dan kewilayahan yang dimiliki, Daerah hanya memiliki potensi kekayaan alam terutama pada sektor pertanian</p>
<p>Pertanian ini masih dominan pada sebagian wilayah yang bersifat perdesaan, meskipun Daerah berstatus kota. Luas kawasan pertanian di Daerah sekitar 34,37 persen dari luas total wilayah. Pertanian yang terdapat di Daerah pun juga terbatas pada sub sektor tanaman pangan dan hortikultura. Tanaman pangan yang ada mayoritas berupa padi. Sedangkan tanaman hortikultura antara lain tanaman sayuran, buah-buahan, biofarmaka dan tanaman hias.</p>
<p>Produksi padi Daerah menunjukkan penurunan yang signifikan di tahun 2022, yaitu berkurang sekitar 2.176 ton. Namun pada tahun 2024, produksi padinya meningkat sebesar 20.882 ton, jika dibandingkan tahun sebelumnya.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">Produksi Padi dan Luas Panen Sawah di Kota Sukabumi Tahun 2020–2024</h3>
  </div>
  <img src="/images/Produksi Padi dan Luas Panen Sawah.jpg" alt="Produksi Padi dan Luas Panen Sawah di Kota Sukabumi Tahun 2020-2024" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: BPS Kota Sukabumi, 2025 (diolah)</figcaption>
</figure>
<p>Meskipun mengalami kenaikan produksi, ancaman penurunan luas lahan sawah di Daerah cukup besar sebagai akibat dari pembangunan kota yang makin masif. Kebutuhan ruang untuk aktivitas perdagangan dan jasa serta perumahan dan permukiman tidak dapat dihindari. Kondisi demikian diperburuk dengan keberadaan Jalan Tol Bocimi yang akan memberikan ancaman lebih pada keberadaan lahan sawah. Oleh karena itu, upaya untuk menjaga dan meningkatkan produktivitas pertanian perlu dilakukan. Upaya tersebut antara lain dengan memanfaatkan kemajuan ilmu pengetahuan dan teknologi yang telah ada secara optimal serta menggalakkan urban farming.</p>
<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-12 border-t border-slate-200 pt-8">Daya Dukung dan Daya Tampung Lingkungan Hidup</h2>
<p>Kebutuhan air di Daerah cenderung meningkat seiring dengan meningkatnya aktivitas ekonomi dan bertambahnya jumlah penduduk. Untuk memenuhi kebutuhan air tersebut dipenuhi dengan mengandalkan sumber dari air hujan dan air permukaan.</p>
<p>Berdasarkan data Dinas Pekerjaan Umum dan Tata Ruang, Daerah memiliki jumlah curah hujan tahunan sekitar 10.528 mm pada stasiun ciaul 4.078 mm, pada stasiun cimandiri 3164 dan pada stasiun situmekar 3.286 mm. Adapun sungai yang melintasi Daerah sebanyak 29 sungai dengan panjang total sungai 113,8 km. Sungai tersebut terdiri dari 1 induk sungai cimandiri dan 5 anak sungai yang terdiri dari sungai cipelang, sungai cipanengah, sungai tonjong, sungai cisuda, dan sungai ceger serta 23 sungai kecil yang bermuara ke-5 anak sungai tersebut. Sungai-sungai tersebut memiliki kapasitas berkisar antara 17 m3/detik sampai 1.981 m3/detik. Sistem aliran sungai terdiri dari orde-1 sampai orde 4 yang semua sungai bermuara ke sungai sungai cimandiri. Berdasarkan hasil perhitungan ambang batas daya dukung lingkungan hidup air di Daerah, ambang batas tinggi sebagian besar tersebar pada bagian tengah dan selatan, sementara ambang batas rendah sebagian besar terdapat di wilayah barat dan timur. Daerah dengan ambang batas rendah rentan terhadap kelangkaan air dimasa mendatang. Daerah yang memiliki status daya dukung penyedia air terlampaui berada pada bagian barat, tengah, serta timur. Secara keseluruhan status daya dukung air di Daerah sebagian besar masih belum terlampaui (3.037,44 Ha).</p>
<div class="mt-12 overflow-x-auto">
  <div class="text-center mb-4">
    <h3 class="text-lg font-bold text-[#172135]">Status Daya Dukung dan Daya Tampung Air Kota Sukabumi Tahun 2022</h3>
  </div>
  <table class="w-full text-sm text-left border-collapse border border-slate-300 min-w-[600px] mb-2 shadow-sm">
    <thead>
      <tr class="bg-slate-100">
        <th rowspan="2" class="border border-slate-300 py-3 px-4 text-center align-middle font-bold text-[#172135]">KECAMATAN</th>
        <th colspan="2" class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">STATUS DAYA DUKUNG DAN TAMPUNG AIR (Ha)</th>
        <th rowspan="2" class="border border-slate-300 py-3 px-4 text-center align-middle font-bold text-[#172135]">TOTAL (Ha)</th>
      </tr>
      <tr class="bg-slate-100">
        <th class="border border-slate-300 py-2 px-4 text-center font-bold text-[#172135]">BELUM TERLAMPAUI</th>
        <th class="border border-slate-300 py-2 px-4 text-center font-bold text-[#172135]">SUDAH TERLAMPAUI</th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Baros</td><td class="border border-slate-300 py-2 px-4 text-center">306,63</td><td class="border border-slate-300 py-2 px-4 text-center">251,58</td><td class="border border-slate-300 py-2 px-4 text-center">558</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Lembursitu</td><td class="border border-slate-300 py-2 px-4 text-center">671,44</td><td class="border border-slate-300 py-2 px-4 text-center">398,72</td><td class="border border-slate-300 py-2 px-4 text-center">1.070</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Cibeureum</td><td class="border border-slate-300 py-2 px-4 text-center">308,43</td><td class="border border-slate-300 py-2 px-4 text-center">604,94</td><td class="border border-slate-300 py-2 px-4 text-center">913</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Citamiang</td><td class="border border-slate-300 py-2 px-4 text-center">332,52</td><td class="border border-slate-300 py-2 px-4 text-center">67,87</td><td class="border border-slate-300 py-2 px-4 text-center">400</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Warudoyong</td><td class="border border-slate-300 py-2 px-4 text-center">449,76</td><td class="border border-slate-300 py-2 px-4 text-center">306,62</td><td class="border border-slate-300 py-2 px-4 text-center">756</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Gunung Puyuh</td><td class="border border-slate-300 py-2 px-4 text-center">426,31</td><td class="border border-slate-300 py-2 px-4 text-center">87,30</td><td class="border border-slate-300 py-2 px-4 text-center">513</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Cikole</td><td class="border border-slate-300 py-2 px-4 text-center">542,34</td><td class="border border-slate-300 py-2 px-4 text-center">78,46</td><td class="border border-slate-300 py-2 px-4 text-center">621</td></tr>
      <tr class="font-bold bg-slate-100"><td class="border border-slate-300 py-2 px-4">Kota Sukabumi</td><td class="border border-slate-300 py-2 px-4 text-center">3.037,44</td><td class="border border-slate-300 py-2 px-4 text-center">1.795,49</td><td class="border border-slate-300 py-2 px-4 text-center">4.831</td></tr>
    </tbody>
  </table>
  <p class="text-xs text-[#566276] italic text-left">Sumber: RPPLH Kota Sukabumi Tahun 2022-2052</p>
</div>
<div class="mt-12 overflow-x-auto">
  <div class="text-center mb-4">
    <h3 class="text-lg font-bold text-[#172135]">Status Daya Dukung dan Daya Tampung Pangan Kota Sukabumi Tahun 2022</h3>
  </div>
  <table class="w-full text-sm text-left border-collapse border border-slate-300 min-w-[600px] mb-2 shadow-sm">
    <thead>
      <tr class="bg-slate-100">
        <th rowspan="2" class="border border-slate-300 py-3 px-4 text-center align-middle font-bold text-[#172135]">KECAMATAN</th>
        <th colspan="2" class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">STATUS DAYA DUKUNG DAN TAMPUNG PANGAN (Ha)</th>
        <th rowspan="2" class="border border-slate-300 py-3 px-4 text-center align-middle font-bold text-[#172135]">TOTAL (Ha)</th>
      </tr>
      <tr class="bg-slate-100">
        <th class="border border-slate-300 py-2 px-4 text-center font-bold text-[#172135]">BELUM TERLAMPAUI</th>
        <th class="border border-slate-300 py-2 px-4 text-center font-bold text-[#172135]">SUDAH TERLAMPAUI</th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Baros</td><td class="border border-slate-300 py-2 px-4 text-center">198,88</td><td class="border border-slate-300 py-2 px-4 text-center">351,28</td><td class="border border-slate-300 py-2 px-4 text-center">558</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Lembursitu</td><td class="border border-slate-300 py-2 px-4 text-center">465,71</td><td class="border border-slate-300 py-2 px-4 text-center">605,41</td><td class="border border-slate-300 py-2 px-4 text-center">1.070</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Cibeureum</td><td class="border border-slate-300 py-2 px-4 text-center">458,84</td><td class="border border-slate-300 py-2 px-4 text-center">464,65</td><td class="border border-slate-300 py-2 px-4 text-center">913</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Citamiang</td><td class="border border-slate-300 py-2 px-4 text-center">28,30</td><td class="border border-slate-300 py-2 px-4 text-center">374,97</td><td class="border border-slate-300 py-2 px-4 text-center">400</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Warudoyong</td><td class="border border-slate-300 py-2 px-4 text-center">205,13</td><td class="border border-slate-300 py-2 px-4 text-center">551,79</td><td class="border border-slate-300 py-2 px-4 text-center">756</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Gunung Puyuh</td><td class="border border-slate-300 py-2 px-4 text-center">76,18</td><td class="border border-slate-300 py-2 px-4 text-center">435,93</td><td class="border border-slate-300 py-2 px-4 text-center">513</td></tr>
      <tr class="hover:bg-slate-50 transition-colors"><td class="border border-slate-300 py-2 px-4">Cikole</td><td class="border border-slate-300 py-2 px-4 text-center">44,67</td><td class="border border-slate-300 py-2 px-4 text-center">573,19</td><td class="border border-slate-300 py-2 px-4 text-center">621</td></tr>
      <tr class="font-bold bg-slate-100"><td class="border border-slate-300 py-2 px-4">Kota Sukabumi</td><td class="border border-slate-300 py-2 px-4 text-center">1.475,72</td><td class="border border-slate-300 py-2 px-4 text-center">3.357,22</td><td class="border border-slate-300 py-2 px-4 text-center">4.831</td></tr>
    </tbody>
  </table>
  <p class="text-xs text-[#566276] italic text-left">Sumber: RPPLH Kota Sukabumi Tahun 2022-2052</p>
</div>
<p>Status daya dukung lingkungan hidup pangan dianalisis berdasarkan hasil perhitungan selisih antara ambang batas dengan jumlah penduduk di setiap grid. Nilai selisih ambang batas yang negatif menunjukkan bahwa ambang batas pangan di grid tersebut telah terlampaui, artinya jumlah penduduk yang dapat dipenuhi kebutuhan pangannya lebih kecil dibandingkan dengan jumlah penduduk yang tinggal di grid tersebut, demikian sebaliknya. Berdasarkan hal itu untuk total status daya dukung pangan belum terlampaui di Daerah sebesar 1.475,72 Ha, dan untuk total status terlampaui di Daerah sebesar 3.357,22 Ha.</p>
<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-12 border-t border-slate-200 pt-8">Berketahanan Energi, Air, dan Pangan</h2>
<p>Berketahanan energi, air, dan pangan merupakan kemampuan suatu daerah untuk memastikan ketersediaan, keterjangkauan, dan keberlanjutan dari tiga kebutuhan dasar energi, air, dan pangan dalam jangka panjang. Dalam kondisi atau situasi krisis atau gangguan eksternal (seperti perubahan iklim, konflik, atau bencana alam) ketiga kebutuhan dasar tersebut tetap harus dipenuhi.</p>
<p>Ketahanan energi yang menunjukkan kemampuan untuk memastikan pasokan energi yang stabil dan terjangkau (listrik) di Daerah sudah mencapai angka 99,99 persen di tahun 2024. Jumlah pelanggan listrik dari tahun ke tahun terus mengalami peningkatan.</p>
<p>Pada tahun 2020 pelanggan listrik di Daerah sebanyak 169.480 danmeningkat menjadi 191.904 pada tahun 2024. Penggunaan listrik di Daerahpada tahun 2024 dilihat dari listrik terjual adalah sebesar 329.812.719 KWh. Hal ini menunjukkan bahwa hampir seluruh masyarakat di Daerah sudah menikmati aliran listrik.</p>
<p>Ketahanan air ditujukan untuk menjamin hak atas air bagi semua dan menjaga keberlangsungan lingkungan hidup dengan menyediakan air bersih yang cukup untuk kebutuhan rumah tangga, pertanian, industri, dan ekosistem. Kondisi ketahanan air di Daerah ini dapat dilihat berdasarkan persentase rumah tangga yang memiliki akses terhadap sumber air minum layak.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">Persentase RT yang Memiliki Akses Air Minum Layak di Kota Sukabumi Tahun 2021-2024 (Persen)</h3>
  </div>
  <img src="/images/Persentase RT.jpg" alt="Persentase RT yang Memiliki Akses Air Minum Layak di Kota Sukabumi Tahun 2021-2024 (Persen)" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: BPS Provinsi Jawa Barat, 2025 (diolah)</figcaption>
</figure>
<p>Dari gambar di atas, terlihat bahwa persentase rumah tangga yang memiliki akses air minum layak di Daerah sudah melebihi capaian Provinsi Jawa Barat. Kondisi ini perlu ditingkatkan agar capaiannya mencapai 100 persen sehingga hak setiap warga akan air minum layak terpenuhi semuanya</p>
<p>Dari sisi ketahanan pangan, pemenuhan pangan merupakan hak setiap warga negara yang harus dijamin kuantitas dan kualitasnya, aman dan bergizi. Ketahanan pangan ini merupakan rangkaian dalam menyediakan pangan untuk masyarakat agar menghasilkan sumber daya manusia yang sehat, aktif, produktif, dan berdaya saing.</p>
<p>Indeks ketahanan pangan di Daerah cenderung meningkat dan masuk dalam kategori baik meskipun masih di bawah capaian Provinsi Jawa Barat. Daerah yang berstatus kota, namun ketersediaan pangan sebagian juga dipenuhi dari hasil produksi sendiri. Jika aspek tersebut dimasukkan dalam perhitungan, indeks ketahanan pangan di Daerah diperkirakan akan semakin baik. Jika dibandingkan dengan kota yang ada di Provinsi JawaBarat, indeks ketahanan pangan di Daerah hanya lebih baik dari Kota Tasikmalaya. Karena itu, upaya untuk meningkatkan ketahanan pangan perlu terus dilakukan terutama pada aspek pemanfaatan yang angkanya masih di bawah angka indeks ketahanan pangan.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">Indeks Ketahanan Pangan Kota Sukabumi Tahun 2021-2024 (Poin)</h3>
  </div>
  <img src="/images/Indeks Ketahanan Pangan.jpg" alt="Indeks Ketahanan Pangan Kota Sukabumi Tahun 2021-2024 (Poin)" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: Badan Ketahanan Pangan, 2025 (diolah)</figcaption>
</figure>
<p>Prevalensi ketidakcukupan konsumsi pangan, atau <i>Prevalence of Undernourishment</i>, adalah persentase penduduk yang asupan energinya tidak cukup untuk memenuhi kebutuhan minimum guna menjalani kehidupan yang sehat dan aktif. Ini adalah indikator penting untuk mengukur tingkat kerawanan pangan dan gizi.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">Prevalensi Ketidacukupan Konsumsi Pangan Kota Sukabumi Tahun 2020-2023 (Persen)</h3>
  </div>
  <img src="/images/Prevalensi Ketidacukupan Konsumsi.jpg" alt="Prevalensi Ketidacukupan Konsumsi Pangan Kota Sukabumi Tahun 2020-2023 (Persen)" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: BPS Provinsi Jawa Barat, 2025 (diolah)</figcaption>
</figure>
<p>Prevalensi ketidakcukupan konsumsi pangan di Daerah kurun waktu tahun 2020-2023 cenderung fluktuatif. Jika tahun 2020-2021 prevalensi ketidakcukupan konsumsi pangan trennya meningkat, namun pada tahun 2023 menunjukkan kinerja yang baik, menurun menjadi 5,23. Angka ini masuk dalam kategori moderat dan menunjukkan bahwa dari 100 penduduk Daerah terdapat 5 orang yang mengalami kekurangan gizi. Upaya berkesinambungan perlu dilakukan agar angka prevalensi ketidakcukupan konsumsi pangan dapat ditekan dibawah 5 dan masuk dalam kategori rendah.</p>`,
    extraData: {},
  },

  'sosial-ekonomi': {
    slug: 'sosial-ekonomi',
    title: 'Sosial Ekonomi',
    description: 'Kondisi demografi dan pergerakan ekonomi masyarakat',
    heroImage:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
    heroImageFit: 'cover',
    contentImage: null,
    contentImageTitle: null,
    contentImageCaption: null,
    contentHtml: `<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-2">Peningkatan Pembangunan Manusia</h2>
<p>Indeks Pembangunan Manusia (IPM) merupakan indikator yang digunakan untuk melihat pembangunan dalam jangka panjang. Di mana untuk melihat kemajuan pembangunan manusia, terdapat dua aspek yang perlu diperhatikan, yakni kecepatan dan status pencapaian. Pertumbuhan nilai IPM antar waktu menunjukkan kecepatan pembangunan yang terjadi sebagai cerminan atas upaya yang dilakukan untuk meningkatkan pembangunan manusia. Sementara status pencapaian IPM merefleksikan tingkatan pencapaian pembangunan manusia dalam satu periode.</p>
<figure class="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div class="mb-4 text-center">
    <h3 class="text-base font-bold text-[#172135] md:text-lg">IPM Kota Sukabumi Tahun 2020-2024 (Poin)</h3>
  </div>
  <img src="/images/IPM Kota Sukabumi Tahun 2020-2024 (Poin).jpg" alt="IPM Kota Sukabumi Tahun 2020-2024 (Poin)" class="mx-auto h-auto max-w-full rounded-lg block" />
  <figcaption class="text-xs md:text-sm text-[#566276] italic mt-4 text-center">Sumber: Bappeda dan BPS Kota Sukabumi, 2025 (diolah)</figcaption>
</figure>
<p>IPM Kota Sukabumi di tahun 2024 masuk dalam kategori tinggi (interval 70-79 poin). Naik cukup signifikan sekitar 0,53 poin dari 77,16 di tahun 2023 menjadi 77,69 di tahun 2024. Kenaikan IPM terjadi pada semua komponen yaitu usia harapan hidup, harapan lama sekolah, rata-rata lama sekolah, dan pengeluaran per kapita disesuaikan.</p>
<div class="mt-8 mb-8 overflow-x-auto">
  <div class="text-center mb-4">
    <h3 class="text-lg font-bold text-[#172135]">Komponen IPM Kota Sukabumi Tahun 2020-2024</h3>
  </div>
  <table class="w-full text-sm text-left border-collapse border border-slate-300 min-w-[600px] mb-2 shadow-sm">
    <thead>
      <tr class="bg-slate-100">
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">INDIKATOR</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">SATUAN</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">2020</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">2021</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">2022</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">2023</th>
        <th class="border border-slate-300 py-3 px-4 text-center font-bold text-[#172135]">2024</th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="border border-slate-300 py-2 px-4">Usia Harapan Hidup</td>
        <td class="border border-slate-300 py-2 px-4 text-center">Tahun</td>
        <td class="border border-slate-300 py-2 px-4 text-center">74,23</td>
        <td class="border border-slate-300 py-2 px-4 text-center">74,38</td>
        <td class="border border-slate-300 py-2 px-4 text-center">74,64</td>
        <td class="border border-slate-300 py-2 px-4 text-center">74,89</td>
        <td class="border border-slate-300 py-2 px-4 text-center">75,11</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="border border-slate-300 py-2 px-4">Harapan Lama Sekolah</td>
        <td class="border border-slate-300 py-2 px-4 text-center">Tahun</td>
        <td class="border border-slate-300 py-2 px-4 text-center">13,47</td>
        <td class="border border-slate-300 py-2 px-4 text-center">13,58</td>
        <td class="border border-slate-300 py-2 px-4 text-center">13,59</td>
        <td class="border border-slate-300 py-2 px-4 text-center">13,60</td>
        <td class="border border-slate-300 py-2 px-4 text-center">13,62</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="border border-slate-300 py-2 px-4">Rata-rata Lama Sekolah</td>
        <td class="border border-slate-300 py-2 px-4 text-center">Tahun</td>
        <td class="border border-slate-300 py-2 px-4 text-center">9,59</td>
        <td class="border border-slate-300 py-2 px-4 text-center">9,81</td>
        <td class="border border-slate-300 py-2 px-4 text-center">10,14</td>
        <td class="border border-slate-300 py-2 px-4 text-center">10,37</td>
        <td class="border border-slate-300 py-2 px-4 text-center">10,38</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="border border-slate-300 py-2 px-4">Rata-rata Pengeluaran per Kapita sebulan</td>
        <td class="border border-slate-300 py-2 px-4 text-center">Ribu Rupiah</td>
        <td class="border border-slate-300 py-2 px-4 text-center">10.999</td>
        <td class="border border-slate-300 py-2 px-4 text-center">10.942</td>
        <td class="border border-slate-300 py-2 px-4 text-center">11.229</td>
        <td class="border border-slate-300 py-2 px-4 text-center">11.999</td>
        <td class="border border-slate-300 py-2 px-4 text-center">12.252</td>
      </tr>
      <tr class="font-bold bg-slate-100">
        <td class="border border-slate-300 py-2 px-4">IPM</td>
        <td class="border border-slate-300 py-2 px-4 text-center">Indeks</td>
        <td class="border border-slate-300 py-2 px-4 text-center">75,06</td>
        <td class="border border-slate-300 py-2 px-4 text-center">75,44</td>
        <td class="border border-slate-300 py-2 px-4 text-center">76,24</td>
        <td class="border border-slate-300 py-2 px-4 text-center">77,16</td>
        <td class="border border-slate-300 py-2 px-4 text-center">77,69</td>
      </tr>
    </tbody>
  </table>
  <p class="text-xs text-[#566276] italic text-left">Sumber: BPS Kota Sukabumi, 2025</p>
</div>
<p>Jika dilihat perkembangan dari tahun 2020-2024, IPM Kota Sukabumi masih lebih baik jika dibandingkan IPM Provinsi Jawa Barat dan Nasional. Di antara kota/kabupaten di Provinsi Jawa Barat, IPM Kota Sukabumi tahun 2024 berada di peringkat 7. Namun jika dilihat hanya kategori kota, dari 9 kota di Provinsi Jawa Barat, peringkat IPM Kota Sukabumi hanya lebih baik dari IPM Kota Tasikmalaya dan Kota Banjar. IPM Kota Sukabumi masih bisa lebih baik lagi asalkan 4 komponen pembentuk IPM diintervensi dengan tepat dan dilaksanakan oleh lintas urusan.</p>`,
    extraData: {},
  },

  'dalam-angka': {
    slug: 'dalam-angka',
    title: 'Sukabumi Dalam Angka',
    description: 'Data statistik dan indikator kinerja daerah',
    heroImage: '/images/dalam angka-card.jpg',
    heroImageFit: 'cover',
    contentImage: null,
    contentImageTitle: null,
    contentImageCaption: null,
    contentHtml: `<h2 class="text-2xl md:text-3xl font-bold text-[#172135] mb-4 mt-2">Kota Sukabumi dalam Angka 2026</h2>
<p>Kota Sukabumi Dalam Angka 2026 merupakan publikasi tahunan yang diterbitkan oleh BPS Kota Sukabumi. Disadari bahwa publikasi ini belum sepenuhnya memenuhi harapan pihak pemakai data khususnya para perencana, namun diharapkan dapat membantu melengkapi penyusunan rencana pembangunan di Kota Sukabumi.</p>`,
    extraData: {
      featuredPublication: {
        src: '/images/Sukabumi dalam angka.jpeg',
        caption: 'Sumber: BPS Kota Sukabumi 2026',
        link: 'https://sukabumikota.bps.go.id/id/publication/2026/02/27/b3c2d3ab48f0a9944fdd34ff/kota-sukabumi-dalam-angka-2026.html',
        imageClassName:
          'max-w-[300px] w-full h-auto mx-auto rounded-xl shadow-sm hover:scale-103 transition-transform duration-300 cursor-pointer block',
      },
    },
  },

  uks: {
    slug: 'uks',
    title: 'Unit Kesehatan Sekolah (UKS)',
    description: 'Program pembinaan kesehatan komprehensif di lingkungan sekolah',
    heroImage: '/images/UKS-card.jpg',
    heroImageFit: 'cover',
    contentImage: null,
    contentImageTitle: null,
    contentImageCaption: null,
    contentHtml: `<p>Program UKS Kota Sukabumi merupakan upaya terpadu dalam membina dan mengembangkan kesehatan peserta didik di lingkungan sekolah.</p>
<p>Kegiatan UKS meliputi pendidikan kesehatan, pelayanan kesehatan, dan pembinaan lingkungan sekolah sehat.</p>
<p>Melalui UKS, peserta didik diajarkan tentang pentingnya hidup sehat, kebersihan diri, gizi seimbang, dan pencegahan penyakit.</p>
<p>Program ini melibatkan kerjasama antara Dinas Kesehatan, Dinas Pendidikan, dan sekolah-sekolah untuk menciptakan generasi yang sehat dan produktif.</p>`,
    extraData: {},
  },
};
