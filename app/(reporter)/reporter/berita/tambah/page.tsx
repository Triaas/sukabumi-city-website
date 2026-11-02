'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Bold,
    Italic,
    Underline,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link2,
    Undo2,
    Redo2,
    Maximize2,
    ImageIcon,
    CloudUpload,
    RefreshCw,
    Trash2,
    Check,
    Plus,
    Send,
    Save,
    Eye,
    User,
    BadgeCheck,
    Clock3,
    AlignLeft,
    FileText,
    X,
    Search,
    ChevronDown,
} from 'lucide-react'

// ─── Master Data Kategori (22 Kategori) ─────────────────────────────────────────
const MASTER_CATEGORIES = [
    'Agama',
    'Artikel',
    'Bencana',
    'Diskominfo',
    'Ekonomi',
    'Hukum',
    'Infrastruktur',
    'Kesehatan',
    'Pelayanan Publik',
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

// ─── Dummy narasi ──────────────────────────────────────────────────────────
const DUMMY_NARASI = `<p><strong>SEMARANG</strong> — Pemerintah Daerah secara resmi meluncurkan integrasi ekosistem <strong><em>Satu Data Terpadu</em></strong> yang menyatukan basis layanan perizinan, kependudukan, dan bantuan sosial dalam satu arsitektur cloud terproteksi. Langkah ini dirancang guna memangkas durasi birokrasi permohonan publik dari rata-rata 5 hari kerja menjadi hitungan menit.</p><blockquote style="border-left:4px solid #cbd5e1;padding-left:1rem;color:#64748b;font-style:italic;margin:1rem 0">"Keterbukaan informasi bukan sekadar jargon administratif, melainkan fondasi akuntabilitas publik. Dengan sistem ini, seluruh aliran progres permohonan warga dapat dimonitor secara real-time tanpa celah pungutan liar."<br/><small style="font-style:normal;font-weight:600;color:#475569;display:block;margin-top:0.25rem">— Kepala Dinas Komunikasi dan Informatika</small></blockquote><p>Dalam tahap awal, terdapat 14 Organisasi Perangkat Daerah (OPD) yang langsung terhubung ke sistem komputasi bersama. Fasilitas ini didukung oleh enkripsi berlapis dan audit jejak digital berkala guna menjamin kerahasiaan identitas masyarakat sesuai regulasi Perlindungan Data Pribadi (UU PDP).</p>`

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
    icon: Icon,
    label,
    active = false,
    onClick,
}: {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()} // Wajib: cegah editor kehilangan fokus
            onClick={onClick}
            className={`flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer ${active ? 'bg-slate-200 text-slate-800' : ''}`}
        >
            <Icon size={14} strokeWidth={2} />
        </button>
    )
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const overflowCls = className.includes('overflow-') ? '' : 'overflow-hidden'
    return (
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs ${overflowCls} ${className}`}>
            {children}
        </div>
    )
}

// ─── Field Label ──────────────────────────────────────────────────────────────
function FieldLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#172135]">{children}</label>
            {right && <span className="text-[11px] text-slate-400 font-medium">{right}</span>}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReporterTambahBeritaPage() {
    const [title, setTitle] = useState(
        'Pemerintah Luncurkan Sistem Satu Data Terpadu Pelayanan'
    )

    // MOCK RBAC & DATA EDIT
    const [currentUserRole, setCurrentUserRole] = useState<'REPORTER'>('REPORTER') // Ganti default ke 'SUPER_ADMIN' | 'ADMIN_BERITA' | 'REPORTER'
    const currentUserName = 'Budi Santoso'

    // Waktu sekarang (WIB) sebagai batas maksimal jadwal publikasi (tidak boleh di masa depan)
    const getNowWib = () => {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).formatToParts(new Date())
        const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
        const hour = get('hour') === '24' ? '00' : get('hour')
        return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${hour}:${get('minute')}` }
    }
    const [nowWib, setNowWib] = useState<{ date: string; time: string } | null>(null)
    useEffect(() => {
        setNowWib(getNowWib())
        const id = setInterval(() => setNowWib(getNowWib()), 30000)
        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handlePublishDateChange = (value: string) => {
        const now = getNowWib()
        const date = value > now.date ? now.date : value
        setPublishDate(date)
        if (date === now.date && publishTime > now.time) setPublishTime(now.time)
    }
    const handlePublishTimeChange = (value: string) => {
        const now = getNowWib()
        setPublishTime(publishDate === now.date && value > now.time ? now.time : value)
    }
    const isEditMode = true as boolean // Set true jika membuka draft, false jika buat baru
    const originalReporterName = 'Budi Santoso' // Ditarik dari database jika isEditMode true
    const originalReporterRole = 'Reporter Lapangan'
    const reporterName = isEditMode ? originalReporterName : currentUserName
    const reporterInitials = reporterName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    const [caption, setCaption] = useState('Wakil Gubernur bersama Kepala Dinas')
    const [sourceCredit, setSourceCredit] = useState('Biro Administrasi Pimpinan & Humas')
    const [publishDate, setPublishDate] = useState('2025-05-18')
    const [publishTime, setPublishTime] = useState('14:30')
    const [selectedTags, setSelectedTags] = useState<string[]>(['Pelayanan Publik'])
    const [tagSearch, setTagSearch] = useState('')
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
    const tagDropdownRef = useRef<HTMLDivElement>(null)

    // Image Upload State
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFileName, setImageFileName] = useState<string>('')
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
            setImageFileName(file.name)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setImageFileName('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setImagePreview(URL.createObjectURL(file))
            setImageFileName(file.name)
        }
    }

    // Editor & Word Count State
    const editorRef = useRef<HTMLDivElement>(null)
    const [wordCount, setWordCount] = useState(0)

    // Fungsi untuk menghitung kata dari teks mentah (bukan HTML)
    const updateWordCount = () => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || ''
            const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
            setWordCount(words.length)
        }
    }

    // Hitung kata saat komponen pertama kali dirender
    useEffect(() => {
        updateWordCount()
    }, [])

    // Fungsi bantuan eksekusi format teks
    const execFormat = (command: string, value: string = '') => {
        document.execCommand(command, false, value)
        editorRef.current?.focus()
        updateWordCount()
    }

    const handleLink = () => {
        const url = prompt('Masukkan URL tautan:', 'https://')
        if (url) {
            execFormat('createLink', url)
        }
    }

    const charCount = title.length

    const removeTag = (tagToRemove: string) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove))
    }

    const selectTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags((prev) => [...prev, tag])
        }
        setTagSearch('')
        setIsTagDropdownOpen(false)
    }

    const filteredCategories = MASTER_CATEGORIES.filter(
        (cat) =>
            !selectedTags.includes(cat) &&
            cat.toLowerCase().includes(tagSearch.toLowerCase().trim())
    )

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
                setIsTagDropdownOpen(false)
            }
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsTagDropdownOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        const anchor = target.closest('a')
        if (anchor && anchor.href) {
            // Cegah behavior default dan buka link di tab baru
            e.preventDefault()
            window.open(anchor.href, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div className="w-full space-y-6 pb-10">

            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Link
                            href="/admin/berita"
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#159447] transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Kelola Berita
                        </Link>
                        <span className="text-[11px] font-semibold text-slate-300">/</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                            Publikasi Baru
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
                        Tulis Publikasi Baru
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed mt-1">
                        Lengkapi naskah narasi, unggah dokumentasi visual, dan atur jadwal rilis berita ke portal publik.
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-amber-600">Status: Draf Baru</span>
                    </div>
                </div>
            </div>

            {/* ── MAIN GRID ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ════════════════════════════════════════════════════════
                    KOLOM KIRI — lg:col-span-8
                ════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-8 space-y-6">

                    {/* A. Judul Berita Utama */}
                    <Card>
                        <div className="p-5">
                            <FieldLabel
                                right={
                                    <span className={charCount > 100 ? 'text-amber-500 font-semibold' : ''}>
                                        {charCount} / 120 Karakter
                                    </span>
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <FileText size={14} className="text-[#159447]" />
                                    Judul Berita Utama <span className="text-red-500 ml-0.5">*</span>
                                </span>
                            </FieldLabel>

                            <input
                                type="text"
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Pemerintah Luncurkan Sistem Satu Data Terpadu untuk Pelayanan..."
                                className="w-full bg-[#f8fafc] text-lg font-bold text-[#172135] placeholder:text-slate-300 placeholder:font-normal border-0 border-b-2 border-transparent focus:border-[#159447] focus:bg-white outline-none rounded-xl px-4 py-3 transition-all duration-200"
                            />

                            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                                Pastikan judul tidak melebihi 120 karakter untuk optimalisasi indeks pencarian publik dan portal berita seluler.
                            </p>
                        </div>
                    </Card>

                    {/* B. Gambar Utama Berita */}
                    <Card>
                        <div className="p-5">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <div className="flex items-center justify-between mb-1">
                                <FieldLabel>
                                    <span className="flex items-center gap-2">
                                        <ImageIcon size={14} className="text-[#159447]" />
                                        Gambar Utama Berita <span className="text-red-500 ml-0.5">*</span>
                                    </span>
                                </FieldLabel>
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    Batas 5 MB
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                                Format disarankan: JPG, WebP rasio 16:9 beresolusi minimal 1280×720 px.
                            </p>

                            {/* Image Preview OR Upload Placeholder */}
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview gambar berita"
                                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                    {/* File name — bottom left */}
                                    {imageFileName && (
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg max-w-[80%] truncate">
                                            <ImageIcon size={12} className="shrink-0" />
                                            <span className="truncate">{imageFileName}</span>
                                        </div>
                                    )}

                                    {/* Actions — bottom right: HANYA ikon Trash */}
                                    <div className="absolute bottom-3 right-3">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            title="Hapus gambar"
                                            className="flex items-center justify-center w-8 h-8 bg-white/95 hover:bg-red-50 rounded-lg shadow-sm text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full aspect-video sm:aspect-[21/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                                            ? 'border-[#159447] bg-[#f0fdf4]'
                                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                                        <ImageIcon size={22} className="text-slate-400" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 max-w-sm mb-1 leading-relaxed">
                                        Tarik dan lepas gambar ke area ini, atau klik tombol untuk mengunggah dari perangkat Anda.
                                    </p>
                                    <p className="text-[11px] text-slate-400 mb-3.5">
                                        Mendukung file JPG, PNG, atau WebP (Rasio 16:9, Maks. 5 MB)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                                    >
                                        <CloudUpload size={14} className="text-[#159447]" />
                                        <span>Pilih Berkas</span>
                                    </button>
                                </div>
                            )}

                            {/* Caption & Source */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                        Keterangan / Caption Foto
                                    </label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Wakil Gubernur bersama Kepala Dinas..."
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                        Sumber Foto / Atribusi
                                    </label>
                                    <input
                                        type="text"
                                        value={sourceCredit}
                                        onChange={(e) => setSourceCredit(e.target.value)}
                                        placeholder="Biro Administrasi Pimpinan & Humas"
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* C. Naskah Narasi Lengkap */}
                    <Card>
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <AlignLeft size={14} className="text-[#159447]" />
                                <span className="text-xs font-bold text-[#172135]">
                                    Naskah Narasi Lengkap <span className="text-red-500">*</span>
                                </span>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="px-4 py-2 border-b border-slate-100 bg-[#fafafa]">
                            <div className="flex flex-wrap items-center gap-0.5">
                                <ToolbarBtn
                                    icon={Bold}
                                    label="Bold"
                                    onClick={() => execFormat('bold')}
                                />
                                <ToolbarBtn
                                    icon={Italic}
                                    label="Italic"
                                    onClick={() => execFormat('italic')}
                                />
                                <ToolbarBtn
                                    icon={Underline}
                                    label="Underline"
                                    onClick={() => execFormat('underline')}
                                />
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={Heading2}
                                    label="Heading 2"
                                    onClick={() => execFormat('formatBlock', 'H2')}
                                />
                                <ToolbarBtn
                                    icon={Heading3}
                                    label="Heading 3"
                                    onClick={() => execFormat('formatBlock', 'H3')}
                                />
                                <button
                                    type="button"
                                    title="Format Paragraf Normal"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => execFormat('formatBlock', 'P')}
                                    className="flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                                >
                                    Paragraf
                                </button>
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={List}
                                    label="Bullet List"
                                    onClick={() => execFormat('insertUnorderedList')}
                                />
                                <ToolbarBtn
                                    icon={ListOrdered}
                                    label="Numbered List"
                                    onClick={() => execFormat('insertOrderedList')}
                                />
                                <ToolbarBtn
                                    icon={Quote}
                                    label="Blockquote"
                                    onClick={() => execFormat('formatBlock', 'BLOCKQUOTE')}
                                />
                                <ToolbarBtn
                                    icon={Link2}
                                    label="Tautan"
                                    onClick={handleLink}
                                />
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <ToolbarBtn
                                    icon={Undo2}
                                    label="Undo"
                                    onClick={() => execFormat('undo')}
                                />
                                <ToolbarBtn
                                    icon={Redo2}
                                    label="Redo"
                                    onClick={() => execFormat('redo')}
                                />
                                <ToolbarBtn
                                    icon={Maximize2}
                                    label="Layar Penuh"
                                    onClick={() => {
                                        if (editorRef.current) {
                                            if (!document.fullscreenElement) {
                                                editorRef.current.requestFullscreen?.()
                                            } else {
                                                document.exitFullscreen?.()
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div
                            ref={editorRef}
                            onInput={updateWordCount}
                            onClick={handleEditorClick}
                            className="px-5 py-5 min-h-[320px] bg-[#f8fafc] text-sm leading-relaxed text-slate-700 editor-content [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-800"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: DUMMY_NARASI }}
                            suppressContentEditableWarning
                            contentEditable
                            style={{ outline: 'none' }}
                        />

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
                            <span className="text-[11px] text-slate-500 font-medium">{wordCount} Kata</span>
                        </div>
                    </Card>
                </div>

                {/* ════════════════════════════════════════════════════════
                    KOLOM KANAN — lg:col-span-4
                ════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-4 space-y-6">

                    {/* A. Jadwal Publikasi Publik */}
                    {currentUserRole !== 'REPORTER' && (
                        <Card>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-3.5">
                                    <Clock3 size={14} className="text-[#159447]" />
                                    <span className="text-xs font-bold text-[#172135]">Jadwal Publikasi Publik</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                            Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            value={publishDate}
                                            max={nowWib?.date}
                                            onChange={(e) => handlePublishDateChange(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                            Waktu (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            value={publishTime}
                                            max={nowWib && publishDate === nowWib.date ? nowWib.time : undefined}
                                            onChange={(e) => handlePublishTimeChange(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                                    Berita akan muncul langsung di feeds aplikasi warga dan portal utama sesuai jadwal. Tanggal & waktu tidak boleh melebihi waktu saat ini.
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* B. Jurnalis / Reporter */}
                    <Card>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3.5">
                                <User size={14} className="text-[#159447]" />
                                <span className="text-xs font-bold text-[#172135]">Jurnalis / Reporter</span>
                            </div>

                            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl">
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center text-xs font-bold shrink-0">
                                    {reporterInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#172135] truncate">
                                        {reporterName}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{isEditMode ? originalReporterRole : 'Pranata Humas'}</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                                {isEditMode ? 'Kreator naskah asli (terkunci).' : 'Terisi otomatis dari sesi admin yang sedang aktif.'}
                            </p>
                        </div>
                    </Card>

                    {/* C. Tag Kategori Berita */}
                    <Card className="overflow-visible relative z-20">
                        <div className="p-4" ref={tagDropdownRef}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-[#159447]" />
                                    <span className="text-xs font-bold text-[#172135]">Tag Kategori Berita</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    {selectedTags.length} Dipilih
                                </span>
                            </div>

                            {/* Area Selected Tags */}
                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {selectedTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]"
                                        >
                                            <span>#{tag.replace(/\s/g, '')}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                title={`Hapus tag ${tag}`}
                                                className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:bg-[#16a34a]/20 text-[#16a34a] transition-colors cursor-pointer"
                                            >
                                                <X size={10} strokeWidth={2.5} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Input & Dropdown */}
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={tagSearch}
                                        onChange={(e) => {
                                            setTagSearch(e.target.value)
                                            if (!isTagDropdownOpen) setIsTagDropdownOpen(true)
                                        }}
                                        onFocus={() => setIsTagDropdownOpen(true)}
                                        placeholder="Cari atau pilih kategori..."
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180 text-[#159447]' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* List Dropdown */}
                                {isTagDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-1.5 overscroll-contain">
                                        {filteredCategories.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {filteredCategories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => selectTag(cat)}
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#f0fdf4] hover:text-[#159447] transition-colors flex items-center justify-between cursor-pointer group"
                                                    >
                                                        <span>{cat}</span>
                                                        <Plus
                                                            size={12}
                                                            className="text-slate-300 group-hover:text-[#159447] transition-colors"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-4 text-center">
                                                <p className="text-xs text-slate-400">
                                                    {tagSearch
                                                        ? `Kategori "${tagSearch}" tidak ditemukan`
                                                        : 'Semua kategori sudah dipilih'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* D. Action Buttons */}
                    <div className="space-y-2.5">
                        {/* Terbitkan */}
                        <button
                            type="button"
                            // TODO: Jika role REPORTER, paksa payload status menjadi 'Menunggu Review' atau 'Draft' saat disubmit.
                            onClick={() => { }}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#159447] hover:bg-[#12803d] active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            style={{ backgroundColor: '#159447' }}
                        >
                            <Send size={16} />
                            {currentUserRole === 'REPORTER' ? 'Kirim Draf untuk Review' : 'Terbitkan Berita'}
                        </button>

                        {/* Secondary */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                <Save size={14} />
                                Simpan Draf
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8fafc] border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                <Eye size={14} />
                                Pratinjau
                            </button>
                        </div>
                    </div>

                </div>
                {/* ─── End Kolom Kanan ─────────────────────────────────── */}

            </div>
        </div>
    )
}
