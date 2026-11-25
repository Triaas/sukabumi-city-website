import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPlaceholderPage() {
  await requireRole(['SUPER_ADMIN']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
          Manajemen User
        </h1>
        <p className="mt-1 text-sm text-[#566276] leading-relaxed">
          Pengelolaan akun pengelola portal dan penetapan hak akses kedinasan.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 text-[#159447] flex items-center justify-center shrink-0">
            <Users size={20} aria-hidden="true" />
          </div>
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#172135]">
                Modul Manajemen User
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-900">
                Segera Hadir (Fase 3)
              </span>
            </div>
            <p className="text-sm text-[#566276] leading-relaxed">
              Antarmuka pembuatan akun baru, pengubahan peran, penonaktifan akun,
              serta fitur reset kata sandi akan diaktifkan pada Fase 3.
            </p>
            <div className="pt-1">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#172135] transition-colors"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Kembali ke Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
