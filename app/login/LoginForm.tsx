'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction } from '@/lib/auth/actions';

interface LoginFormProps {
  nextPath: string;
  isDevelopment: boolean;
}

interface DevQuickAccount {
  label: string;
  email: string;
  password: string;
}

const DEV_TEST_ACCOUNTS: DevQuickAccount[] = [
  {
    label: 'Super Admin',
    email: 'superadmin@sukabumikota.go.id',
    password: 'AdminSukabumi123!',
  },
  {
    label: 'Admin Berita',
    email: 'adminberita@sukabumikota.go.id',
    password: 'BeritaSukabumi123!',
  },
  {
    label: 'Reporter',
    email: 'reporter@sukabumikota.go.id',
    password: 'ReporterSukabumi123!',
  },
];

export default function LoginForm({ nextPath, isDevelopment }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    const formData = new FormData();
    formData.set('email', trimmedEmail);
    formData.set('password', password);
    if (rememberMe) {
      formData.set('remember_me', 'true');
    }
    if (nextPath) {
      formData.set('next', nextPath);
    }

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Email atau kata sandi salah');
      }
    });
  };

  const handleQuickFill = (account: DevQuickAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
          >
            Alamat Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="nama@sukabumikota.go.id"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 motion-reduce:transition-none"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isPending}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Masukkan kata sandi"
              className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 motion-reduce:transition-none"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
              }
              aria-pressed={showPassword}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-0.5">
          <label
            htmlFor="login-remember"
            className="inline-flex items-center gap-2.5 min-h-[44px] pr-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-[#172135]"
          >
            <input
              id="login-remember"
              name="remember_me"
              type="checkbox"
              checked={rememberMe}
              disabled={isPending}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 accent-[#12803d] cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2"
            />
            <span>Ingat saya selama 7 hari</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[46px] rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          {isPending ? (
            <>
              <Loader2
                size={17}
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
              <span>Memverifikasi akun...</span>
            </>
          ) : (
            <span>Masuk ke Portal</span>
          )}
        </button>

        <p className="pt-1 text-center text-xs text-[#566276] leading-relaxed">
          Lupa kata sandi? Hubungi Super Admin untuk reset kata sandi.
        </p>
      </form>

      {isDevelopment && (
        <div className="pt-5 border-t border-slate-200">
          <h2 className="text-xs font-bold text-[#172135] mb-1">
            Pengisi Cepat Akun Uji Coba (Mode Pengembangan)
          </h2>
          <p className="text-xs text-[#566276] mb-3">
            Pilih peran di bawah untuk mengisi kredensial lokal secara otomatis.
          </p>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-2">
            {DEV_TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={isPending}
                onClick={() => handleQuickFill(acc)}
                className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200/70 text-xs font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
