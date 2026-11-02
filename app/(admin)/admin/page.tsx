'use client'

import { useState, useEffect } from 'react'
import { Eye, FileText, Users } from 'lucide-react'

const stats = [
  {
    id: 'pengunjung bulan ini',
    label: 'Pengunjung Bulan Ini',
    value: '1089',
    icon: Users,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'Berita diterbitkan',
    label: 'Berita Diterbitkan',
    value: '45.200',
    icon: Eye,
    iconClass: 'bg-green-50 text-[#159447]',
  },
  {
    id: 'Draft Berita',
    label: 'Draft Berita',
    value: '7',
    icon: FileText,
    iconClass: 'bg-orange-50 text-orange-500',
  },
]

// Data kunjungan berdasarkan rentang waktu (timeFilter)
const chartData = {
  '7d': {
    total: '13.440',
    avg: '1.920 / hari',
    max: 3000,
    points: [
      { date: '21 Okt', day: 'Senin', visitors: 1450 },
      { date: '22 Okt', day: 'Selasa', visitors: 2120 },
      { date: '23 Okt', day: 'Rabu', visitors: 1680 },
      { date: '24 Okt', day: 'Kamis', visitors: 2740 },
      { date: '25 Okt', day: 'Jumat', visitors: 2310 },
      { date: '26 Okt', day: 'Sabtu', visitors: 1250 },
      { date: '27 Okt', day: 'Minggu', visitors: 1890 },
    ],
  },
  '30d': {
    total: '54.200',
    avg: '1.806 / hari',
    max: 12000,
    points: [
      { date: '1 Okt', day: 'Pekan 1', visitors: 6500 },
      { date: '5 Okt', day: 'Pekan 1', visitors: 7200 },
      { date: '10 Okt', day: 'Pekan 2', visitors: 8100 },
      { date: '15 Okt', day: 'Pekan 3', visitors: 9500 },
      { date: '20 Okt', day: 'Pekan 3', visitors: 8800 },
      { date: '25 Okt', day: 'Pekan 4', visitors: 10200 },
      { date: '27 Okt', day: 'Hari Ini', visitors: 3900 },
    ],
  },
  '1y': {
    total: '652.800',
    avg: '1.789 / hari',
    max: 100000,
    points: [
      { date: 'Jan', day: '2026', visitors: 45000 },
      { date: 'Mar', day: '2026', visitors: 58000 },
      { date: 'Mei', day: '2026', visitors: 62000 },
      { date: 'Jul', day: '2026', visitors: 71000 },
      { date: 'Sep', day: '2026', visitors: 85000 },
      { date: 'Okt', day: '2026', visitors: 54200 },
      { date: 'Des', day: 'Proyeksi', visitors: 90000 },
    ],
  },
}

const popularNews = [
  { title: 'Pemkot Sukabumi Luncurkan Layanan Perizinan Digital Terpadu', views: '1.200x dilihat' },
  { title: 'Wali Kota Sukabumi Resmikan Revitalisasi Alun-Alun Kota', views: '980x dilihat' },
  { title: 'Dishub Benahi Tata Kelola Parkir Untuk Mendukung Peningkatan PAD', views: '845x dilihat' },
  { title: 'Peringatan Harhubnas Merupakan Momentum Untuk Memperkuat Peran Transportasi', views: '710x dilihat' },
  { title: 'Pendaftaran Seleksi Calon Dewas dan Direksi BPR Kota Sukabumi Dibuka', views: '655x dilihat' },
]

