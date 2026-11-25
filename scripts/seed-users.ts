import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;
const SALT_ROUNDS = 12;

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN_BERITA' | 'REPORTER';
}

const INITIAL_ACCOUNTS: SeedAccount[] = [
  {
    name: 'Super Admin',
    email: 'superadmin@sukabumikota.go.id',
    password: 'AdminSukabumi123!',
    role: 'SUPER_ADMIN',
  },
  {
    name: 'Admin Berita',
    email: 'adminberita@sukabumikota.go.id',
    password: 'BeritaSukabumi123!',
    role: 'ADMIN_BERITA',
  },
  {
    name: 'Reporter',
    email: 'reporter@sukabumikota.go.id',
    password: 'ReporterSukabumi123!',
    role: 'REPORTER',
  },
];

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local');
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
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const forceReset = process.argv.includes('--reset');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'db_smi_temp',
  });

  const client = await pool.connect();

  try {
    const migrationPath = path.join(
      process.cwd(),
      'migrations',
      '004_create_users_and_sessions.sql'
    );
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    await client.query('BEGIN');
    await client.query(migrationSql);

    for (const account of INITIAL_ACCOUNTS) {
      const existing = await client.query<{ id: number; password_hash: string }>(
        `SELECT id, password_hash
         FROM public.users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [account.email]
      );

      if (existing.rows.length === 0) {
        const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);
        const inserted = await client.query<{ id: number }>(
          `INSERT INTO public.users (
             name,
             email,
             password_hash,
             role,
             is_active,
             password_changed_at,
             must_change_password
           )
           VALUES ($1, $2, $3, $4, TRUE, NOW(), FALSE)
           RETURNING id`,
          [account.name, account.email.toLowerCase(), passwordHash, account.role]
        );

        const userId = inserted.rows[0].id;
        await client.query(
          `INSERT INTO public.password_histories (user_id, password_hash)
           VALUES ($1, $2)`,
          [userId, passwordHash]
        );
        console.log(`[SEEDED] ${account.email} (${account.role})`);
      } else {
        const userId = existing.rows[0].id;
        let activeHash = existing.rows[0].password_hash;

        if (forceReset) {
          activeHash = await bcrypt.hash(account.password, SALT_ROUNDS);
          await client.query(
            `UPDATE public.users
             SET password_hash = $1,
                 role = $2,
                 is_active = TRUE,
                 password_changed_at = NOW(),
                 must_change_password = FALSE,
                 updated_at = NOW()
             WHERE id = $3`,
            [activeHash, account.role, userId]
          );
        }

        const historyCount = await client.query<{ count: number }>(
          `SELECT COUNT(*)::int AS count
           FROM public.password_histories
           WHERE user_id = $1`,
          [userId]
        );

        if (historyCount.rows[0].count === 0 || forceReset) {
          await client.query(
            `INSERT INTO public.password_histories (user_id, password_hash)
             VALUES ($1, $2)`,
            [userId, activeHash]
          );
        }
        console.log(
          `[${forceReset ? 'RESET' : 'EXISTS'}] ${account.email} (${account.role})`
        );
      }
    }

    await client.query('COMMIT');
    console.log('Migrasi 004 dan seed pengguna awal selesai.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Gagal menjalankan migrasi atau seed pengguna:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
