import { headers } from 'next/headers';

export const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_ERROR_MESSAGE =
  'Terlalu banyak percobaan gagal. Silakan coba lagi dalam beberapa menit.';

const MAX_TRACKED_KEYS = 5000;

type RateLimitStore = Map<string, number[]>;

declare global {
  var __sukabumiAuthRateLimitStore: RateLimitStore | undefined;
}

// Simpan di globalThis agar state tetap konsisten saat modul dimuat ulang di mode dev.
function getStore(): RateLimitStore {
  if (!globalThis.__sukabumiAuthRateLimitStore) {
    globalThis.__sukabumiAuthRateLimitStore = new Map<string, number[]>();
  }
  return globalThis.__sukabumiAuthRateLimitStore;
}

function normalizeClientIp(rawIp: string): string {
  const trimmed = rawIp.trim();
  if (!trimmed) return '127.0.0.1';
  if (trimmed === '::1' || trimmed === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  return trimmed;
}

export async function getClientIpFromHeaders(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const forwardedFor = reqHeaders.get('x-forwarded-for');
    if (forwardedFor) {
      const firstHop = forwardedFor.split(',')[0]?.trim();
      if (firstHop) {
        return normalizeClientIp(firstHop);
      }
    }

    const realIp = reqHeaders.get('x-real-ip')?.trim();
    if (realIp) {
      return normalizeClientIp(realIp);
    }
  } catch {
    // Fallback aman apabila konteks header request tidak tersedia.
  }

  return '127.0.0.1';
}

export function buildAuthRateLimitKey(
  scope: 'login' | 'password-change',
  ip: string,
  identifier: string | number
): string {
  const normalizedIp = normalizeClientIp(ip);
  const normalizedId = String(identifier).trim().toLowerCase();
  return `${scope}:${normalizedIp}:${normalizedId}`;
}

function pruneExpiredTimestamps(
  store: RateLimitStore,
  key: string,
  now: number,
  windowMs: number
): number[] {
  const existing = store.get(key);
  if (!existing || existing.length === 0) {
    return [];
  }

  const cutoff = now - windowMs;
  const active = existing.filter((ts) => ts > cutoff);
  if (active.length === 0) {
    store.delete(key);
    return [];
  }

  if (active.length !== existing.length) {
    store.set(key, active);
  }
  return active;
}

function sweepStaleEntries(
  store: RateLimitStore,
  now: number,
  windowMs: number
): void {
  if (store.size < MAX_TRACKED_KEYS) {
    return;
  }

  const cutoff = now - windowMs;
  for (const [entryKey, timestamps] of store.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      store.delete(entryKey);
    } else if (active.length !== timestamps.length) {
      store.set(entryKey, active);
    }
  }
}

export function isRateLimited(
  key: string,
  maxAttempts: number = AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: number = AUTH_RATE_LIMIT_WINDOW_MS
): boolean {
  const store = getStore();
  const active = pruneExpiredTimestamps(store, key, Date.now(), windowMs);
  return active.length >= maxAttempts;
}

export function recordFailedAttempt(
  key: string,
  windowMs: number = AUTH_RATE_LIMIT_WINDOW_MS
): number {
  const now = Date.now();
  const store = getStore();
  sweepStaleEntries(store, now, windowMs);

  const active = pruneExpiredTimestamps(store, key, now, windowMs);
  active.push(now);
  store.set(key, active);
  return active.length;
}

export function resetRateLimit(key: string): void {
  getStore().delete(key);
}
