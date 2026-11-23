import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { DEFAULT_SITE_SETTINGS } from './defaults';
import type { SiteSectionKey } from './types';

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

async function runMigrationAndSeed(): Promise<void> {
  loadEnvLocal();

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'db_smi_temp',
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.site_settings (
        section_key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const keys = Object.keys(DEFAULT_SITE_SETTINGS) as SiteSectionKey[];
    for (const key of keys) {
      await pool.query(
        `INSERT INTO public.site_settings (section_key, data, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (section_key) DO NOTHING`,
        [key, JSON.stringify(DEFAULT_SITE_SETTINGS[key])]
      );
    }

    const { rows } = await pool.query<{ section_key: string }>(
      `SELECT section_key FROM public.site_settings ORDER BY section_key ASC`
    );
    console.log(
      'Migrasi & seed public.site_settings berhasil. Section terdaftar:',
      rows.map((r) => r.section_key).join(', ')
    );
  } finally {
    await pool.end();
  }
}

runMigrationAndSeed().catch((err) => {
  console.error('Gagal menjalankan migrasi site_settings:', err);
  process.exit(1);
});
