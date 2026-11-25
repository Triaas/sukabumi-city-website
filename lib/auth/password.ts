import bcrypt from 'bcryptjs';
import pool from '@/lib/db/pool';

const SALT_ROUNDS = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_BCRYPT_BYTES = 72;

function resolveExpiryDays(): number {
  const raw = process.env.PASSWORD_EXPIRY_DAYS;
  if (raw === undefined || raw.trim() === '') return 30;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 30;
}

export const PASSWORD_EXPIRY_DAYS = resolveExpiryDays();

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export function isPasswordExpired(passwordChangedAt: Date): boolean {
  const expiryDays = resolveExpiryDays();
  const changedAtMs =
    passwordChangedAt instanceof Date
      ? passwordChangedAt.getTime()
      : new Date(passwordChangedAt).getTime();

  if (Number.isNaN(changedAtMs)) return true;

  const elapsedDays = (Date.now() - changedAtMs) / MS_PER_DAY;
  return elapsedDays >= expiryDays;
}

export function validatePasswordStrength(plain: string): {
  valid: boolean;
  error?: string;
} {
  if (!plain || plain.length < 8) {
    return {
      valid: false,
      error: 'Kata sandi baru minimal harus terdiri dari 8 karakter.',
    };
  }

  // bcrypt mengabaikan byte setelah batas 72 byte UTF-8.
  if (Buffer.byteLength(plain, 'utf8') > MAX_BCRYPT_BYTES) {
    return {
      valid: false,
      error: 'Kata sandi baru terlalu panjang (maksimal 72 karakter).',
    };
  }

  const hasLetter = /[a-zA-Z]/.test(plain);
  const hasDigit = /\d/.test(plain);

  if (!hasLetter || !hasDigit) {
    return {
      valid: false,
      error: 'Kata sandi baru wajib mengandung kombinasi huruf dan angka.',
    };
  }

  return { valid: true };
}

export async function isPasswordReused(
  userId: number,
  plain: string
): Promise<boolean> {
  const [userRes, historyRes] = await Promise.all([
    pool.query<{ password_hash: string }>(
      `SELECT password_hash FROM public.users WHERE id = $1 LIMIT 1`,
      [userId]
    ),
    pool.query<{ password_hash: string }>(
      `SELECT password_hash
       FROM public.password_histories
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ),
  ]);

  const uniqueHashes = new Set<string>();
  if (userRes.rows[0]?.password_hash) {
    uniqueHashes.add(userRes.rows[0].password_hash);
  }
  for (const row of historyRes.rows) {
    if (row.password_hash) {
      uniqueHashes.add(row.password_hash);
    }
  }

  for (const existingHash of uniqueHashes) {
    const matched = await verifyPassword(plain, existingHash);
    if (matched) return true;
  }

  return false;
}
