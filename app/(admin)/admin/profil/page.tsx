'use client'

import { useState } from 'react'
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
} from 'lucide-react'

export default function AdminProfilPage() {
  // Simulasi data pengguna yang sedang login
  const currentUserRole = 'SUPER_ADMIN' as 'SUPER_ADMIN' | 'ADMIN_BERITA'
  const roleLabel = currentUserRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Berita'

  // ─── State Kartu 1: Informasi Akun (Data Diri) ──────────────────────────────
  const [fullName, setFullName] = useState('Trias Firmansyah')
  const [email] = useState('trias.firmansyah@sukabumikota.go.id')
  const [profileError, setProfileError] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  // ─── State Kartu 2: Keamanan Akun (Ganti Kata Sandi) ────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string
    new?: string
    confirm?: string
  }>({})
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Helper inisial nama untuk avatar bulat
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // ─── Handler Submit Form Profil ─────────────────────────────────────────────
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!fullName.trim()) {
      setProfileError('Nama lengkap tidak boleh kosong.')
      return
    }

    setIsProfileLoading(true)
    setTimeout(() => {
      setIsProfileLoading(false)
      setProfileSuccess('Informasi profil berhasil diperbarui.')
      setTimeout(() => setProfileSuccess(''), 4000)
    }, 700)
  }

  // ─── Handler Submit Form Kata Sandi ─────────────────────────────────────────
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess('')

    const errors: { current?: string; new?: string; confirm?: string } = {}

    if (!currentPassword) {
      errors.current = 'Kata sandi saat ini wajib diisi.'
    }

    if (!newPassword) {
      errors.new = 'Kata sandi baru wajib diisi.'
    } else if (newPassword.length < 8) {
      errors.new = 'Kata sandi baru minimal harus terdiri dari 8 karakter.'
    }

    if (!confirmPassword) {
      errors.confirm = 'Konfirmasi kata sandi baru wajib diisi.'
    } else if (confirmPassword !== newPassword) {
      errors.confirm = 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setPasswordErrors({})
    setIsPasswordLoading(true)

    setTimeout(() => {
      setIsPasswordLoading(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Kata sandi akun Anda berhasil diperbarui.')
      setTimeout(() => setPasswordSuccess(''), 4000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
          Pengaturan Profil
        </h1>
        <p className="mt-1 text-sm text-[#566276] leading-relaxed">
          Kelola informasi data diri dan keamanan kata sandi akun Anda.
        </p>
      </div>

      {/* Layout Grid 2 Kartu Terpisah */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        {/* KARTU 1: Informasi Akun (Data Diri) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#159447]">
              <User size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#172135]">Informasi Akun</h2>
              <p className="text-xs text-[#566276]">Data diri dan identitas kedinasan Anda</p>
            </div>
          </div>

          {/* Ringkasan Profil di Bagian Atas Kartu */}
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#159447]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#159447]" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Notifikasi Sukses Profil */}
          {profileSuccess && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-xs font-medium text-[#159447]">
              <Check size={16} className="shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Form Data Diri */}
          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            {/* Field Nama Lengkap */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (profileError) setProfileError('')
                  }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    profileError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
              </div>
              {profileError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{profileError}</span>
                </p>
              )}
            </div>

            {/* Field Alamat Email (Disabled / Read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Alamat Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm text-slate-500"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#566276] leading-relaxed">
                Email kedinasan bersifat permanen. Hubungi Super Admin jika perlu perubahan.
              </p>
            </div>

            {/* Field Peran / Hak Akses (Disabled / Read-only) */}
            <div>
              <label
                htmlFor="role"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Peran / Hak Akses
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Shield size={16} />
                </span>
                <input
                  id="role"
                  type="text"
                  value={roleLabel}
                  disabled
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-500"
                />
              </div>
            </div>

            {/* Tombol Submit Profil */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isProfileLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#117a3a] focus:outline-none focus:ring-2 focus:ring-[#159447]/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isProfileLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Simpan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* KARTU 2: Keamanan Akun (Ganti Kata Sandi) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#159447]">
              <KeyRound size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#172135]">Keamanan Akun</h2>
              <p className="text-xs text-[#566276]">Perbarui kata sandi secara berkala</p>
            </div>
          </div>

          {/* Notifikasi Sukses Kata Sandi */}
          {passwordSuccess && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-xs font-medium text-[#159447]">
              <Check size={16} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {/* Form Ganti Kata Sandi */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            {/* Field Kata Sandi Saat Ini */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    if (passwordErrors.current) {
                      setPasswordErrors((prev) => ({ ...prev, current: undefined }))
                    }
                  }}
                  placeholder="Masukkan kata sandi saat ini"
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    passwordErrors.current
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{passwordErrors.current}</span>
                </p>
              )}
            </div>

            {/* Field Kata Sandi Baru */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (passwordErrors.new) {
                      setPasswordErrors((prev) => ({ ...prev, new: undefined }))
                    }
                  }}
                  placeholder="Minimal 8 karakter"
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    passwordErrors.new
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.new && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{passwordErrors.new}</span>
                </p>
              )}
            </div>

            {/* Field Konfirmasi Kata Sandi Baru */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#172135] mb-1.5"
              >
                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (passwordErrors.confirm) {
                      setPasswordErrors((prev) => ({ ...prev, confirm: undefined }))
                    }
                  }}
                  placeholder="Ulangi kata sandi baru"
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    passwordErrors.confirm
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-[#159447] focus:ring-[#159447]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.confirm && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{passwordErrors.confirm}</span>
                </p>
              )}
            </div>

            {/* Teks Bantuan Aturan Keamanan Kata Sandi */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-xs font-semibold text-[#172135] mb-1">
                Aturan Keamanan Kata Sandi:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#566276] leading-relaxed">
                <li>Minimal terdiri dari 8 karakter.</li>
                <li>Disarankan menggunakan kombinasi huruf besar, huruf kecil, dan angka.</li>
                <li>Jangan gunakan kata sandi yang sama dengan akun layanan lain.</li>
              </ul>
            </div>

            {/* Tombol Submit Kata Sandi */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isPasswordLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#159447] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#117a3a] focus:outline-none focus:ring-2 focus:ring-[#159447]/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isPasswordLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

