'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    PlusCircle,
    Search,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ArrowDown,
    ArrowUp,
    Eye,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react'

// Tipe data Reporter
export interface Reporter {
    name: string
    role: string
    avatar: string
    avatarBg: string
}

// Tipe data BeritaItem
export interface BeritaItem {
    id: string
    no: string
    title: string
    excerpt: string
    categories: string[]
    status: 'Publish' | 'Draft'
    date: string
    time: string
    image: string
    reporter: Reporter
}

// Daftar kategori (sinkron dengan BeritaClient.tsx)
const categories = [
    'Semua kategori',
    'Agama',
    'Artikel',
    'Bencana',
    'Diskominfo',
    'Ekonomi',
    'Hukum',
    'Infrastruktur',
    'Kesehatan',
    'Layanan Publik',
    'Legislatif',
    'Lingkungan',
    'Olahraga',
    'Pariwisata',
    'Pendidikan',
    'Pertanian',
    'Politik',
    'Seni Budaya',
    'Sosial',
    'Teknologi',
    'Transportasi',
    'Umum',
    'Walikota',
]

const statusOptions = ['Semua Status', 'Publish', 'Draft']

// Data awal berita sesuai screenshot desain
const initialBerita: BeritaItem[] = [
    {
        id: '1',
        no: '01',
        title: 'Optimalisasi MPP Digital',
        excerpt: 'Layanan terpadu cepat & ringkas',
        categories: ['Pelayanan', 'Teknologi'],
        status: 'Publish',
        date: '24 Okt 2026',
        time: '08:45 WIB',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '2',
        no: '02',
        title: 'Revitalisasi Pasar Induk II',
        excerpt: 'Zona sanitasi & pangan higienis',
        categories: ['Ekonomi'],
        status: 'Publish',
        date: '23 Okt 2026',
        time: '16:10 WIB',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '3',
        no: '03',
        title: 'Perda APBD Perubahan',
        excerpt: 'Prioritas belanja daerah difokuskan',
        categories: ['Pemerintahan', 'Layanan Publik'],
        status: 'Draft',
        date: '22 Okt 2026',
        time: '11:00 WIB',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '4',
        no: '04',
        title: 'Gerakan Bebas Stunting',
        excerpt: 'Suplemen nutrisi & pantau gizi',
        categories: ['Kesehatan'],
        status: 'Publish',
        date: '21 Okt 2026',
        time: '14:20 WIB',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '5',
        no: '05',
        title: 'Uji Beban Jembatan Lingkar',
        excerpt: 'Sertifikasi kelayakan operasional',
        categories: ['Infrastruktur', 'Transportasi'],
        status: 'Publish',
        date: '19 Okt 2026',
        time: '09:15 WIB',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '6',
        no: '06',
        title: 'Pelatihan UMKM Go Digital Sukabumi',
        excerpt: 'Fasilitasi pemasaran produk lokal ke marketplace',
        categories: ['Ekonomi', 'Pelayanan'],
        status: 'Publish',
        date: '18 Okt 2026',
        time: '10:30 WIB',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '7',
        no: '07',
        title: 'Pemberian Vaksinasi Booster Pelajar',
        excerpt: 'Dinkes pastikan imunitas peserta didik terjaga',
        categories: ['Kesehatan'],
        status: 'Draft',
        date: '17 Okt 2026',
        time: '08:00 WIB',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '8',
        no: '08',
        title: 'Penyaluran Bantuan Sosial Warga Lansia',
        excerpt: 'Dinsos distribusikan paket sembako di 7 kecamatan',
        categories: ['Sosial', 'Layanan Publik'],
        status: 'Publish',
        date: '16 Okt 2026',
        time: '13:45 WIB',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '9',
        no: '09',
        title: 'Sosialisasi Tertib Lalu Lintas Pelajar',
        excerpt: 'Dishub edukasi keselamatan berkendara di sekolah',
        categories: ['Transportasi'],
        status: 'Publish',
        date: '15 Okt 2026',
        time: '09:00 WIB',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '10',
        no: '10',
        title: 'Pameran Produk Ekonomi Kreatif Daerah',
        excerpt: 'Ajang kreasi pengrajin kriya dan batik Sukabumi',
        categories: ['Ekonomi'],
        status: 'Publish',
        date: '14 Okt 2026',
        time: '15:20 WIB',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '11',
        no: '11',
        title: 'Pemeriksaan Kesehatan Gratis Warga Pesisir',
        excerpt: 'Layanan tensi, gula darah, dan konsultasi dokter',
        categories: ['Kesehatan', 'Layanan Publik'],
        status: 'Publish',
        date: '13 Okt 2026',
        time: '08:15 WIB',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '12',
        no: '12',
        title: 'Penguatan Kapasitas RT dan RW Se-Kota',
        excerpt: 'Peningkatan peran pamong dalam pelayanan warga',
        categories: ['Pemerintahan'],
        status: 'Draft',
        date: '12 Okt 2026',
        time: '10:00 WIB',
        image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '13',
        no: '13',
        title: 'Peluncuran Aplikasi Perizinan Berusaha Terpadu',
        excerpt: 'Kemudahan izin usaha melalui platform digital',
        categories: ['Teknologi', 'Layanan Publik'],
        status: 'Publish',
        date: '11 Okt 2026',
        time: '11:30 WIB',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '14',
        no: '14',
        title: 'Operasi Pasar Murah Sembako Bersubsidi',
        excerpt: 'Jaga stabilitas harga bahan pokok menjelang akhir tahun',
        categories: ['Ekonomi'],
        status: 'Publish',
        date: '10 Okt 2026',
        time: '07:45 WIB',
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '15',
        no: '15',
        title: 'Lomba Kelurahan Bersih dan Asri Tingkat Kota',
        excerpt: 'Apresiasi warga kelurahan pengelola sampah mandiri',
        categories: ['Lingkungan'],
        status: 'Publish',
        date: '09 Okt 2026',
        time: '14:00 WIB',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '16',
        no: '16',
        title: 'Penyuluhan Gizi Seimbang Ibu Hamil & Balita',
        excerpt: 'Puskesmas gelar pendampingan kesehatan keluarga terpadu',
        categories: ['Kesehatan'],
        status: 'Publish',
        date: '08 Okt 2026',
        time: '09:30 WIB',
        image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '17',
        no: '17',
        title: 'Diseminasi Keterbukaan Informasi Publik PPID',
        excerpt: 'Standarisasi layanan sengketa dan permohonan data',
        categories: ['Diskominfo', 'Teknologi'],
        status: 'Draft',
        date: '07 Okt 2026',
        time: '13:15 WIB',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '18',
        no: '18',
        title: 'Bazar Pertanian Organik dan Sayur Segar',
        excerpt: 'Petani binaan panen raya hidroponik perkotaan',
        categories: ['Pertanian'],
        status: 'Publish',
        date: '06 Okt 2026',
        time: '08:30 WIB',
        image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '19',
        no: '19',
        title: 'Rapat Koordinasi Forkopimda Triwulan IV',
        excerpt: 'Sinergi pengamanan dan kondusivitas wilayah kota',
        categories: ['Pemerintahan'],
        status: 'Publish',
        date: '05 Okt 2026',
        time: '10:00 WIB',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '20',
        no: '20',
        title: 'Skrining Penyakit Tidak Menular Mobile Posbindu',
        excerpt: 'Pemeriksaan rutin jemput bola di balai kelurahan',
        categories: ['Kesehatan'],
        status: 'Publish',
        date: '04 Okt 2026',
        time: '08:45 WIB',
        image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '21',
        no: '21',
        title: 'Layanan Rekam KTP-el Jemput Bola Sekolah',
        excerpt: 'Disdukcapil percepat kepemilikan identitas pemilih pemula',
        categories: ['Pelayanan', 'Diskominfo'],
        status: 'Publish',
        date: '03 Okt 2026',
        time: '11:15 WIB',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '22',
        no: '22',
        title: 'Pelatihan Kewirausahaan Milenial & Inkubasi Bisnis',
        excerpt: 'Bimbingan teknis permodalan dan manajemen keuangan',
        categories: ['Ekonomi'],
        status: 'Draft',
        date: '02 Okt 2026',
        time: '14:00 WIB',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
    {
        id: '23',
        no: '23',
        title: 'Simulasi Tanggap Darurat Bencana Banjir dan Longsor',
        excerpt: 'BPBD latih kesiapsiagaan relawan kelurahan tangguh',
        categories: ['Bencana', 'Sosial'],
        status: 'Publish',
        date: '01 Okt 2026',
        time: '07:30 WIB',
        image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Siti Aminah',
            role: 'Staf Dokumentasi',
            avatar: 'SA',
            avatarBg: 'bg-[#fef3c7] text-[#d97706]',
        },
    },
    {
        id: '24',
        no: '24',
        title: 'Promosi Wisata Budaya dan Destinasi Alam Sukabumi',
        excerpt: 'Disporapar gandeng asosiasi pariwisata tingkatkan kunjungan',
        categories: ['Pariwisata', 'Seni Budaya', 'Diskominfo'],
        status: 'Publish',
        date: '29 Sep 2026',
        time: '09:00 WIB',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Dian Kusuma',
            role: 'Pranata Humas',
            avatar: 'DK',
            avatarBg: 'bg-[#ede9fe] text-[#6366f1]',
        },
    },
    {
        id: '25',
        no: '25',
        title: 'Sosialisasi Kanal Pengaduan Warga Bebas Pulsa',
        excerpt: 'Integrasi call center tanggap darurat dan SP4N LAPOR',
        categories: ['Pelayanan'],
        status: 'Publish',
        date: '28 Sep 2026',
        time: '10:15 WIB',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=360&q=80',
        reporter: {
            name: 'Bambang I.',
            role: 'Wartawan Ahli',
            avatar: 'BI',
            avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
    },
]

