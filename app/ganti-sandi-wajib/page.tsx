import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  PASSWORD_EXPIRY_DAYS,
  getCurrentUser,
  getDefaultDashboardPath,
  logoutAction,
} from '@/lib/auth';
import ForceChangePasswordForm from './ForceChangePasswordForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pembaruan Kata Sandi Wajib | Pemerintah Kota Sukabumi',
  description:
    'Pembaruan kata sandi berkala akun pengelola Portal Resmi Pemerintah Kota Sukabumi.',
};

export default async function ForceChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (!user.mustChangePassword && !user.isPasswordExpired) {
    redirect(getDefaultDashboardPath(user.role));
  }

  const reasonText = user.mustChangePassword
    ? 'Akun Anda menggunakan kata sandi awal atau sementara dari Super Admin. Buat kata sandi baru sebelum mengakses ruang kerja.'
    : `Masa berlaku kata sandi akun Anda telah mencapai batas ${PASSWORD_EXPIRY_DAYS} hari sesuai kebijakan keamanan berkala. Perbarui kata sandi untuk melanjutkan.`;

  return (
    <div className="min-h-dvh w-full bg-[#f4f7f6] flex flex-col justify-between px-4 py-8 sm:px-6 sm:py-12">
      <main className="w-full max-w-[480px] mx-auto my-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-[#159447]" aria-hidden="true" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-200/80">
              <img
                src="/images/Lambang_Kota_Sukabumi.png"
                alt="Lambang Pemerintah Kota Sukabumi"
                width={48}
                height={48}
                fetchPriority="high"
                className="w-12 h-12 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#566276] truncate">
                  {user.email}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#172135] tracking-tight leading-snug">
                  Perbarui Kata Sandi
                </h1>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-950 leading-relaxed">
              {reasonText}
            </div>

            <ForceChangePasswordForm />

            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs text-[#566276]">
                Ingin masuk menggunakan akun lain?
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Keluar dari Akun
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-[#566276]">
        Diskominfo Kota Sukabumi
      </footer>
    </div>
  );
}
