'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Newspaper,
    Megaphone,
    FileText,
    MonitorPlay,
    Settings,
    LogOut,
    Landmark,
    User
} from 'lucide-react'

// Konfigurasi daftar menu sidebar
const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kelola Berita', href: '/admin/berita', icon: Newspaper },
    { name: 'Pengumuman Resmi', href: '/admin/pengumuman', icon: Megaphone },
    { name: 'Transparansi Keuangan', href: '/admin/transparansi', icon: FileText },
    { name: 'Kelola Slider', href: '/admin/slider', icon: MonitorPlay },
    { name: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-full bg-[#f4f7f6] overflow-hidden font-sans">

            {/* SIDEBAR */}
            <aside className="w-[260px] bg-[#f8fafc] border-r border-slate-200 flex flex-col shrink-0">

                {/* Logo / Header Sidebar */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-[#159447] p-2.5 rounded-xl text-white shadow-sm">
                        <Landmark size={22} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[15px] font-extrabold text-[#1b293c] leading-tight">
                            Portal Pemda
                        </h1>
                        <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">
                            Sistem Informasi Publik
                        </p>
                    </div>
                </div>

                {/* Area Navigasi Menu */}
                <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                        Menu Utama
                    </div>

                    {menuItems.map((item) => {
                        // Deteksi menu mana yang sedang aktif
                        const isActive =
                            pathname === item.href ||
                            (pathname?.startsWith(item.href + '/') && item.href !== '/admin')

                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-[#159447] text-white shadow-md shadow-green-900/10'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#1b293c]'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Profil & Logout Area (Bawah) */}
                <div className="p-4 border-t border-slate-200">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm transition-hover hover:border-slate-300">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-[#159447] w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                                <User size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-[#1b293c] truncate">
                                    Trias Firmansyah
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    Admin Utama
                                </p>
                            </div>
                        </div>
                        <button
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                            title="Keluar"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* KONTEN UTAMA (Kanan) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Konten tiap halaman akan dirender di sini dan bisa di-scroll mandiri */}
                <div className="h-full overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>

        </div>
    )
}