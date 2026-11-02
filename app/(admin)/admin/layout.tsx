'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Newspaper,
    Megaphone,
    FileText,
    MonitorPlay,
    LogOut,
    User
} from 'lucide-react'

// Konfigurasi daftar menu sidebar
const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Berita', href: '/admin/berita', icon: Newspaper },
    { name: 'Pengumuman', href: '/admin/pengumuman', icon: Megaphone },
    { name: 'Transparansi Dokumen', href: '/admin/transparansi', icon: FileText },
    { name: 'Banner Beranda', href: '/admin/banner', icon: MonitorPlay },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const currentUserRole = 'SUPER_ADMIN' as 'SUPER_ADMIN' | 'ADMIN_BERITA' // Ganti-ganti untuk testing

    const filteredMenuItems = menuItems.filter(item => {
        if (currentUserRole === 'SUPER_ADMIN') return true;

        // Jika role adalah ADMIN_BERITA, hanya tampilkan menu Dashboard dan Berita
        if (currentUserRole === 'ADMIN_BERITA') {
            return ['Dashboard', 'Berita'].includes(item.name);
        }

        return false;
    });

    return (
        <div className="flex h-screen w-full bg-[#f4f7f6] overflow-hidden" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>

            {/* SIDEBAR */}
            <aside className="w-[260px] bg-[#f8fafc] border-r border-slate-200 flex flex-col shrink-0">

                {/* Logo / Header Sidebar */}
                <div className="px-5 py-5 flex items-center gap-3.5 border-b border-slate-200/60 mb-2">
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                        <Image
                            src="/images/Lambang_Kota_Sukabumi.png"
                            alt="Lambang Kota Sukabumi"
                            width={56}
                            height={56}
                            className="w-full h-full object-contain drop-shadow-sm"
                            priority
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm sm:text-xl font-bold text-[#172135] leading-tight tracking-tight">
                            Portal Admin
                        </h1>
                    </div>
                </div>

                {/* Area Navigasi Menu */}
                <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
                    <div className="pt-2 text-[10px] font-bold text-[#566276]/60 uppercase tracking-widest mb-3 px-2">
                        Menu Utama
                    </div>

                    {filteredMenuItems.map((item) => {
                        // Deteksi menu mana yang sedang aktif
                        const isActive =
                            pathname === item.href ||
                            (pathname?.startsWith(item.href + '/') && item.href !== '/admin')

                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${isActive
                                    ? 'bg-[#159447] text-white shadow-md shadow-green-900/10 font-semibold'
                                    : 'text-[#566276] font-medium hover:bg-slate-100 hover:text-[#172135]'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-[#566276]'} />
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
                                <p className="text-[13px] font-bold text-[#172135] truncate tracking-tight">
                                    Trias Firmansyah
                                </p>
                                <p className="text-[10px] text-[#566276] font-medium">
                                    {currentUserRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Berita'}
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