'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  FileText,
  MonitorPlay,
  SlidersHorizontal,
  Users,
  ChevronUp,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';
import type { UserRole } from '@/lib/auth/types';

export interface AdminShellUser {
  id: number;
  name: string;
  email: string;
  role: Extract<UserRole, 'SUPER_ADMIN' | 'ADMIN_BERITA'>;
}

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, superAdminOnly: false },
  { name: 'Berita', href: '/admin/berita', icon: Newspaper, superAdminOnly: false },
  { name: 'Pengumuman', href: '/admin/pengumuman', icon: Megaphone, superAdminOnly: true },
  {
    name: 'Transparansi Dokumen',
    href: '/admin/transparansi',
    icon: FileText,
    superAdminOnly: true,
  },
  { name: 'Banner Beranda', href: '/admin/banner', icon: MonitorPlay, superAdminOnly: true },
  {
    name: 'Pengaturan Beranda',
    href: '/admin/pengaturan',
    icon: SlidersHorizontal,
    superAdminOnly: true,
  },
  { name: 'Manajemen User', href: '/admin/users', icon: Users, superAdminOnly: true },
];

export default function AdminShell({
  user,
  children,
}: {
  user: AdminShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredMenuItems = menuItems.filter(
    (item) => user.role === 'SUPER_ADMIN' || !item.superAdminOnly
  );

  const roleLabel =
    user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Berita';

  return (
    <div
      className="flex min-h-screen w-full bg-[#f4f7f6]"
      style={{ fontFamily: "'Inter', Arial, sans-serif" }}
    >
      <aside className="sticky top-0 h-screen w-[260px] bg-[#f8fafc] border-r border-slate-200 flex flex-col shrink-0">
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
            <span className="text-sm sm:text-xl font-bold text-[#172135] leading-tight tracking-tight">
              Portal Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <div className="pt-2 text-[10px] font-bold text-[#566276]/60 uppercase tracking-widest mb-3 px-2">
            Menu Utama
          </div>

          {filteredMenuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href + '/') && item.href !== '/admin');

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#159447] text-white shadow-md shadow-green-900/10 font-semibold'
                    : 'text-[#566276] font-medium hover:bg-slate-100 hover:text-[#172135]'
                }`}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={isActive ? 'text-white' : 'text-[#566276]'}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div
          ref={profileMenuRef}
          className="relative p-4 border-t border-slate-200"
        >
          <div
            role="menu"
            aria-hidden={!isProfileOpen}
            className={`absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-200 ease-out origin-bottom ${
              isProfileOpen
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            }`}
          >
            <Link
              href="/admin/profil"
              onClick={() => setIsProfileOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 w-full min-h-[40px] px-3 py-2.5 rounded-lg text-xs font-semibold text-[#172135] hover:bg-slate-100 transition-colors"
            >
              <Settings size={15} aria-hidden="true" className="text-[#566276]" />
              Edit Profil
            </Link>

            <div className="my-1 h-px bg-slate-100" />

            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex items-center gap-2.5 w-full min-h-[40px] px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} aria-hidden="true" className="text-red-500" />
                Keluar
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            className={`w-full border rounded-xl p-3 flex items-center justify-between shadow-sm transition-all duration-200 cursor-pointer text-left ${
              isProfileOpen
                ? 'bg-slate-100 border-[#159447]/40 ring-2 ring-[#159447]/10'
                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-[#159447] w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                <User size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#172135] truncate tracking-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-[#566276] font-medium">
                  {roleLabel}
                </p>
              </div>
            </div>
            <span
              className={`text-slate-400 p-1.5 rounded-lg transition-transform duration-200 shrink-0 ${
                isProfileOpen ? 'rotate-180 text-[#159447]' : ''
              }`}
            >
              <ChevronUp size={16} aria-hidden="true" />
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
