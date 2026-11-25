'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import {
  hashPassword,
  isPasswordExpired,
  isPasswordReused,
  requireRole,
  revokeUserSessions,
  validatePasswordStrength,
  type UserRole,
} from '@/lib/auth';

export interface ManagedUserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  passwordChangedAt: string;
  mustChangePassword: boolean;
  createdAt: string;
  isPasswordExpired: boolean;
  articleCount: number;
}

export interface UserActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password_changed_at: Date | string;
  must_change_password: boolean;
  created_at: Date | string;
  article_count?: number | string;
}

const VALID_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN_BERITA', 'REPORTER'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toIsoTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date(0).toISOString()
    : date.toISOString();
}

function mapUserRow(row: UserRow): ManagedUserItem {
  const changedAt =
    row.password_changed_at instanceof Date
      ? row.password_changed_at
      : new Date(row.password_changed_at);

  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: Boolean(row.is_active),
    passwordChangedAt: toIsoTimestamp(row.password_changed_at),
    mustChangePassword: Boolean(row.must_change_password),
    createdAt: toIsoTimestamp(row.created_at),
    isPasswordExpired: isPasswordExpired(changedAt),
    articleCount: Number(row.article_count ?? 0),
  };
}

function validateNameAndEmail(
  rawName: string,
  rawEmail: string,
  role: UserRole
): {
  valid: boolean;
  name: string;
  email: string;
  error?: string;
} {
  const name = (rawName || '').trim();
  const email = (rawEmail || '').trim().toLowerCase();

  if (!name) {
    return { valid: false, name, email, error: 'Nama lengkap wajib diisi.' };
  }
  if (name.length > 150) {
    return {
      valid: false,
      name,
      email,
      error: 'Nama lengkap tidak boleh melebihi 150 karakter.',
    };
  }
  if (!email) {
    return { valid: false, name, email, error: 'Alamat email wajib diisi.' };
  }
  if (email.length > 150 || !EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      name,
      email,
      error: 'Format alamat email tidak valid.',
    };
  }
  if (!VALID_ROLES.includes(role)) {
    return {
      valid: false,
      name,
      email,
      error: 'Jabatan pengguna tidak valid.',
    };
  }

  return { valid: true, name, email };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

export async function getUsersList(): Promise<ManagedUserItem[]> {
  await requireRole(['SUPER_ADMIN']);

  const { rows } = await pool.query<UserRow>(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.is_active,
       u.password_changed_at,
       u.must_change_password,
       u.created_at,
       COUNT(b.id)::int AS article_count
     FROM public.users u
     LEFT JOIN public.berita b ON b.author_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at ASC, u.id ASC`
  );

  return rows.map(mapUserRow);
}

export async function createUserAction(input: {
  name: string;
  email: string;
  role: UserRole;
  temporaryPassword: string;
}): Promise<UserActionResult<ManagedUserItem>> {
  await requireRole(['SUPER_ADMIN']);

  const validated = validateNameAndEmail(input.name, input.email, input.role);
  if (!validated.valid) {
    return { success: false, error: validated.error };
  }

  const temporaryPassword = input.temporaryPassword || '';
  const strength = validatePasswordStrength(temporaryPassword);
  if (!strength.valid) {
    return { success: false, error: strength.error };
  }

  const existing = await pool.query<{ id: number }>(
    `SELECT id
     FROM public.users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [validated.email]
  );

  if (existing.rows.length > 0) {
    return {
      success: false,
      error: 'Alamat email sudah terdaftar pada akun lain.',
    };
  }

  const passwordHash = await hashPassword(temporaryPassword);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const inserted = await client.query<UserRow>(
      `INSERT INTO public.users (
         name,
         email,
         password_hash,
         role,
         is_active,
         password_changed_at,
         must_change_password,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4, TRUE, NOW(), TRUE, NOW(), NOW())
       RETURNING
         id,
         name,
         email,
         role,
         is_active,
         password_changed_at,
         must_change_password,
         created_at`,
      [validated.name, validated.email, passwordHash, input.role]
    );

    const createdRow = inserted.rows[0];

    await client.query(
      `INSERT INTO public.password_histories (user_id, password_hash, created_at)
       VALUES ($1, $2, NOW())`,
      [createdRow.id, passwordHash]
    );

    await client.query('COMMIT');
    revalidatePath('/admin/users');

    return {
      success: true,
      data: mapUserRow(createdRow),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: 'Alamat email sudah terdaftar pada akun lain.',
      };
    }
    console.error('Error in createUserAction:', error);
    return {
      success: false,
      error: 'Gagal membuat akun pengguna baru. Silakan coba kembali.',
    };
  } finally {
    client.release();
  }
}

