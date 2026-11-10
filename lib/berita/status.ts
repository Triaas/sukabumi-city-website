import type { NewsStatus, UserRole } from '@/lib/types/berita';

export type BeritaActionType = 'DRAFT' | 'SUBMIT' | 'PUBLISH';

export interface ResolveNextStatusParams {
  actionType: BeritaActionType;
  userRole: UserRole;
  isUpdate?: boolean;
  currentStatus?: NewsStatus;
  originalAuthorRole?: UserRole;
  wasPublished?: boolean;
}

export interface ResolvedStatusResult {
  status: NewsStatus;
  isPublishedNow: boolean;
  wasPublished: boolean;
}

/**
 * Fungsi murni untuk menentukan status berita (`DRAFT`, `SUBMITTED`, `PUBLISHED`),
 * penanda apakah sedang diterbitkan (`isPublishedNow`), dan riwayat `wasPublished`
 * baik pada saat pembuatan naskah baru (create) maupun pembaruan (update).
 *
 * Aturan perlindungan:
 * - Reporter tidak pernah bisa langsung menerbitkan (`PUBLISHED`).
 * - Jika naskah berstatus `PUBLISHED` diedit oleh Admin tanpa aksi unpublish eksplisit,
 *   status tetap dipertahankan `PUBLISHED` agar tidak terdegradasi secara tidak sengaja.
 */
export function resolveNextStatus({
  actionType,
  userRole,
  isUpdate = false,
  currentStatus,
  originalAuthorRole,
  wasPublished = false,
}: ResolveNextStatusParams): ResolvedStatusResult {
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA';

  if (isAdmin) {
    if (actionType === 'PUBLISH') {
      return {
        status: 'PUBLISHED',
        isPublishedNow: true,
        wasPublished: true,
      };
    }

    // Proteksi naskah yang sudah tayang: jika diedit oleh Admin tanpa niat unpublish,
    // pertahankan status PUBLISHED agar tidak hilang dari halaman publik.
    if (isUpdate && currentStatus === 'PUBLISHED') {
      return {
        status: 'PUBLISHED',
        isPublishedNow: true,
        wasPublished: true,
      };
    }

    // Jika Admin menyimpan perubahan tanpa menerbitkan pada naskah milik Reporter
    if (isUpdate && originalAuthorRole === 'REPORTER') {
      return {
        status: 'SUBMITTED',
        isPublishedNow: false,
        wasPublished: Boolean(wasPublished),
      };
    }

    return {
      status: 'DRAFT',
      isPublishedNow: false,
      wasPublished: Boolean(wasPublished),
    };
  }

  // Jalur REPORTER: tidak diizinkan menerbitkan langsung ke PUBLISHED
  if (actionType === 'SUBMIT' || actionType === 'PUBLISH') {
    return {
      status: 'SUBMITTED',
      isPublishedNow: false,
      wasPublished: Boolean(wasPublished),
    };
  }

  return {
    status: 'DRAFT',
    isPublishedNow: false,
    wasPublished: Boolean(wasPublished),
  };
}

/**
 * Menentukan status tujuan ketika naskah diturunkan dari penayangan (unpublish)
 * berdasarkan peran penulis aslinya.
 */
export function resolveUnpublishStatus(authorRole?: string | null): NewsStatus {
  return authorRole === 'REPORTER' ? 'SUBMITTED' : 'DRAFT';
}

