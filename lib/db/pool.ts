import { Pool, type PoolConfig } from 'pg';

const LOCAL_DB_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
  return LOCAL_DB_HOSTS.has(normalized);
}

function shouldUseSslForConnectionString(connectionString: string): boolean {
  try {
    const parsed = new URL(connectionString);
    const sslMode = parsed.searchParams.get('sslmode')?.toLowerCase();
    if (sslMode === 'disable') return false;
    if (sslMode && sslMode !== 'prefer' && sslMode !== 'allow') return true;
    return !isLocalHost(parsed.hostname);
  } catch {
    return true;
  }
}

export function getPgPoolConfig(overrides?: Partial<PoolConfig>): PoolConfig {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const useSsl = shouldUseSslForConnectionString(connectionString);
    return {
      connectionString,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
      ...overrides,
    };
  }

  const host = process.env.DB_HOST || 'localhost';
  const useSsl = !isLocalHost(host);

  return {
    host,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'db_smi_temp',
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    ...overrides,
  };
}

export const pool = new Pool(getPgPoolConfig({ max: 10 }));

export default pool;

