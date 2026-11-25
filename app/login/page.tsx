import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, resolveSafeRedirectPath } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Masuk Portal Pengelola | Pemerintah Kota Sukabumi',
  description:
    'Halaman autentikasi pengelola internal Portal Resmi Pemerintah Kota Sukabumi.',
};

interface LoginPageProps {
  searchParams?: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const nextPath = resolvedParams.next?.trim() || '';

  const currentUser = await getCurrentUser();
  if (currentUser) {
    if (currentUser.mustChangePassword || currentUser.isPasswordExpired) {
      redirect('/ganti-sandi-wajib');
    }
    redirect(resolveSafeRedirectPath(nextPath, currentUser.role));
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-dvh w-full bg-[#f4f7f6] flex flex-col justify-between px-4 py-8 sm:px-6 sm:py-12">
      <main className="w-full max-w-[440px] mx-auto my-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-[#159447]" aria-hidden="true" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-200/80">
              <img
                src="/images/Lambang_Kota_Sukabumi.png"
                alt="Lambang Pemerintah Kota Sukabumi"
                width={52}
                height={52}
                fetchPriority="high"
                className="w-[52px] h-[52px] object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#566276]">
                  Pemerintah Kota Sukabumi
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#172135] tracking-tight leading-snug">
                  Masuk Portal Pengelola
                </h1>
              </div>
            </div>

            <LoginForm nextPath={nextPath} isDevelopment={isDevelopment} />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#566276] hover:text-[#172135] hover:bg-slate-200/60 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Kembali ke Beranda Publik
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-[#566276]">
        Diskominfo Kota Sukabumi
      </footer>
    </div>
  );
}
