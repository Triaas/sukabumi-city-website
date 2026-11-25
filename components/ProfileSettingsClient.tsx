'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import {
  changeOwnPasswordAction,
  updateOwnProfileAction,
} from '@/lib/auth/actions';
import type { UserRole } from '@/lib/auth/types';

interface ProfileSettingsClientProps {
  initialName: string;
  email: string;
  role: UserRole;
}

function getRoleDisplayLabel(role: UserRole): string {
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  if (role === 'ADMIN_BERITA') return 'Admin Berita';
  return 'Reporter';
}

export default function ProfileSettingsClient({
  initialName,
  email,
  role,
}: ProfileSettingsClientProps) {
  const router = useRouter();
  const roleLabel = getRoleDisplayLabel(role);

  const [fullName, setFullName] = useState(initialName);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isProfilePending, startProfileTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
    general?: string;
  }>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setProfileError('Nama lengkap tidak boleh kosong.');
      return;
    }

    const formData = new FormData();
    formData.set('name', trimmedName);

    startProfileTransition(async () => {
      const result = await updateOwnProfileAction(formData);
      if (!result.success) {
        setProfileError(result.error || 'Gagal memperbarui profil akun.');
        return;
      }
      setFullName(trimmedName);
      setProfileSuccess('Informasi profil berhasil diperbarui.');
      router.refresh();
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');

    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errors.current = 'Kata sandi saat ini wajib diisi.';
    }

    if (!newPassword) {
      errors.new = 'Kata sandi baru wajib diisi.';
    } else if (newPassword.length < 8) {
      errors.new = 'Kata sandi baru minimal harus terdiri dari 8 karakter.';
    } else if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      errors.new = 'Kata sandi baru wajib mengandung kombinasi huruf dan angka.';
    }

    if (!confirmPassword) {
      errors.confirm = 'Konfirmasi kata sandi baru wajib diisi.';
    } else if (confirmPassword !== newPassword) {
      errors.confirm =
        'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});

    const formData = new FormData();
    formData.set('current_password', currentPassword);
    formData.set('new_password', newPassword);
    formData.set('confirm_password', confirmPassword);

    startPasswordTransition(async () => {
      const result = await changeOwnPasswordAction(formData);
      if (!result.success) {
        setPasswordErrors({
          general: result.error || 'Gagal memperbarui kata sandi.',
        });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Kata sandi akun Anda berhasil diperbarui.');
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
          Pengaturan Profil
        </h1>
        <p className="mt-1 text-sm text-[#566276] leading-relaxed">
          Kelola informasi data diri dan keamanan kata sandi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#159447]">
              <User size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#172135]">
                Informasi Akun
              </h2>
              <p className="text-xs text-[#566276]">
                Data diri dan identitas kedinasan Anda
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#159447] text-lg font-bold text-white shadow-sm">
              {getInitials(fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-[#172135]">
                {fullName || 'Pengguna'}
              </p>
              <p className="truncate text-xs text-[#566276] mt-0.5">{email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold text-[#12803d]">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-xs font-medium text-[#12803d]"
            >
              <Check size={16} aria-hidden="true" className="shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} aria-hidden="true" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  maxLength={150}
                  disabled={isProfilePending}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (profileError) setProfileError('');
                    if (profileSuccess) setProfileSuccess('');
                  }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full min-h-[44px] rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    profileError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
              </div>
              {profileError && (
                <p
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle
                    size={14}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{profileError}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Alamat Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} aria-hidden="true" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className="w-full min-h-[44px] cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm text-[#566276]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#566276] leading-relaxed">
                Email kedinasan bersifat tetap. Hubungi Super Admin jika
                diperlukan perubahan.
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Peran / Hak Akses
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Shield size={16} aria-hidden="true" />
                </span>
                <input
                  id="role"
                  type="text"
                  value={roleLabel}
                  disabled
                  readOnly
                  className="w-full min-h-[44px] cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm font-medium text-[#566276]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isProfilePending}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#12803d] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0e6b32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isProfilePending ? (
                  <>
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} aria-hidden="true" />
                    <span>Simpan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#159447]">
              <KeyRound size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#172135]">
                Keamanan Akun
              </h2>
              <p className="text-xs text-[#566276]">
                Perbarui kata sandi secara berkala setiap 30 hari
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-xs font-medium text-[#12803d]"
            >
              <Check size={16} aria-hidden="true" className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordErrors.general && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800"
            >
              <AlertCircle
                size={16}
                aria-hidden="true"
                className="shrink-0 mt-0.5"
              />
              <span>{passwordErrors.general}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} aria-hidden="true" />
                </span>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isPasswordPending}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.current || passwordErrors.general) {
                      setPasswordErrors((prev) => ({
                        ...prev,
                        current: undefined,
                        general: undefined,
                      }));
                    }
                  }}
                  placeholder="Masukkan kata sandi saat ini"
                  className={`w-full min-h-[44px] rounded-xl border bg-white pl-10 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    passwordErrors.current
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  disabled={isPasswordPending}
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword
                      ? 'Sembunyikan kata sandi saat ini'
                      : 'Tampilkan kata sandi saat ini'
                  }
                  aria-pressed={showCurrentPassword}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447]"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle
                    size={14}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{passwordErrors.current}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} aria-hidden="true" />
                </span>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isPasswordPending}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.new || passwordErrors.general) {
                      setPasswordErrors((prev) => ({
                        ...prev,
                        new: undefined,
                        general: undefined,
                      }));
                    }
                  }}
                  placeholder="Minimal 8 karakter, huruf dan angka"
                  className={`w-full min-h-[44px] rounded-xl border bg-white pl-10 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    passwordErrors.new
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  disabled={isPasswordPending}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword
                      ? 'Sembunyikan kata sandi baru'
                      : 'Tampilkan kata sandi baru'
                  }
                  aria-pressed={showNewPassword}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447]"
                >
                  {showNewPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordErrors.new && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle
                    size={14}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{passwordErrors.new}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} aria-hidden="true" />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isPasswordPending}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirm || passwordErrors.general) {
                      setPasswordErrors((prev) => ({
                        ...prev,
                        confirm: undefined,
                        general: undefined,
                      }));
                    }
                  }}
                  placeholder="Ulangi kata sandi baru"
                  className={`w-full min-h-[44px] rounded-xl border bg-white pl-10 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    passwordErrors.confirm
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  disabled={isPasswordPending}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi kata sandi baru'
                      : 'Tampilkan konfirmasi kata sandi baru'
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordErrors.confirm && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle
                    size={14}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{passwordErrors.confirm}</span>
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-xs font-semibold text-[#172135] mb-1">
                Ketentuan Kata Sandi:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#566276] leading-relaxed">
                <li>Minimal 8 karakter dengan kombinasi huruf dan angka.</li>
                <li>
                  Tidak boleh sama dengan kata sandi yang sedang atau pernah
                  digunakan sebelumnya.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isPasswordPending}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#12803d] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0e6b32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isPasswordPending ? (
                  <>
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} aria-hidden="true" />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
