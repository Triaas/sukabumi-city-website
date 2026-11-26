'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import ToastNotification from '@/components/ToastNotification';
import type { UserRole } from '@/lib/auth/types';
import {
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  updateUserAction,
  type ManagedUserItem,
} from '@/lib/users/actions';

interface UsersClientProps {
  initialUsers: ManagedUserItem[];
  currentUserId: number;
}

type RoleFilterValue = 'ALL' | UserRole;
type StatusFilterValue = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface CreatedCredentialsSummary {
  name: string;
  email: string;
  role: UserRole;
  temporaryPassword: string;
}

interface ResetCredentialsSummary {
  name: string;
  email: string;
  temporaryPassword: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_BERITA: 'Admin Berita',
  REPORTER: 'Reporter',
};

const ROWS_PER_PAGE = 10;

function formatDateWib(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function generateSecureTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;

  const bytes = new Uint32Array(12);
  window.crypto.getRandomValues(bytes);

  const chars: string[] = [
    upper[bytes[0] % upper.length],
    lower[bytes[1] % lower.length],
    digits[bytes[2] % digits.length],
    symbols[bytes[3] % symbols.length],
  ];

  for (let i = 4; i < 12; i += 1) {
    chars.push(all[bytes[i] % all.length]);
  }

  // Pengacakan posisi karakter wajib agar pola awal sandi tidak seragam.
  const shuffleBytes = new Uint32Array(chars.length);
  window.crypto.getRandomValues(shuffleBytes);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = shuffleBytes[i] % (i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return chars.join('');
}

function getRoleBadgeClasses(role: UserRole): string {
  if (role === 'SUPER_ADMIN') {
    return 'bg-emerald-50 border-emerald-200 text-emerald-900';
  }
  if (role === 'ADMIN_BERITA') {
    return 'bg-blue-50 border-blue-200 text-blue-900';
  }
  return 'bg-slate-100 border-slate-300 text-[#172135]';
}

export default function UsersClient({
  initialUsers,
  currentUserId,
}: UsersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<ManagedUserItem[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<'create' | 'reset' | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('REPORTER');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] =
    useState<CreatedCredentialsSummary | null>(null);

  const [editingUser, setEditingUser] = useState<ManagedUserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('REPORTER');
  const [editError, setEditError] = useState<string | null>(null);

  const [resettingUser, setResettingUser] = useState<ManagedUserItem | null>(
    null
  );
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSummary, setResetSummary] =
    useState<ResetCredentialsSummary | null>(null);

  const [togglingTarget, setTogglingTarget] = useState<{
    user: ManagedUserItem;
    nextIsActive: boolean;
  } | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [deletingUser, setDeletingUser] = useState<ManagedUserItem | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeAddModal = () => {
    if (isPending && !createdSummary) return;
    setIsAddOpen(false);
    setCreatedSummary(null);
    setCreateError(null);
    setCopiedKey(null);
  };

  const closeEditModal = () => {
    if (isPending) return;
    setEditingUser(null);
    setEditError(null);
  };

  const closeResetModal = () => {
    if (isPending && !resetSummary) return;
    setResettingUser(null);
    setResetSummary(null);
    setResetError(null);
    setCopiedKey(null);
  };

  const closeToggleModal = () => {
    if (isPending) return;
    setTogglingTarget(null);
    setToggleError(null);
  };

  const closeDeleteModal = () => {
    if (isPending) return;
    setDeletingUser(null);
    setDeleteError(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isPending) return;
      if (deletingUser) {
        closeDeleteModal();
      } else if (togglingTarget) {
        closeToggleModal();
      } else if (resettingUser) {
        closeResetModal();
      } else if (editingUser) {
        closeEditModal();
      } else if (isAddOpen) {
        closeAddModal();
      } else if (isRoleOpen || isStatusOpen) {
        setIsRoleOpen(false);
        setIsStatusOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPending,
    deletingUser,
    togglingTarget,
    resettingUser,
    editingUser,
    isAddOpen,
    isRoleOpen,
    isStatusOpen,
  ]);

  const summaryCounts = useMemo(() => {
    let activeCount = 0;
    let inactiveCount = 0;
    let superAdminCount = 0;
    let adminBeritaCount = 0;
    let reporterCount = 0;

    for (const u of users) {
      if (u.isActive) activeCount += 1;
      else inactiveCount += 1;

      if (u.role === 'SUPER_ADMIN') superAdminCount += 1;
      else if (u.role === 'ADMIN_BERITA') adminBeritaCount += 1;
      else reporterCount += 1;
    }

    return {
      total: users.length,
      active: activeCount,
      inactive: inactiveCount,
      superAdmin: superAdminCount,
      adminBerita: adminBeritaCount,
      reporter: reporterCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((u) => {
      const matchQuery =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.isActive) ||
        (statusFilter === 'INACTIVE' && !u.isActive);

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ROWS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  );

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    roleFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setIsRoleOpen(false);
    setIsStatusOpen(false);
    setCurrentPage(1);
  };

  const roleFilterOptions: { label: string; value: RoleFilterValue }[] = [
    { label: 'Semua Jabatan', value: 'ALL' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Admin Berita', value: 'ADMIN_BERITA' },
    { label: 'Reporter', value: 'REPORTER' },
  ];

  const statusFilterOptions: { label: string; value: StatusFilterValue }[] = [
    { label: 'Semua Status', value: 'ALL' },
    { label: 'Aktif', value: 'ACTIVE' },
    { label: 'Nonaktif', value: 'INACTIVE' },
  ];

  const currentRoleFilterOption =
    roleFilterOptions.find((opt) => opt.value === roleFilter) ||
    roleFilterOptions[0];
  const currentStatusFilterOption =
    statusFilterOptions.find((opt) => opt.value === statusFilter) ||
    statusFilterOptions[0];

  const openAddModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreateRole('REPORTER');
    setCreatePassword('');
    setShowCreatePassword(false);
    setCreateError(null);
    setCreatedSummary(null);
    setCopiedKey(null);
    setIsAddOpen(true);
  };

  const openEditModal = (user: ManagedUserItem) => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError(null);
    setEditingUser(user);
  };

  const openResetModal = (user: ManagedUserItem) => {
    setResetPassword('');
    setShowResetPassword(false);
    setResetError(null);
    setResetSummary(null);
    setCopiedKey(null);
    setResettingUser(user);
  };

  const openToggleModal = (user: ManagedUserItem) => {
    if (user.id === currentUserId) return;
    setToggleError(null);
    setTogglingTarget({ user, nextIsActive: !user.isActive });
  };

  const handleCopyCredentials = async (
    info: { email: string; temporaryPassword: string; name: string },
    source: 'create' | 'reset'
  ) => {
    const loginUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : '/login';

    const formattedText = [
      'Informasi Akses Portal Pemerintah Kota Sukabumi',
      `Nama: ${info.name}`,
      `URL Login: ${loginUrl}`,
      `Email: ${info.email}`,
      `Kata Sandi Sementara: ${info.temporaryPassword}`,
      'Catatan: Anda wajib mengganti kata sandi saat pertama kali masuk.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedKey(source);
      setToast({
        type: 'success',
        message: 'Informasi login berhasil disalin ke papan klip.',
      });
    } catch {
      setToast({
        type: 'error',
        message:
          'Gagal menyalin otomatis. Silakan salin teks kredensial secara manual.',
      });
    }
  };

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    const trimmedName = createName.trim();
    const trimmedEmail = createEmail.trim().toLowerCase();

    if (!trimmedName) {
      setCreateError('Nama lengkap wajib diisi.');
      return;
    }
    if (!trimmedEmail) {
      setCreateError('Alamat email wajib diisi.');
      return;
    }
    if (!createPassword) {
      setCreateError('Kata sandi sementara wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await createUserAction({
        name: trimmedName,
        email: trimmedEmail,
        role: createRole,
        temporaryPassword: createPassword,
      });

      if (!result.success || !result.data) {
        setCreateError(result.error || 'Gagal membuat akun pengguna baru.');
        return;
      }

      setUsers((prev) => [...prev, result.data!]);
      setCreatedSummary({
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        temporaryPassword: createPassword,
      });
      setToast({
        type: 'success',
        message: `Akun ${result.data.name} berhasil ditambahkan.`,
      });
      router.refresh();
    });
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName) {
      setEditError('Nama lengkap wajib diisi.');
      return;
    }
    if (!trimmedEmail) {
      setEditError('Alamat email wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await updateUserAction({
        userId: editingUser.id,
        name: trimmedName,
        email: trimmedEmail,
        role: editRole,
      });

      if (!result.success || !result.data) {
        setEditError(result.error || 'Gagal memperbarui data akun.');
        return;
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === result.data!.id ? result.data! : item))
      );
      setEditingUser(null);
      setToast({
        type: 'success',
        message: `Data akun ${result.data.name} berhasil diperbarui.`,
      });
      router.refresh();
    });
  };

  const handleResetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resettingUser) return;
    setResetError(null);

    if (!resetPassword) {
      setResetError('Kata sandi sementara wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await resetUserPasswordAction({
        userId: resettingUser.id,
        temporaryPassword: resetPassword,
      });

      if (!result.success) {
        setResetError(result.error || 'Gagal mereset kata sandi pengguna.');
        return;
      }

      const nowIso = new Date().toISOString();
      setUsers((prev) =>
        prev.map((item) =>
          item.id === resettingUser.id
            ? {
                ...item,
                mustChangePassword: true,
                isPasswordExpired: false,
                passwordChangedAt: nowIso,
              }
            : item
        )
      );
      setResetSummary({
        name: resettingUser.name,
        email: resettingUser.email,
        temporaryPassword: resetPassword,
      });
      setToast({
        type: 'success',
        message: `Kata sandi ${resettingUser.name} berhasil direset.`,
      });
      router.refresh();
    });
  };

  const handleConfirmToggleStatus = () => {
    if (!togglingTarget) return;
    setToggleError(null);

    startTransition(async () => {
      const result = await toggleUserStatusAction({
        userId: togglingTarget.user.id,
        isActive: togglingTarget.nextIsActive,
      });

      if (!result.success || !result.data) {
        setToggleError(result.error || 'Gagal memperbarui status akun.');
        return;
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === result.data!.id ? result.data! : item))
      );
      setTogglingTarget(null);
      setToast({
        type: 'success',
        message: result.data.isActive
          ? `Akun ${result.data.name} berhasil diaktifkan kembali.`
          : `Akun ${result.data.name} dinonaktifkan dan seluruh sesinya telah dihentikan.`,
      });
      router.refresh();
    });
  };

  const openDeleteModal = (user: ManagedUserItem) => {
    if (user.id === currentUserId) return;
    setDeleteError(null);
    setDeletingUser(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    setDeleteError(null);

    const target = deletingUser;

    startTransition(async () => {
      const result = await deleteUserAction({ userId: target.id });

      if (!result.success) {
        setDeleteError(result.error || 'Gagal menghapus akun pengguna.');
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== target.id));
      setDeletingUser(null);
      setToast({
        type: 'success',
        message: `Akun ${target.name} berhasil dihapus secara permanen.`,
      });
      router.refresh();
    });
  };

  const loginUrlDisplay =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : '/login';

  return (
    <div className="space-y-6">
      <ToastNotification
        message={toast?.message}
        type={toast?.type}
        duration={3200}
        onClose={() => setToast(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
            Manajemen User
          </h1>
          <p className="text-xs sm:text-sm text-[#566276] max-w-2xl leading-relaxed">
            Kelola akun pengelola portal, tetapkan hak akses berdasarkan jabatan,
            dan atur keamanan kata sandi staf.
          </p>
        </div>

        <div className="flex items-center sm:ml-auto self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <PlusCircle size={17} aria-hidden="true" className="shrink-0" />
            <span>Tambah User Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="sm:col-span-2 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-start justify-between gap-4 shadow-xs">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-semibold text-[#566276]">Total Akun</p>
            <p className="text-2xl font-bold text-[#172135] tracking-tight">
              {summaryCounts.total}
            </p>
            <p className="text-xs text-[#566276] leading-relaxed">
              {summaryCounts.superAdmin} Super Admin, {summaryCounts.adminBerita}{' '}
              Admin Berita, {summaryCounts.reporter} Reporter
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#12803d] flex items-center justify-center shrink-0">
            <Users size={20} aria-hidden="true" />
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-start justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#566276]">Akun Aktif</p>
            <p className="text-2xl font-bold text-[#172135] tracking-tight">
              {summaryCounts.active}
            </p>
            <p className="text-xs text-[#566276]">Dapat mengakses portal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#12803d] flex items-center justify-center shrink-0">
            <UserCheck size={19} aria-hidden="true" />
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-start justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#566276]">Akun Nonaktif</p>
            <p className="text-2xl font-bold text-[#172135] tracking-tight">
              {summaryCounts.inactive}
            </p>
            <p className="text-xs text-[#566276]">Akses masuk dibekukan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
            <UserX size={19} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="users-search-input"
              type="text"
              placeholder="Cari nama staf atau email kedinasan..."
              aria-label="Cari nama atau email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-[#172135] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] transition-all motion-reduce:transition-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative z-30">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isRoleOpen}
                aria-label="Filter Jabatan"
                onClick={() => {
                  setIsRoleOpen((prev) => !prev);
                  setIsStatusOpen(false);
                }}
                className="flex items-center justify-between gap-3 min-w-[160px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <span className="flex items-center gap-2 truncate">
                  <Briefcase
                    size={14}
                    className="shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{currentRoleFilterOption.label}</span>
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                    isRoleOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isRoleOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsRoleOpen(false)}
                  />
                  <div
                    role="listbox"
                    aria-label="Pilihan Jabatan"
                    className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30"
                  >
                    {roleFilterOptions.map((opt) => {
                      const isSelected = roleFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setRoleFilter(opt.value);
                            setCurrentPage(1);
                            setIsRoleOpen(false);
                          }}
                          className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                              : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="relative z-30">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isStatusOpen}
                aria-label="Filter Status"
                onClick={() => {
                  setIsStatusOpen((prev) => !prev);
                  setIsRoleOpen(false);
                }}
                className="flex items-center justify-between gap-3 min-w-[140px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-[#159447] hover:text-[#159447] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <span className="flex items-center gap-2 truncate">
                  <CheckCircle2
                    size={14}
                    className="shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{currentStatusFilterOption.label}</span>
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                    isStatusOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsStatusOpen(false)}
                  />
                  <div
                    role="listbox"
                    aria-label="Pilihan Status"
                    className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-1.5 z-30"
                  >
                    {statusFilterOptions.map((opt) => {
                      const isSelected = statusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setStatusFilter(opt.value);
                            setCurrentPage(1);
                            setIsStatusOpen(false);
                          }}
                          className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-[#159447] bg-[#f0fdf4] border-l-4 border-[#159447]'
                              : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-3">
            <p className="text-sm font-bold text-[#172135]">
              {users.length === 0
                ? 'Belum ada akun pengguna terdaftar.'
                : 'Tidak ada akun yang cocok dengan pencarian atau filter aktif.'}
            </p>
            <p className="text-xs sm:text-sm text-[#566276] max-w-md mx-auto">
              {users.length === 0
                ? 'Tambahkan akun staf baru untuk memberikan akses ke Portal Pengelola.'
                : 'Ubah kata kunci pencarian atau atur ulang filter jabatan dan status untuk melihat seluruh akun.'}
            </p>
            <div className="pt-1">
              {users.length === 0 ? (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <PlusCircle size={16} aria-hidden="true" />
                  <span>Tambah User Baru</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Reset Pencarian dan Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse block xl:table">
              <thead className="sr-only xl:not-sr-only xl:table-header-group">
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold text-[#566276]">
                  <th scope="col" className="py-3.5 px-4 text-left">
                    Nama &amp; Email
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-left">
                    Jabatan
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-left">
                    Status Akun
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-left">
                    Status Kata Sandi
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="grid grid-cols-1 md:grid-cols-2 xl:table-row-group gap-3 p-4 xl:p-0 xl:divide-y xl:divide-slate-100 text-xs sm:text-sm text-[#172135]">
                {paginatedUsers.map((user) => {
                  const isSelf = user.id === currentUserId;

                  return (
                    <tr
                      key={user.id}
                      className="flex flex-col xl:table-row gap-3 xl:gap-0 rounded-xl xl:rounded-none border border-slate-200 xl:border-0 p-4 xl:p-0 bg-white hover:bg-slate-50/70 transition-colors motion-reduce:transition-none"
                    >
                      <td className="xl:py-4 xl:px-4 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#172135] text-sm">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-900">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#566276] mt-0.5 break-all">
                          {user.email}
                        </p>
                      </td>

                      <td className="xl:py-4 xl:px-4 align-middle">
                        <div className="flex items-center justify-between xl:justify-start gap-2">
                          <span className="text-xs font-semibold text-[#566276] xl:hidden">
                            Jabatan
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${getRoleBadgeClasses(
                              user.role
                            )}`}
                          >
                            {ROLE_LABELS[user.role]}
                          </span>
                        </div>
                      </td>

                      <td className="xl:py-4 xl:px-4 align-middle">
                        <div className="flex items-center justify-between xl:justify-start gap-2">
                          <span className="text-xs font-semibold text-[#566276] xl:hidden">
                            Status Akun
                          </span>
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold whitespace-nowrap">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                                aria-hidden="true"
                              />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold whitespace-nowrap">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-red-600"
                                aria-hidden="true"
                              />
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="xl:py-4 xl:px-4 align-middle">
                        <div className="flex flex-col xl:items-start gap-1">
                          <div className="flex items-center justify-between xl:justify-start gap-2">
                            <span className="text-xs font-semibold text-[#566276] xl:hidden">
                              Status Sandi
                            </span>
                            {user.mustChangePassword ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold whitespace-nowrap">
                                Wajib Ganti
                              </span>
                            ) : user.isPasswordExpired ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold whitespace-nowrap">
                                Kedaluwarsa &gt;30 Hari
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold whitespace-nowrap">
                                Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#566276] text-right xl:text-left">
                            Diubah: {formatDateWib(user.passwordChangedAt)}
                          </span>
                        </div>
                      </td>

                      <td className="pt-2 xl:pt-4 border-t border-slate-100 xl:border-0 xl:py-4 xl:px-4 align-middle">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            aria-label={`Edit akun ${user.name}`}
                            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200/70 text-xs font-semibold text-[#172135] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                          >
                            <Pencil size={14} aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openResetModal(user)}
                            aria-label={`Reset sandi akun ${user.name}`}
                            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 active:bg-amber-200/70 text-xs font-semibold text-amber-950 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                          >
                            <KeyRound size={14} aria-hidden="true" />
                            <span>Reset Sandi</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => openToggleModal(user)}
                            title={
                              isSelf
                                ? 'Akun yang sedang digunakan tidak dapat dinonaktifkan'
                                : user.isActive
                                ? `Nonaktifkan akun ${user.name}`
                                : `Aktifkan akun ${user.name}`
                            }
                            aria-label={
                              user.isActive
                                ? `Nonaktifkan akun ${user.name}`
                                : `Aktifkan akun ${user.name}`
                            }
                            className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none ${
                              isSelf
                                ? 'border-slate-200 bg-slate-100 text-[#566276] opacity-60 cursor-not-allowed'
                                : user.isActive
                                ? 'border-red-200 bg-red-50 hover:bg-red-100 active:bg-red-200/70 text-red-800 cursor-pointer'
                                : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200/70 text-emerald-900 cursor-pointer'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserX size={14} aria-hidden="true" />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} aria-hidden="true" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => openDeleteModal(user)}
                            title={
                              isSelf
                                ? 'Akun yang sedang digunakan tidak dapat dihapus'
                                : `Hapus akun ${user.name}`
                            }
                            aria-label={`Hapus akun ${user.name}`}
                            className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none ${
                              isSelf
                                ? 'border-slate-200 bg-slate-100 text-[#566276] opacity-60 cursor-not-allowed'
                                : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200/70 cursor-pointer'
                            }`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
              <p className="text-xs sm:text-sm font-medium text-[#566276]">
                Menampilkan{' '}
                <span className="font-bold text-[#172135]">
                  {startIndex + 1} -{' '}
                  {Math.min(startIndex + ROWS_PER_PAGE, filteredUsers.length)}
                </span>{' '}
                dari{' '}
                <span className="font-bold text-[#172135]">
                  {filteredUsers.length}
                </span>{' '}
                akun
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                    className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-[#172135] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <span className="px-2 text-xs sm:text-sm font-semibold text-[#172135]">
                    Halaman {safePage} dari {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Halaman berikutnya"
                    className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-[#172135] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isAddOpen && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-user-title"
            className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2
                  id="modal-add-user-title"
                  className="text-base sm:text-lg font-bold text-[#172135] tracking-tight"
                >
                  {createdSummary
                    ? 'Akun Baru Berhasil Dibuat'
                    : 'Tambah User Baru'}
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  {createdSummary
                    ? 'Salin dan bagikan informasi akses sementara berikut kepada staf terkait.'
                    : 'Pengguna baru wajib mengganti kata sandi saat pertama kali masuk.'}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending && !createdSummary}
                onClick={closeAddModal}
                aria-label="Tutup dialog tambah user"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {createdSummary ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                    className="text-emerald-700 shrink-0 mt-0.5"
                  />
                  <span>
                    Akun <strong>{createdSummary.name}</strong> (
                    {ROLE_LABELS[createdSummary.role]}) telah aktif dan siap
                    digunakan.
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">
                      URL Login
                    </span>
                    <span className="font-semibold text-[#172135] break-all">
                      {loginUrlDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">Email</span>
                    <span className="font-semibold text-[#172135] break-all">
                      {createdSummary.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">
                      Sandi Sementara
                    </span>
                    <code className="font-bold text-[#172135] bg-white px-2 py-0.5 rounded-md border border-slate-200 break-all">
                      {createdSummary.temporaryPassword}
                    </code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCredentials(createdSummary, 'create')
                    }
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    {copiedKey === 'create' ? (
                      <>
                        <Check size={16} aria-hidden="true" />
                        <span>Info Login Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} aria-hidden="true" />
                        <span>Salin Info Login</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
                {createError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800 flex items-start gap-2"
                  >
                    <AlertCircle
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 mt-0.5"
                    />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="create-user-name"
                    className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="create-user-name"
                    type="text"
                    required
                    disabled={isPending}
                    value={createName}
                    onChange={(e) => {
                      setCreateName(e.target.value);
                      if (createError) setCreateError(null);
                    }}
                    placeholder="Masukkan nama lengkap staf"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-user-email"
                    className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                  >
                    Alamat Email
                  </label>
                  <input
                    id="create-user-email"
                    type="email"
                    required
                    disabled={isPending}
                    value={createEmail}
                    onChange={(e) => {
                      setCreateEmail(e.target.value);
                      if (createError) setCreateError(null);
                    }}
                    placeholder="nama@sukabumikota.go.id"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-user-role"
                    className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                  >
                    Jabatan
                  </label>
                  <div className="relative">
                    <select
                      id="create-user-role"
                      disabled={isPending}
                      value={createRole}
                      onChange={(e) =>
                        setCreateRole(e.target.value as UserRole)
                      }
                      className="w-full min-h-[44px] appearance-none rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-sm font-medium text-[#172135] hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                    >
                      <option value="REPORTER">Reporter</option>
                      <option value="ADMIN_BERITA">Admin Berita</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#566276] pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="create-user-password"
                      className="block text-xs sm:text-sm font-semibold text-[#172135]"
                    >
                      Kata Sandi Sementara
                    </label>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const randomPass = generateSecureTemporaryPassword();
                        setCreatePassword(randomPass);
                        setShowCreatePassword(true);
                        if (createError) setCreateError(null);
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 active:bg-slate-200/70 text-xs font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                    >
                      <RefreshCw size={13} aria-hidden="true" />
                      <span>Buat Sandi Acak</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="create-user-password"
                      type={showCreatePassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      disabled={isPending}
                      value={createPassword}
                      onChange={(e) => {
                        setCreatePassword(e.target.value);
                        if (createError) setCreateError(null);
                      }}
                      placeholder="Minimal 8 karakter, huruf dan angka"
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowCreatePassword((prev) => !prev)}
                      aria-label={
                        showCreatePassword
                          ? 'Sembunyikan kata sandi sementara'
                          : 'Tampilkan kata sandi sementara'
                      }
                      aria-pressed={showCreatePassword}
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                    >
                      {showCreatePassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={closeAddModal}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    {isPending ? (
                      <>
                        <Loader2
                          size={16}
                          aria-hidden="true"
                          className="animate-spin motion-reduce:animate-none"
                        />
                        <span>Menyimpan Akun...</span>
                      </>
                    ) : (
                      <span>Simpan Akun</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {editingUser && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-edit-user-title"
            className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2
                  id="modal-edit-user-title"
                  className="text-base sm:text-lg font-bold text-[#172135] tracking-tight"
                >
                  Edit Data Pengguna
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  Perbarui identitas atau penetapan jabatan akun pengelola.
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={closeEditModal}
                aria-label="Tutup dialog edit user"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4" noValidate>
              {editError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800 flex items-start gap-2"
                >
                  <AlertCircle
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-user-name"
                  className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="edit-user-name"
                  type="text"
                  required
                  disabled={isPending}
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (editError) setEditError(null);
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-user-email"
                  className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                >
                  Alamat Email
                </label>
                <input
                  id="edit-user-email"
                  type="email"
                  required
                  disabled={isPending}
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (editError) setEditError(null);
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#172135] hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-user-role"
                  className="block text-xs sm:text-sm font-semibold text-[#172135] mb-1.5"
                >
                  Jabatan
                </label>
                <div className="relative">
                  <select
                    id="edit-user-role"
                    disabled={isPending || editingUser.id === currentUserId}
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full min-h-[44px] appearance-none rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-sm font-medium text-[#172135] hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-[#566276] motion-reduce:transition-none"
                  >
                    <option value="REPORTER">Reporter</option>
                    <option value="ADMIN_BERITA">Admin Berita</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#566276] pointer-events-none"
                  />
                </div>
                {editingUser.id === currentUserId ? (
                  <p className="mt-1.5 text-xs text-[#566276]">
                    Jabatan akun sendiri dikunci agar hak akses Super Admin
                    tetap terjaga.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-[#566276]">
                    Jika jabatan diubah, sesi aktif pengguna ini akan dihentikan
                    agar hak akses baru langsung berlaku saat login ulang.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={closeEditModal}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  {isPending ? (
                    <>
                      <Loader2
                        size={16}
                        aria-hidden="true"
                        className="animate-spin motion-reduce:animate-none"
                      />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resettingUser && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeResetModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-reset-password-title"
            className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2
                  id="modal-reset-password-title"
                  className="text-base sm:text-lg font-bold text-[#172135] tracking-tight"
                >
                  {resetSummary
                    ? 'Kata Sandi Berhasil Direset'
                    : 'Reset Kata Sandi Pengguna'}
                </h2>
                <p className="text-xs text-[#566276] mt-0.5">
                  {resetSummary
                    ? 'Bagikan kata sandi sementara baru berikut kepada pemilik akun.'
                    : `Tetapkan kata sandi sementara baru untuk ${resettingUser.name} (${resettingUser.email}).`}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={closeResetModal}
                aria-label="Tutup dialog reset kata sandi"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {resetSummary ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                    className="text-emerald-700 shrink-0 mt-0.5"
                  />
                  <span>
                    Seluruh sesi aktif <strong>{resetSummary.name}</strong>{' '}
                    telah dihentikan dan pengguna wajib mengganti sandi saat
                    login berikutnya.
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">
                      URL Login
                    </span>
                    <span className="font-semibold text-[#172135] break-all">
                      {loginUrlDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">Email</span>
                    <span className="font-semibold text-[#172135] break-all">
                      {resetSummary.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-[#566276]">
                      Sandi Sementara
                    </span>
                    <code className="font-bold text-[#172135] bg-white px-2 py-0.5 rounded-md border border-slate-200 break-all">
                      {resetSummary.temporaryPassword}
                    </code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(resetSummary, 'reset')}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    {copiedKey === 'reset' ? (
                      <>
                        <Check size={16} aria-hidden="true" />
                        <span>Info Login Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} aria-hidden="true" />
                        <span>Salin Info Login</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
                {resetError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800 flex items-start gap-2"
                  >
                    <AlertCircle
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 mt-0.5"
                    />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950 leading-relaxed">
                  Mereset kata sandi akan langsung mencabut seluruh sesi login
                  aktif milik pengguna ini dan mewajibkan pembuatan kata sandi
                  baru saat masuk kembali.
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="reset-user-password"
                      className="block text-xs sm:text-sm font-semibold text-[#172135]"
                    >
                      Kata Sandi Sementara Baru
                    </label>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const randomPass = generateSecureTemporaryPassword();
                        setResetPassword(randomPass);
                        setShowResetPassword(true);
                        if (resetError) setResetError(null);
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 active:bg-slate-200/70 text-xs font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                    >
                      <RefreshCw size={13} aria-hidden="true" />
                      <span>Buat Sandi Acak</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="reset-user-password"
                      type={showResetPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      disabled={isPending}
                      value={resetPassword}
                      onChange={(e) => {
                        setResetPassword(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="Minimal 8 karakter, tidak sama dengan riwayat sandi"
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-3.5 pr-12 py-2.5 text-sm text-[#172135] placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/25 disabled:cursor-not-allowed disabled:bg-slate-100 motion-reduce:transition-none"
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowResetPassword((prev) => !prev)}
                      aria-label={
                        showResetPassword
                          ? 'Sembunyikan kata sandi sementara'
                          : 'Tampilkan kata sandi sementara'
                      }
                      aria-pressed={showResetPassword}
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                    >
                      {showResetPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={closeResetModal}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    {isPending ? (
                      <>
                        <Loader2
                          size={16}
                          aria-hidden="true"
                          className="animate-spin motion-reduce:animate-none"
                        />
                        <span>Mereset Sandi...</span>
                      </>
                    ) : (
                      <span>Reset Kata Sandi</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {togglingTarget && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeToggleModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-toggle-status-title"
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="modal-toggle-status-title"
                  className="text-base sm:text-lg font-bold text-[#172135] tracking-tight"
                >
                  {togglingTarget.nextIsActive
                    ? 'Aktifkan Kembali Akun?'
                    : 'Nonaktifkan Akun Pengguna?'}
                </h2>
                <p className="text-xs text-[#566276] mt-0.5 break-all">
                  {togglingTarget.user.name} ({togglingTarget.user.email})
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={closeToggleModal}
                aria-label="Tutup dialog konfirmasi status akun"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {toggleError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800 flex items-start gap-2"
              >
                <AlertCircle
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                />
                <span>{toggleError}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#566276] leading-relaxed">
              {togglingTarget.nextIsActive
                ? 'Setelah diaktifkan kembali, pengguna ini dapat masuk ke Portal Pengelola sesuai hak akses jabatannya.'
                : 'Menonaktifkan akun akan langsung mengeluarkan pengguna ini dari seluruh sesi aktif dan memblokir akses masuk hingga akun diaktifkan kembali oleh Super Admin.'}
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={closeToggleModal}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmToggleStatus}
                className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                  togglingTarget.nextIsActive
                    ? 'bg-[#12803d] hover:bg-[#0e6b32] active:bg-[#0b5628]'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                    <span>Memproses...</span>
                  </>
                ) : togglingTarget.nextIsActive ? (
                  <span>Ya, Aktifkan Akun</span>
                ) : (
                  <span>Ya, Nonaktifkan Akun</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-delete-user-title"
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="modal-delete-user-title"
                  className="text-base sm:text-lg font-bold text-[#172135] tracking-tight"
                >
                  Hapus Akun Secara Permanen?
                </h2>
                <p className="text-xs text-[#566276] mt-0.5 break-all">
                  {deletingUser.name} ({deletingUser.email})
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={closeDeleteModal}
                aria-label="Tutup dialog konfirmasi hapus akun"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#566276] hover:text-[#172135] hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {deleteError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-800 flex items-start gap-2"
              >
                <AlertCircle
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#566276] leading-relaxed">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Akun,
              riwayat kata sandi, serta seluruh sesi login aktif pengguna ini
              akan langsung dihapus dan dihentikan.
            </p>

            {deletingUser.articleCount > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950 leading-relaxed">
                Akun ini memiliki{' '}
                <strong>{deletingUser.articleCount} arsip berita</strong>.
                Seluruh berita tersebut tetap aman tersimpan di portal dengan
                nama penulis yang sudah tercatat.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={closeDeleteModal}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-xs sm:text-sm font-semibold text-[#172135] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] motion-reduce:transition-none"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDeleteUser}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {isPending ? (
                  <>
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Permanen</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