export async function updateUserAction(input: {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}): Promise<UserActionResult<ManagedUserItem>> {
  const currentUser = await requireRole(['SUPER_ADMIN']);

  const userId = Number(input.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, error: 'ID pengguna tidak valid.' };
  }

  const validated = validateNameAndEmail(input.name, input.email, input.role);
  if (!validated.valid) {
    return { success: false, error: validated.error };
  }

  try {
    const targetRes = await pool.query<{ id: number; role: UserRole }>(
      `SELECT id, role
       FROM public.users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    const targetUser = targetRes.rows[0];
    if (!targetUser) {
      return { success: false, error: 'Akun pengguna tidak ditemukan.' };
    }

    if (userId === currentUser.id && input.role !== targetUser.role) {
      return {
        success: false,
        error: 'Anda tidak dapat mengubah jabatan akun yang sedang Anda gunakan.',
      };
    }

    const duplicateEmail = await pool.query<{ id: number }>(
      `SELECT id
       FROM public.users
       WHERE LOWER(email) = LOWER($1)
         AND id <> $2
       LIMIT 1`,
      [validated.email, userId]
    );

    if (duplicateEmail.rows.length > 0) {
      return {
        success: false,
        error: 'Alamat email sudah digunakan oleh akun lain.',
      };
    }

    const updatedRes = await pool.query<UserRow>(
      `UPDATE public.users
       SET name = $1,
           email = $2,
           role = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING
         id,
         name,
         email,
         role,
         is_active,
         password_changed_at,
         must_change_password,
         created_at,
         (SELECT COUNT(*)::int FROM public.berita b WHERE b.author_id = public.users.id) AS article_count`,
      [validated.name, validated.email, input.role, userId]
    );

    const updatedRow = updatedRes.rows[0];
    if (!updatedRow) {
      return { success: false, error: 'Akun pengguna tidak ditemukan.' };
    }

    // Cabut sesi aktif jika jabatan akun lain berubah agar hak akses baru langsung berlaku saat login ulang.
    if (userId !== currentUser.id && targetUser.role !== input.role) {
      await revokeUserSessions(userId);
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin', 'layout');

    return {
      success: true,
      data: mapUserRow(updatedRow),
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: 'Alamat email sudah digunakan oleh akun lain.',
      };
    }
    console.error('Error in updateUserAction:', error);
    return {
      success: false,
      error: 'Gagal memperbarui data pengguna. Silakan coba kembali.',
    };
  }
}

export async function toggleUserStatusAction(input: {
  userId: number;
  isActive: boolean;
}): Promise<UserActionResult<ManagedUserItem>> {
  const currentUser = await requireRole(['SUPER_ADMIN']);

  const userId = Number(input.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, error: 'ID pengguna tidak valid.' };
  }

  if (typeof input.isActive !== 'boolean') {
    return { success: false, error: 'Status akun tidak valid.' };
  }

  if (userId === currentUser.id) {
    return {
      success: false,
      error: 'Anda tidak dapat menonaktifkan atau mengubah status akun sendiri.',
    };
  }

  try {
    const updatedRes = await pool.query<UserRow>(
      `UPDATE public.users
       SET is_active = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         name,
         email,
         role,
         is_active,
         password_changed_at,
         must_change_password,
         created_at,
         (SELECT COUNT(*)::int FROM public.berita b WHERE b.author_id = public.users.id) AS article_count`,
      [input.isActive, userId]
    );

    const updatedRow = updatedRes.rows[0];
    if (!updatedRow) {
      return { success: false, error: 'Akun pengguna tidak ditemukan.' };
    }

    if (!input.isActive) {
      await revokeUserSessions(userId);
    }

    revalidatePath('/admin/users');

    return {
      success: true,
      data: mapUserRow(updatedRow),
    };
  } catch (error) {
    console.error('Error in toggleUserStatusAction:', error);
    return {
      success: false,
      error: 'Gagal memperbarui status aktif pengguna.',
    };
  }
}

export async function resetUserPasswordAction(input: {
  userId: number;
  temporaryPassword: string;
}): Promise<UserActionResult> {
  await requireRole(['SUPER_ADMIN']);

  const userId = Number(input.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, error: 'ID pengguna tidak valid.' };
  }

  const temporaryPassword = input.temporaryPassword || '';
  const strength = validatePasswordStrength(temporaryPassword);
  if (!strength.valid) {
    return { success: false, error: strength.error };
  }

  try {
    const targetRes = await pool.query<{ id: number }>(
      `SELECT id FROM public.users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (targetRes.rows.length === 0) {
      return { success: false, error: 'Akun pengguna tidak ditemukan.' };
    }

    const reused = await isPasswordReused(userId, temporaryPassword);
    if (reused) {
      return {
        success: false,
        error:
          'Kata sandi sementara tidak boleh sama dengan kata sandi yang sedang atau pernah digunakan oleh akun ini.',
      };
    }

    const passwordHash = await hashPassword(temporaryPassword);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE public.users
         SET password_hash = $1,
             password_changed_at = NOW(),
             must_change_password = TRUE,
             updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, userId]
      );

      await client.query(
        `INSERT INTO public.password_histories (user_id, password_hash, created_at)
         VALUES ($1, $2, NOW())`,
        [userId, passwordHash]
      );

      await client.query('COMMIT');
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

    await revokeUserSessions(userId);
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Error in resetUserPasswordAction:', error);
    return {
      success: false,
      error: 'Gagal mereset kata sandi pengguna. Silakan coba kembali.',
    };
  }
}

export async function deleteUserAction(input: {
  userId: number;
}): Promise<UserActionResult> {
  const currentUser = await requireRole(['SUPER_ADMIN']);

  const userId = Number(input.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, error: 'ID pengguna tidak valid.' };
  }

  if (userId === currentUser.id) {
    return {
      success: false,
      error: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan.',
    };
  }

  try {
    const deletedRes = await pool.query<{ id: number }>(
      `DELETE FROM public.users
       WHERE id = $1
       RETURNING id`,
      [userId]
    );

    if (deletedRes.rows.length === 0) {
      return { success: false, error: 'Akun pengguna tidak ditemukan.' };
    }

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteUserAction:', error);
    return {
      success: false,
      error: 'Gagal menghapus akun pengguna. Silakan coba kembali.',
    };
  }
}