export default function AdminDashboardPage() {
  const currentUserRole = 'SUPER_ADMIN' as 'SUPER_ADMIN' | 'ADMIN_BERITA' // Ubah untuk testing
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '1y'>('7d')
  const [activeIdx, setActiveIdx] = useState<number | null>(3)

  const activeData = chartData[timeFilter]

  useEffect(() => {
    // TODO: Lakukan fetch data ke /api/analytics?range=${timeFilter} untuk meng-update array dailyVisits saat koneksi GA4 sudah terpasang.
  }, [timeFilter])

  const filterLabels: Record<'7d' | '30d' | '1y', { titleRange: string; totalRange: string }> = {
    '7d': { titleRange: '7 Hari Terakhir', totalRange: 'Total 7 Hari' },
    '30d': { titleRange: '30 Hari Terakhir', totalRange: 'Total 30 Hari' },
    '1y': { titleRange: '1 Tahun Terakhir', totalRange: 'Total 1 Tahun' },
  }

  // Pengaturan dimensi & skala Line Chart
  const svgWidth = 650
  const svgHeight = 240
  const padLeft = 55
  const padRight = 20
  const padTop = 32
  const padBottom = 48
  const chartWidth = svgWidth - padLeft - padRight // 575
  const chartHeight = svgHeight - padTop - padBottom // 160
  const maxVisitors = activeData.max
  const yTicks = [
    activeData.max,
    activeData.max * 0.75,
    activeData.max * 0.5,
    activeData.max * 0.25,
    0,
  ]
  const baselineY = padTop + chartHeight

  // Kalkulasi titik koordinat X & Y untuk tiap tanggal berdasarkan activeData.points
  const points = activeData.points.map((item, index) => {
    const x = padLeft + (index / (activeData.points.length - 1)) * chartWidth
    const y = padTop + chartHeight - (item.visitors / maxVisitors) * chartHeight
    return { ...item, x, y }
  })

  // Kurva halus (Smooth Cubic Bezier)
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = arr[i - 1]
    const dx = pt.x - prev.x
    const cp1x = prev.x + dx * 0.4
    const cp1y = prev.y
    const cp2x = pt.x - dx * 0.4
    const cp2y = pt.y
    return `${acc} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
  }, '')

  // Area di bawah kurva untuk efek gradien
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`

  return (
    <div className="space-y-6 rounded-2xl bg-[#f8fafc]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
          Selamat Datang Trias
        </h1>
        <p className="mt-1 text-sm text-[#566276] leading-relaxed">
          Ringkasan performa portal dan tugas editorial Anda hari ini.
        </p>
      </div>

      {/* Top Cards */}
      <div className={`grid grid-cols-1 gap-4 ${currentUserRole === 'SUPER_ADMIN' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {stats
          .filter(stat => currentUserRole === 'SUPER_ADMIN' || stat.id !== 'pengunjung bulan ini')
          .map((stat) => {
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
            </div>
          )
        })}
      </div>

      {/* Grafik & Berita Terpopuler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Grafik Kunjungan (Line Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#159447]" />
                <h2 className="text-base font-bold text-[#172135]">
                  Statistik Kunjungan ({filterLabels[timeFilter].titleRange})
                </h2>
              </div>
              <p className="text-xs text-[#566276] mt-0.5 ml-4.5">
                Grafik garis tren harian pengunjung portal
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Segmented Control Filter Rentang Waktu */}
              <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
                {(
                  [
                    { value: '7d', label: '7 Hari' },
                    { value: '30d', label: '30 Hari' },
                    { value: '1y', label: '1 Tahun' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeFilter(opt.value)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${timeFilter === opt.value
                        ? 'bg-white text-[#159447] shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Blok Teks Total Reaktif */}
              <div className="text-right">
                <p className="text-[11px] font-medium text-slate-400">
                  {filterLabels[timeFilter].totalRange}
                </p>
                <p className="text-sm font-bold text-[#159447]">{activeData.total}</p>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-medium text-slate-400">Rata-rata Harian</p>
                <p className="text-sm font-bold text-[#172135]">{activeData.avg}</p>
              </div>
            </div>
          </div>

          {/* Area Line Chart SVG */}
          <div className="mt-4 w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              style={{ maxHeight: '270px' }}
            >
              <defs>
                <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#159447" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#159447" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#159447" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Sumbu Y: Label Unit di Puncak Sumbu Y */}
              <text
                x={padLeft - 5}
                y={padTop - 12}
                textAnchor="end"
                className="text-[10px] font-bold fill-slate-400 tracking-wider uppercase"
              >
                Pengunjung
              </text>

              {/* Sumbu Y: Garis Grid Horizontal & Angka Jumlah Pengunjung */}
              {yTicks.map((tick) => {
                const y = padTop + chartHeight - (tick / maxVisitors) * chartHeight
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartWidth}
                      y2={y}
                      stroke={tick === 0 ? '#cbd5e1' : '#f1f5f9'}
                      strokeDasharray={tick === 0 ? 'none' : '4 4'}
                      strokeWidth={tick === 0 ? '1.5' : '1'}
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[11px] font-medium fill-slate-400"
                    >
                      {tick.toLocaleString('id-ID')}
                    </text>
                  </g>
                )
              })}

              {/* Area Shading Hijau di bawah Garis */}
              <path d={areaPath} fill="url(#lineChartGradient)" />

              {/* Garis Kurva Pengunjung */}
              <path
                d={linePath}
                fill="none"
                stroke="#159447"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Sumbu X: Label Tanggal & Hari */}
              {points.map((pt) => (
                <g key={pt.date}>
                  {/* Tanggal */}
                  <text
                    x={pt.x}
                    y={baselineY + 18}
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-700"
                  >
                    {pt.date}
                  </text>
                  {/* Hari */}
                  <text
                    x={pt.x}
                    y={baselineY + 31}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-slate-400"
                  >
                    {pt.day}
                  </text>
                </g>
              ))}

              {/* Titik Data & Hover Trigger */}
              {points.map((pt, i) => {
                const isActive = activeIdx === i
                const stepWidth = chartWidth / (points.length - 1)

                return (
                  <g key={`point-${pt.date}`}>
                    {/* Area Klik/Hover Luas */}
                    <rect
                      x={pt.x - stepWidth / 2}
                      y={padTop - 10}
                      width={stepWidth}
                      height={chartHeight + 20}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveIdx(i)}
                    />

                    {/* Garis Indikator Vertikal saat Aktif */}
                    {isActive && (
                      <line
                        x1={pt.x}
                        y1={padTop}
                        x2={pt.x}
                        y2={baselineY}
                        stroke="#159447"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.5"
                      />
                    )}

                    {/* Lingkaran Luar Titik Aktif */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="#159447"
                        fillOpacity="0.2"
                      />
                    )}

                    {/* Titik Lingkaran Data */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? '5.5' : '4'}
                      fill={isActive ? '#159447' : '#ffffff'}
                      stroke="#159447"
                      strokeWidth={isActive ? '2.5' : '2'}
                      className="transition-all duration-150 pointer-events-none"
                    />
                  </g>
                )
              })}

              {/* Tooltip Melayang saat Hover */}
              {activeIdx !== null && (() => {
                const pt = points[activeIdx]
                const tooltipW = 120
                const tooltipH = 46
                // Memastikan tooltip tidak terpotong di tepi kiri/kanan
                const clampedX = Math.min(
                  Math.max(pt.x, padLeft + tooltipW / 2),
                  padLeft + chartWidth - tooltipW / 2
                )
                const tooltipY = Math.max(10, pt.y - tooltipH - 12)

                return (
                  <g
                    transform={`translate(${clampedX}, ${tooltipY})`}
                    className="pointer-events-none transition-all duration-150"
                  >
                    {/* Kotak Background Tooltip */}
                    <rect
                      x={-tooltipW / 2}
                      y={0}
                      width={tooltipW}
                      height={tooltipH}
                      rx="8"
                      fill="#172135"
                      className="drop-shadow-md"
                    />
                    {/* Panah Segitiga Tooltip */}
                    <polygon
                      points={`-5,${tooltipH} 5,${tooltipH} 0,${tooltipH + 5}`}
                      fill="#172135"
                    />
                    {/* Teks Tanggal & Hari */}
                    <text
                      x="0"
                      y="18"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {pt.day}, {pt.date}
                    </text>
                    {/* Teks Jumlah Pengunjung */}
                    <text
                      x="0"
                      y="34"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {pt.visitors.toLocaleString('id-ID')} Pengunjung
                    </text>
                  </g>
                )
              })()}
            </svg>
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