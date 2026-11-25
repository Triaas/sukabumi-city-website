import type { UserRole } from '@/lib/types/berita';

export type { UserRole };

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  passwordChangedAt: Date;
  mustChangePassword: boolean;
  isPasswordExpired: boolean;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export function getDefaultDashboardPath(role: UserRole): string {
  return role === 'REPORTER' ? '/reporter/berita' : '/admin';
}

export function getRoleFallbackPath(role: UserRole): string {
  if (role === 'REPORTER') return '/reporter/berita';
  if (role === 'ADMIN_BERITA') return '/admin/berita';
  return '/admin';
}

export function resolveSafeRedirectPath(
  nextPath: string | null | undefined,
  role: UserRole
): string {
  const fallback = getDefaultDashboardPath(role);
  if (!nextPath || typeof nextPath !== 'string') return fallback;

  const trimmed = nextPath.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  if (role === 'REPORTER') {
    return trimmed === '/reporter' || trimmed.startsWith('/reporter/')
      ? trimmed
      : fallback;
  }

  if (role === 'ADMIN_BERITA') {
    const allowedForAdminBerita =
      trimmed === '/admin' ||
      trimmed === '/admin/profil' ||
      trimmed === '/admin/berita' ||
      trimmed.startsWith('/admin/berita/');
    return allowedForAdminBerita ? trimmed : fallback;
  }

  return trimmed === '/admin' || trimmed.startsWith('/admin/')
    ? trimmed
    : fallback;
}
