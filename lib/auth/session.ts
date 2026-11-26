import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import pool from '@/lib/db/pool';
import { isPasswordExpired } from './password';
import {
  getRoleFallbackPath,
  type AuthUser,
  type UserRole,
} from './types';

export const SESSION_COOKIE_NAME = 'sukabumi_session';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;
const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000;
const RAW_TOKEN_HEX_REGEX = /^[0-9a-f]{64}$/i;

interface SessionUserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password_changed_at: Date | string;
  must_change_password: boolean;
}

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createSession(
  userId: number,
  options?: { rememberMe?: boolean }
): Promise<void> {
  const rememberMe = Boolean(options?.rememberMe);
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(
    Date.now() + (rememberMe ? SEVEN_DAYS_MS : ONE_DAY_MS)
  );

  await pool.query(`DELETE FROM public.sessions WHERE expires_at <= NOW()`);

  await pool.query(
    `INSERT INTO public.sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [tokenHash, userId, expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(rememberMe ? { maxAge: SEVEN_DAYS_SECONDS } : {}),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim();
    if (!rawToken || !RAW_TOKEN_HEX_REGEX.test(rawToken)) {
      return null;
    }

    const tokenHash = hashSessionToken(rawToken);
    const { rows } = await pool.query<SessionUserRow>(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         u.is_active,
         u.password_changed_at,
         u.must_change_password
       FROM public.sessions s
       INNER JOIN public.users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    const row = rows[0];
    if (!row || !row.is_active) {
      return null;
    }

    const passwordChangedAt =
      row.password_changed_at instanceof Date
        ? row.password_changed_at
        : new Date(row.password_changed_at);

    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      isActive: Boolean(row.is_active),
      passwordChangedAt,
      mustChangePassword: Boolean(row.must_change_password),
      isPasswordExpired: isPasswordExpired(passwordChangedAt),
    };
  } catch (error) {
    console.error('Error reading current session:', error);
    return null;
  }
}

export async function requireAuth(options?: {
  allowExpiredPassword?: boolean;
}): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (
    !options?.allowExpiredPassword &&
    (user.mustChangePassword || user.isPasswordExpired)
  ) {
    redirect('/ganti-sandi-wajib');
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect(getRoleFallbackPath(user.role));
  }
  return user;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim();

  if (rawToken && RAW_TOKEN_HEX_REGEX.test(rawToken)) {
    const tokenHash = hashSessionToken(rawToken);
    await pool.query(`DELETE FROM public.sessions WHERE token_hash = $1`, [
      tokenHash,
    ]);
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function revokeUserSessions(userId: number): Promise<void> {
  await pool.query(`DELETE FROM public.sessions WHERE user_id = $1`, [userId]);
}
