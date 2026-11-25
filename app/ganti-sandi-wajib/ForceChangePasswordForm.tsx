'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { forceChangePasswordAction } from '@/lib/auth/actions';

export default function ForceChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal harus terdiri dari 8 karakter.');
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMessage(
        'Kata sandi baru wajib mengandung kombinasi huruf dan angka.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    const formData = new FormData();
    formData.set('current_password', currentPassword);
    formData.set('new_password', newPassword);
    formData.set('confirm_password', confirmPassword);

    startTransition(async () => {
      const result = await forceChangePasswordAction(formData);
      if (result && !result.success) {
        setErrorMessage(
          result.error || 'Gagal memperbarui kata sandi. Silakan coba kembali.'
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="force-current-password"
          className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
        >
          Kata Sandi Saat Ini
        </label>
        <div className="relative">
          <input
            id="force-current-password"
            name="current_password"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={isPending}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Masukkan kata sandi saat ini"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 motion-reduce:transition-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowCurrent((prev) => !prev)}
            aria-label={
              showCurrent
                ? 'Sembunyikan kata sandi saat ini'
                : 'Tampilkan kata sandi saat ini'
            }
            aria-pressed={showCurrent}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
          >
            {showCurrent ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="force-new-password"
          className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
        >
          Kata Sandi Baru
        </label>
        <div className="relative">
          <input
            id="force-new-password"
            name="new_password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            required
            disabled={isPending}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Minimal 8 karakter, huruf dan angka"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 motion-reduce:transition-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowNew((prev) => !prev)}
            aria-label={
              showNew
                ? 'Sembunyikan kata sandi baru'
                : 'Tampilkan kata sandi baru'
            }
            aria-pressed={showNew}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
          >
            {showNew ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="force-confirm-password"
          className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
        >
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative">
          <input
            id="force-confirm-password"
            name="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            disabled={isPending}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Ulangi kata sandi baru"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 motion-reduce:transition-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowConfirm((prev) => !prev)}
            aria-label={
              showConfirm
                ? 'Sembunyikan konfirmasi kata sandi baru'
                : 'Tampilkan konfirmasi kata sandi baru'
            }
            aria-pressed={showConfirm}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
          >
            {showConfirm ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-[#566276] space-y-1 leading-relaxed">
        <p className="font-semibold text-[#172135]">Ketentuan kata sandi:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Minimal 8 karakter dengan kombinasi huruf dan angka.</li>
          <li>
            Tidak boleh sama dengan kata sandi yang sedang atau pernah digunakan
            sebelumnya.
          </li>
        </ul>
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
            <span>Menyimpan kata sandi baru...</span>
          </>
        ) : (
          <span>Simpan Kata Sandi Baru</span>
        )}
      </button>
    </form>
  );
}
