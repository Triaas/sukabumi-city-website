import fs from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function loadEnvFile(filename: string): void {
  const envPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function loadEnvConfig(): void {
  // Prioritas mengikuti konvensi Next.js: env shell > .env.local > .env
  loadEnvFile('.env.local');
  loadEnvFile('.env');
}

// Resolusi alias `@/` agar modul aplikasi di `lib/` berjalan langsung di Node CLI.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const basePath = path.join(process.cwd(), specifier.slice(2));
      const candidates = [
        basePath,
        `${basePath}.ts`,
        `${basePath}.js`,
        path.join(basePath, 'index.ts'),
        path.join(basePath, 'index.js'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

function printUsage(): void {
  console.error(
    'Cara penggunaan: pnpm run reset:superadmin -- <email> <sandi_sementara_baru>'
  );
}

async function main(): Promise<void> {
  loadEnvConfig();

  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;
  const emailArg = (args[0] ?? '').trim();
  const newTemporaryPassword = args[1] ?? '';

  const [{ hashPassword, isPasswordReused, validatePasswordStrength }, { default: pool }] =
    await Promise.all([
      import('@/lib/auth/password'),
      import('@/lib/db/pool'),
    ]);

  if (!emailArg || !newTemporaryPassword) {
    console.error('Gagal: Argumen email dan sandi sementara baru wajib diisi.');
    printUsage();
    await pool.end();
    process.exit(1);
  }

  try {
    const userRes = await pool.query<{
      id: number;
      name: string;
      email: string;
      role: string;
    }>(
      `SELECT id, name, email, role
       FROM public.users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [emailArg]
    );

    const targetUser = userRes.rows[0];
    if (!targetUser) {
      console.error(`Gagal: Akun dengan email "${emailArg}" tidak ditemukan.`);
      process.exitCode = 1;
      return;
    }

    if (targetUser.role !== 'SUPER_ADMIN') {
      console.error(
        `Gagal: Akun "${targetUser.email}" memiliki role "${targetUser.role}". Skrip pemulihan ini hanya diizinkan untuk akun SUPER_ADMIN.`
      );
      process.exitCode = 1;
      return;
    }

    const strength = validatePasswordStrength(newTemporaryPassword);
    if (!strength.valid) {
      console.error(`Gagal: ${strength.error}`);
      process.exitCode = 1;
      return;
    }

    const reused = await isPasswordReused(targetUser.id, newTemporaryPassword);
    if (reused) {
      console.error(
        'Gagal: Kata sandi sementara baru tidak boleh sama dengan kata sandi yang sedang atau pernah digunakan sebelumnya.'
      );
      process.exitCode = 1;
      return;
    }

    const passwordHash = await hashPassword(newTemporaryPassword);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE public.users
         SET password_hash = $1,
             password_changed_at = NOW(),
             must_change_password = TRUE,
             is_active = TRUE,
             updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, targetUser.id]
      );

      await client.query(
        `INSERT INTO public.password_histories (user_id, password_hash, created_at)
         VALUES ($1, $2, NOW())`,
        [targetUser.id, passwordHash]
      );

      const revokedSessions = await client.query(
        `DELETE FROM public.sessions
         WHERE user_id = $1`,
        [targetUser.id]
      );

      await client.query('COMMIT');

      console.log(
        `[RESET BERHASIL] Kata sandi sementara akun SUPER_ADMIN "${targetUser.email}" (${targetUser.name}) berhasil diperbarui.`
      );
      console.log(
        `Status akun aktif (is_active = TRUE), wajib mengganti sandi saat login berikutnya (must_change_password = TRUE), dan ${revokedSessions.rowCount ?? 0} sesi aktif telah dicabut.`
      );
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
    console.error(`Gagal menjalankan pemulihan akun SUPER_ADMIN: ${message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