export default function AdminBeritaPage() {
    const router = useRouter()
    const [beritaList, setBeritaList] = useState<BeritaItem[]>(initialBerita)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('Semua kategori')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [dateFilter, setDateFilter] = useState('Semua Waktu')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDateOpen, setIsDateOpen] = useState(false)
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [statusFilter, setStatusFilter] = useState<string>('Semua Status')

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(5)

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [previewItem, setPreviewItem] = useState<BeritaItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form state for add / edit
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        category: 'Pelayanan',
        status: 'Publish' as BeritaItem['status'],
        image: '',
        reporterName: 'Bambang I.',
        reporterRole: 'Wartawan Ahli',
    })

    // Filter & Search logic
    const filteredData = useMemo(() => {
        return beritaList.filter((item) => {
            const matchSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reporter.name.toLowerCase().includes(searchTerm.toLowerCase())

            const matchCategory =
                activeCategory === 'Semua kategori' ||
                item.categories.some((cat) => cat.toLowerCase().includes(activeCategory.toLowerCase()))

            const matchStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter

            // Filter Waktu
            let matchDate = true
            if (dateFilter === 'Bulan Ini') {
                const months: Record<string, number> = {
                    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
                    jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11
                }
                const parts = item.date.trim().split(' ')
                if (parts.length === 3) {
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const itemMonth = months[mKey]
                    const itemYear = parseInt(parts[2], 10)
                    const now = new Date()
                    matchDate = (itemMonth === now.getMonth() && itemYear === now.getFullYear()) || (itemMonth === 9 && itemYear === 2026)
                }
            } else if (dateFilter === 'Pilih Tanggal (Kustom)') {
                const months: Record<string, number> = {
                    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
                    jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11
                }
                const parts = item.date.trim().split(' ')
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10)
                    const mKey = parts[1].toLowerCase().slice(0, 3)
                    const month = months[mKey] ?? 0
                    const year = parseInt(parts[2], 10)
                    const itemTimestamp = new Date(year, month, day).getTime()

                    if (startDate) {
                        const start = new Date(startDate).setHours(0, 0, 0, 0)
                        if (itemTimestamp < start) matchDate = false
                    }
                    if (endDate) {
                        const end = new Date(endDate).setHours(23, 59, 59, 999)
                        if (itemTimestamp > end) matchDate = false
                    }
                }
            }

            return matchSearch && matchCategory && matchStatus && matchDate
        })
    }, [beritaList, searchTerm, activeCategory, statusFilter, dateFilter, startDate, endDate])

    // Sort logic
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.id.localeCompare(a.id, undefined, { numeric: true })
            } else {
                return a.id.localeCompare(b.id, undefined, { numeric: true })
            }
        })
    }, [filteredData, sortOrder])

    // Pagination helpers
    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage))
    const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    const startItem = sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const endItem = Math.min(currentPage * rowsPerPage, sortedData.length)

    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
        const pages: (number | '...')[] = []
        const left = Math.max(2, currentPage - 1)
        const right = Math.min(totalPages - 1, currentPage + 1)
        pages.push(1)
        if (left > 2) pages.push('...')
        for (let i = left; i <= right; i++) pages.push(i)
        if (right < totalPages - 1) pages.push('...')
        pages.push(totalPages)
        return pages
    }

    // Handle open add modal
    const openAddModal = () => {
        setFormData({
            title: '',
            excerpt: '',
            category: 'Pelayanan',
            status: 'Publish',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
            reporterName: 'Bambang I.',
            reporterRole: 'Wartawan Ahli',
        })
        setIsAddModalOpen(true)
    }

    // Handle save new item
    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        const newId = String(beritaList.length + 1)
        const formattedNo = newId.padStart(2, '0')

        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
        }

        const newItem: BeritaItem = {
            id: newId,
            no: formattedNo,
            title: formData.title,
            excerpt: formData.excerpt || 'Ringkasan publikasi kedinasan daerah...',
            categories: [formData.category],
            status: formData.status,
            date: '24 Okt 2026',
            time: '10:00 WIB',
            image:
                formData.image.trim() ||
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80',
            reporter: {
                name: formData.reporterName,
                role: formData.reporterRole,
                avatar: getInitials(formData.reporterName),
                avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
            },
        }

        setBeritaList([newItem, ...beritaList])
        setIsAddModalOpen(false)
    }

    // Handle delete
    const handleDelete = (id: string) => {
        setBeritaList((prev) => prev.filter((item) => item.id !== id))
        setDeletingId(null)
    }

    // Badge style helper for category
    const getCategoryBadgeClass = (_category?: string) => {
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }

    return (
        <div className="w-full space-y-6 pb-10">
            {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Kelola Berita
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
                        Kelola dan pantau seluruh publikasi berita kedinasan kota.
                    </p>
                </div>

                <div className="flex items-center justify-end sm:ml-auto self-end sm:self-center shrink-0">
                    <Link
                        href="/admin/berita/tambah"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        style={{ backgroundColor: '#159447' }}
                    >
                        <PlusCircle size={17} className="stroke-[2.2] text-white" />
                        <span className="text-white">Tambah Berita Baru</span>
                    </Link>
                </div>
            </div>

            {/* 2. CARD PENCARIAN & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    {/* Input Search */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Cari judul berita atau nama reporter..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Grup Dropdown Filter */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Dropdown Kategori */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsStatusOpen(false); setIsDateOpen(false) }}
                                className="flex items-center justify-between gap-3 min-w-[160px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                            >
                                <span className="truncate">{activeCategory}</span>
                                <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCategoryOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsCategoryOpen(false)} />
                                    <div className="absolute left-0 top-full mt-1.5 w-52 max-h-[280px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { setActiveCategory(cat); setIsCategoryOpen(false) }}
                                                className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                                                    activeCategory.toLowerCase() === cat.toLowerCase()
                                                        ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dropdown Status */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => { setIsStatusOpen(!isStatusOpen); setIsCategoryOpen(false); setIsDateOpen(false) }}
                                className="flex items-center justify-between gap-3 min-w-[130px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap"
                            >
                                <span className="truncate">{statusFilter}</span>
                                <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isStatusOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsStatusOpen(false)} />
                                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30">
                                        {statusOptions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setStatusFilter(s); setIsStatusOpen(false) }}
                                                className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                                                    statusFilter === s
                                                        ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                                                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dropdown Tanggal/Waktu */}
                        <div className="relative z-30">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDateOpen(!isDateOpen)
                                    setIsCategoryOpen(false)
                                    setIsStatusOpen(false)
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#159447] hover:text-[#159447] transition-all whitespace-nowrap cursor-pointer"
                            >
                                <Calendar size={14} className="text-slate-500" />
                                <span>{dateFilter}</span>
                                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDateOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsDateOpen(false)} />
                                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 text-xs">
                                        <div className="space-y-0.5">
                                            {['Semua Waktu', 'Bulan Ini', 'Pilih Tanggal (Kustom)'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => {
                                                        setDateFilter(opt)
                                                        if (opt === 'Semua Waktu' || opt === 'Bulan Ini') {
                                                            setStartDate('')
                                                            setEndDate('')
                                                            setIsDateOpen(false)
                                                        }
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                                        dateFilter === opt ? 'text-[#159447] font-bold bg-[#f0fdf4]' : 'text-slate-600'
                                                    }`}
                                                >
                                                    <span>{opt}</span>
                                                    {dateFilter === opt && <Check size={14} className="text-[#159447]" />}
                                                </button>
                                            ))}
                                        </div>

                                        {dateFilter === 'Pilih Tanggal (Kustom)' && (
                                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600">
                                                        Mulai Tanggal
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] bg-white mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600">
                                                        Sampai Tanggal
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] bg-white mt-1"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDateOpen(false)}
                                                    className="w-full mt-2 py-1.5 px-3 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer text-center shadow-xs"
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TABEL DATA BERITA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-[#566276]/60 uppercase tracking-wider">
                                <th className="py-4 px-4 text-center w-14">NO</th>
                                <th className="py-4 px-4 text-center w-32">GAMBAR</th>
                                <th className="py-4 px-4 text-left w-72">JUDUL</th>
                                <th className="py-4 px-4 text-center w-36">KATEGORI</th>
                                <th className="py-4 px-4 text-center w-28">STATUS</th>
                                <th className="py-4 px-4 text-left w-32">PUBLIKASI</th>
                                <th className="py-4 px-4 text-left w-48">REPORTER</th>
                                <th className="py-4 px-4 text-center w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Tidak ada berita yang cocok dengan filter atau kata kunci.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 transition-colors group"
                                    >
                                        {/* NO */}
                                        <td className="py-4 px-4 text-center font-semibold text-slate-400 text-xs">
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </td>

                                        {/* GAMBAR */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="w-[84px] h-[54px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0 shadow-2xs mx-auto">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&q=80'
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* JUDUL */}
                                        <td className="py-4 px-4 text-left">
                                            <p
                                                onClick={() => setPreviewItem(item)}
                                                className="font-bold text-[#172135] text-xs sm:text-[13px] hover:text-[#159447] cursor-pointer transition-colors line-clamp-2"
                                            >
                                                {item.title}
                                            </p>
                                        </td>

                                        {/* KATEGORI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                                                        item.categories[0]
                                                    )}`}
                                                >
                                                    {item.categories[0]}
                                                </span>
                                                {item.categories.length > 1 && (
                                                    <span
                                                        title={item.categories.slice(1).join(', ')}
                                                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                                                    >
                                                        +{item.categories.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {item.status === 'Publish' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    Publish
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] text-[11px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                                                    Draft
                                                </span>
                                            )}
                                        </td>

                                        {/* PUBLIKASI */}
                                        <td className="py-4 px-4 text-left whitespace-nowrap">
                                            <div className="font-bold text-[#172135] text-xs">
                                                {item.date}
                                            </div>
                                            <div className="text-[11px] text-[#566276] mt-0.5">
                                                {item.time}
                                            </div>
                                        </td>

                                        {/* REPORTER */}
                                        <td className="py-4 px-4 text-left">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${item.reporter.avatarBg}`}
                                                >
                                                    {item.reporter.avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#172135] text-xs truncate">
                                                        {item.reporter.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#566276] truncate">
                                                        {item.reporter.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setPreviewItem(item)}
                                                    title="Lihat Detail"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => router.push('/admin/berita/tambah?id=' + item.id)}
                                                    title="Edit Berita"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Hapus Berita"
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 4. FOOTER PAGINASI */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    {/* Sisi Kiri: Menampilkan */}
                    <div className="text-sm font-medium text-slate-600">
                        <span>
                            Menampilkan <span className="font-bold text-[#172135]">{startItem} - {endItem}</span> dari{' '}
                            <span className="font-bold text-[#172135]">{sortedData.length}</span> berita
                        </span>
                    </div>

                    {/* Sisi Kanan: Navigasi Halaman */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {/* Tombol Sebelumnya */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
                                currentPage === 1
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447] shadow-xs'
                            }`}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {/* Angka Pagination */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, idx) =>
                                page === '...' ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 font-semibold text-xs"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            currentPage === page
                                                ? 'bg-[#159447] text-white shadow-sm shadow-green-200 scale-105'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#159447] hover:text-[#159447]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Tombol Selanjutnya */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                currentPage === totalPages
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    : 'bg-[#159447] text-white hover:bg-[#127a3a] shadow-sm shadow-green-200'
                            }`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. MODAL: TAMBAH BERITA BARU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-bold text-[#172135] text-base tracking-tight">Tambah Berita Baru</h3>
                                <p className="text-xs text-[#566276]">Isi formulir publikasi siaran pers daerah.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Judul Berita</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Optimalisasi MPP Digital..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">Ringkasan Berita</label>
                                <textarea
                                    rows={2}
                                    placeholder="Layanan terpadu cepat & ringkas..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Pelayanan">Pelayanan</option>
                                        <option value="Ekonomi">Ekonomi</option>
                                        <option value="Pemerintahan">Pemerintahan</option>
                                        <option value="Kesehatan">Kesehatan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as BeritaItem['status'],
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447] bg-white"
                                    >
                                        <option value="Publish">Publish</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Nama Reporter</label>
                                    <input
                                        type="text"
                                        value={formData.reporterName}
                                        onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#172135] mb-1">Jabatan / Role</label>
                                    <input
                                        type="text"
                                        value={formData.reporterRole}
                                        onChange={(e) => setFormData({ ...formData, reporterRole: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#172135] mb-1">URL Gambar Thumbnail</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#159447]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803d] text-white font-semibold shadow-xs cursor-pointer"
                                    style={{ backgroundColor: '#159447' }}
                                >
                                    Simpan & Publikasikan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. MODAL: LIHAT / PREVIEW DETAIL BERITA */}
            {previewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
                        <div className="relative h-48 w-full bg-slate-100">
                            <img
                                src={previewItem.image}
                                alt={previewItem.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
                                {previewItem.categories.map((cat, idx) => (
                                    <span
                                        key={idx}
                                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                                            cat
                                        )}`}
                                    >
                                        {cat}
                                    </span>
                                ))}
                                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#172135] shadow-xs">
                                    {previewItem.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 pt-2 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#172135] tracking-tight">{previewItem.title}</h3>
                                <p className="text-xs text-[#566276] mt-1 leading-relaxed">
                                    {previewItem.excerpt}
                                </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${previewItem.reporter.avatarBg}`}
                                    >
                                        {previewItem.reporter.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#172135]">{previewItem.reporter.name}</div>
                                        <div className="text-[11px] text-[#566276]">{previewItem.reporter.role}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-[#172135]">{previewItem.date}</div>
                                    <div className="text-[11px] text-[#566276]">{previewItem.time}</div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium text-xs text-[#566276] cursor-pointer"
                                >
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: KONFIRMASI HAPUS */}
            {deletingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#172135] text-sm tracking-tight">Hapus Berita Ini?</h4>
                            <p className="text-xs text-[#566276] mt-1">
                                Tindakan ini tidak dapat dibatalkan. Berita akan dihapus dari daftar publikasi.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-[#566276] hover:bg-slate-50 text-xs font-medium cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
                            >
                                Hapus Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}