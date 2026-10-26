import Link from 'next/link'
import { AlertCircle, ArrowRight, Eye, FileText, Users } from 'lucide-react'

const stats = [
  {
    id: 'total-kunjungan',
    label: 'Total Kunjungan',
    value: '124.500',
    sub: '+12% dari bulan lalu',
    subClass: 'text-[#159447]',
    icon: Users,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'tayang-bulan-ini',
    label: 'Tayang Bulan Ini',
    value: '45.200',
    sub: '+5% dari bulan lalu',
    subClass: 'text-[#159447]',
    icon: Eye,
    iconClass: 'bg-green-50 text-[#159447]',
  },
  {
    id: 'total-publikasi',
    label: 'Total Publikasi',
    value: '342 Artikel',
    sub: 'Berita & Pengumuman aktif',
    subClass: 'text-slate-400',
    icon: FileText,
    iconClass: 'bg-orange-50 text-orange-500',
  },
]

const weeklyVisits = [
  { day: 'Senin', value: 62 },
  { day: 'Selasa', value: 78 },
  { day: 'Rabu', value: 55 },
  { day: 'Kamis', value: 90 },
  { day: 'Jumat', value: 72 },
  { day: 'Sabtu', value: 40 },
  { day: 'Minggu', value: 48 },
]

const popularNews = [
  { title: 'Pemkot Sukabumi Luncurkan Layanan Perizinan Digital Terpadu', views: '1.200x tayang' },
  { title: 'Wali Kota Sukabumi Resmikan Revitalisasi Alun-Alun Kota', views: '980x tayang' },
  { title: 'Dishub Benahi Tata Kelola Parkir Untuk Mendukung Peningkatan PAD', views: '845x tayang' },
  { title: 'Peringatan Harhubnas Merupakan Momentum Untuk Memperkuat Peran Transportasi', views: '710x tayang' },
  { title: 'Pendaftaran Seleksi Calon Dewas dan Direksi BPR Kota Sukabumi Dibuka', views: '655x tayang' },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 rounded-2xl bg-[#f8fafc]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
          Selamat Datang di Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#566276] leading-relaxed">
          Ringkasan performa portal dan tugas editorial Anda hari ini.
        </p>
      </div>

      {/* Alert Antrean Tugas */}
      <div
        id="alert-antrean-tugas"
        className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
            <AlertCircle size={22} />
          </span>
          <p className="text-sm font-medium text-amber-900">
            Ada <span className="font-bold">3 Draf Berita</span> yang menunggu review dan persetujuan Anda.
          </p>
        </div>
        <Link
          id="btn-lihat-antrean"
          href="/admin/berita"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          Lihat Antrean <ArrowRight size={14} />
        </Link>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.id}
              id={`card-${stat.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#566276]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#172135]">{stat.value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}>
                  <Icon size={22} />
                </span>
              </div>
              <p className={`mt-4 text-xs font-semibold ${stat.subClass}`}>{stat.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Grafik & Berita Terpopuler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Grafik Kunjungan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
          <h2 className="text-base font-bold text-[#172135]">Statistik Kunjungan (7 Hari Terakhir)</h2>
          <div className="mt-6 flex h-64 items-end gap-3 sm:gap-5">
            {weeklyVisits.map((item) => (
              <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-semibold text-slate-400">{item.value}%</span>
                <div
                  className="w-full max-w-[48px] rounded-t-lg bg-[#159447] transition-colors hover:bg-[#0f7a36]"
                  style={{ height: `${item.value}%` }}
                />
                <span className="text-xs font-medium text-[#566276]">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Berita Terpopuler */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
          <h2 className="text-base font-bold text-[#172135]">Berita Terpopuler Bulan Ini</h2>
          <ol className="mt-4 divide-y divide-slate-100">
            {popularNews.map((news, idx) => (
              <li key={news.title} className="flex items-center gap-3 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-xs font-bold text-[#159447]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#172135]">{news.title}</p>
                  <p className="text-xs text-slate-400">{news.views}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}