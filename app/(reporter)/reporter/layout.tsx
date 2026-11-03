'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Newspaper, ChevronUp, Settings, LogOut, User } from 'lucide-react'

// Konfigurasi daftar menu sidebar khusus Reporter
const menuItems = [
    { name: 'Berita Saya', href: '/reporter/berita', icon: Newspaper },
]

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsProfileOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

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
                            Portal Reporter
                        </h1>
                    </div>
                </div>

                {/* Area Navigasi Menu */}
                <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
                    <div className="pt-2 text-[10px] font-bold text-[#566276]/60 uppercase tracking-widest mb-3 px-2">
                        Ruang Kerja
                    </div>

                    {menuItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname?.startsWith(item.href + '/')

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
                <div ref={profileMenuRef} className="relative p-4 border-t border-slate-200">
                    {/* Menu Dropup Popover */}
                    <div
                        role="menu"
                        aria-hidden={!isProfileOpen}
                        className={`absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-200 ease-out origin-bottom ${isProfileOpen
                            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                            }`}
                    >
                        <Link
                            href="/reporter/profil"
                            onClick={() => setIsProfileOpen(false)}
                            role="menuitem"
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-[#172135] hover:bg-slate-100 transition-colors"
                        >
                            <Settings size={15} className="text-[#566276]" />
                            Edit Profil
                        </Link>

                        <div className="my-1 h-px bg-slate-100" />

                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(false)}
                            role="menuitem"
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <LogOut size={15} className="text-red-500" />
                            Keluar
                        </button>
                    </div>

                    {/* Tombol Trigger Profil */}
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen((prev) => !prev)}
                        aria-expanded={isProfileOpen}
                        aria-haspopup="menu"
                        className={`w-full border rounded-xl p-3 flex items-center justify-between shadow-sm transition-all duration-200 cursor-pointer text-left ${isProfileOpen
                            ? 'bg-slate-100 border-[#159447]/40 ring-2 ring-[#159447]/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-[#16a34a] w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                                <User size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-[#172135] truncate tracking-tight">
                                    Budi Santoso
                                </p>
                                <p className="text-[10px] text-[#566276] font-medium">
                                    Reporter
                                </p>
                            </div>
                        </div>
                        <span
                            className={`text-slate-400 p-1.5 rounded-lg transition-transform duration-200 shrink-0 ${isProfileOpen ? 'rotate-180 text-[#159447]' : ''
                                }`}
                        >
                            <ChevronUp size={16} />
                        </span>
                    </button>
                </div>
            </aside>

            {/* KONTEN UTAMA (Kanan) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="h-full overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>

        </div>
    )
}