'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import pool from '@/lib/db/pool';
import {
  hashPassword,
  isPasswordExpired,
  isPasswordReused,
  validatePasswordStrength,
  verifyPassword,
} from './password';
import {
  createSession,
  destroyCurrentSession,
  getCurrentUser,
  requireAuth,
} from './session';
import {
  getDefaultDashboardPath,
  resolveSafeRedirectPath,
  type AuthActionResult,
  type UserRole,
} from './types';

// Hash pembanding konstan (cost 12) agar waktu respons email tidak terdaftar setara dengan sandi salah.
const TIMING_SAFE_DUMMY_HASH =
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oL9S1G5W2';

const GENERIC_LOGIN_ERROR = 'Email atau kata sandi salah';
const REUSED_PASSWORD_ERROR =
  'Kata sandi baru tidak boleh sama dengan kata sandi yang pernah digunakan sebelumnya.';

interface LoginUserRow {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  password_changed_at: Date | string;
  must_change_password: boolean;
}

export async function loginAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const password = (formData.get('password') as string) || '';
  const rawRemember = formData.get('remember_me');
  const rememberMe = rawRemember === 'true' || rawRemember === 'on';
  const nextPath = ((formData.get('next') as string) || '').trim();

  if (!email || !password) {
    return {
      success: false,
      error: 'Email dan kata sandi wajib diisi.',
    };
  }

  let redirectTarget: string | null = null;

  try {
    const { rows } = await pool.query<LoginUserRow>(
      `SELECT
         id,
         email,
         password_hash,
         role,
         is_active,
         password_changed_at,
         must_change_password
       FROM public.users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) {
      await verifyPassword(password, TIMING_SAFE_DUMMY_HASH);
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches || !user.is_active) {
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    await createSession(Number(user.id), { rememberMe });

    const changedAt =
      user.password_changed_at instanceof Date
        ? user.password_changed_at
        : new Date(user.password_changed_at);

    const needsPasswordUpdate =
      Boolean(user.must_change_password) || isPasswordExpired(changedAt);

    redirectTarget = needsPasswordUpdate
      ? '/ganti-sandi-wajib'
      : resolveSafeRedirectPath(nextPath, user.role);
  } catch (error) {
    console.error('Error in loginAction:', error);
    return {
      success: false,
      error: 'Terjadi gangguan pada server autentikasi. Silakan coba kembali.',
    };
  }

  redirect(redirectTarget);
}

async function applyUserPasswordChange(
  userId: number,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthActionResult> {
  if (!currentPassword) {
    return { success: false, error: 'Kata sandi saat ini wajib diisi.' };
  }

  if (!newPassword) {
    return { success: false, error: 'Kata sandi baru wajib diisi.' };
  }

  if (!confirmPassword) {
    return {
      success: false,
      error: 'Konfirmasi kata sandi baru wajib diisi.',
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: 'Konfirmasi kata sandi baru tidak cocok.',
    };
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return { success: false, error: strength.error };
  }

  const { rows } = await pool.query<{ password_hash: string; is_active: boolean }>(
    `SELECT password_hash, is_active
     FROM public.users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );

  const userRow = rows[0];
  if (!userRow || !userRow.is_active) {
    return {
      success: false,
      error: 'Akun tidak ditemukan atau sudah tidak aktif.',
    };
  }

  const isCurrentValid = await verifyPassword(
    currentPassword,
    userRow.password_hash
  );
  if (!isCurrentValid) {
    return {
      success: false,
      error: 'Kata sandi saat ini tidak sesuai.',
    };
  }

  const reused = await isPasswordReused(userId, newPassword);
  if (reused) {
    return {
      success: false,
      error: REUSED_PASSWORD_ERROR,
    };
  }

  const nextHash = await hashPassword(newPassword);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE public.users
       SET password_hash = $1,
           password_changed_at = NOW(),
           must_change_password = FALSE,
           updated_at = NOW()
       WHERE id = $2`,
      [nextHash, userId]
    );
    await client.query(
      `INSERT INTO public.password_histories (user_id, password_hash, created_at)
       VALUES ($1, $2, NOW())`,
      [userId, nextHash]
    );
    await client.query('COMMIT');
    return { success: true };
  } catch (txError) {
    await client.query('ROLLBACK');
    throw txError;
  } finally {
    client.release();
  }
}

export async function forceChangePasswordAction(
  formData: FormData
): Promise<AuthActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const currentPassword = (formData.get('current_password') as string) || '';
  const newPassword = (formData.get('new_password') as string) || '';
  const confirmPassword = (formData.get('confirm_password') as string) || '';

  let result: AuthActionResult;
  try {
    result = await applyUserPasswordChange(
      user.id,
      currentPassword,
      newPassword,
      confirmPassword
    );
  } catch (error) {
    console.error('Error in forceChangePasswordAction:', error);
    return {
      success: false,
      error: 'Gagal memperbarui kata sandi. Silakan coba kembali.',
    };
  }

  if (!result.success) {
    return result;
  }

  redirect(getDefaultDashboardPath(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect('/login');
}

export async function updateOwnProfileAction(
  formData: FormData
): Promise<AuthActionResult> {
  const user = await requireAuth();

  const name = ((formData.get('name') as string) || '').trim();
  if (!name) {
    return {
      success: false,
      error: 'Nama lengkap tidak boleh kosong.',
    };
  }

  if (name.length > 150) {
    return {
      success: false,
      error: 'Nama lengkap tidak boleh melebihi 150 karakter.',
    };
  }

  try {
    await pool.query(
      `UPDATE public.users
       SET name = $1,
           updated_at = NOW()
       WHERE id = $2
         AND is_active = TRUE`,
      [name, user.id]
    );

    revalidatePath('/admin', 'layout');
    revalidatePath('/admin/profil');
    revalidatePath('/reporter', 'layout');
    revalidatePath('/reporter/profil');

    return { success: true };
  } catch (error) {
    console.error('Error in updateOwnProfileAction:', error);
    return {
      success: false,
      error: 'Gagal memperbarui profil akun.',
    };
  }
}

export async function changeOwnPasswordAction(
  formData: FormData
): Promise<AuthActionResult> {
  const user = await requireAuth();

  const currentPassword = (formData.get('current_password') as string) || '';
  const newPassword = (formData.get('new_password') as string) || '';
  const confirmPassword = (formData.get('confirm_password') as string) || '';

  try {
    return await applyUserPasswordChange(
      user.id,
      currentPassword,
      newPassword,
      confirmPassword
    );
  } catch (error) {
    console.error('Error in changeOwnPasswordAction:', error);
    return {
      success: false,
      error: 'Gagal memperbarui kata sandi.',
    };
  }
}
