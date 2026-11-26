import fs from 'fs'
import path from 'path'
import pg from 'pg'
import { test, expect } from '@playwright/test'

const { Pool } = pg
const E2E_TEST_EMAIL = 'e2e.tester@sukabumikota.go.id'

// Gunakan sesi kosong agar seluruh skenario menguji gerbang autentikasi dari awal.
test.use({ storageState: { cookies: [], origins: [] } })

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

async function cleanupE2eUser(): Promise<void> {
  loadEnvLocal()
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'db_smi_temp',
  })

  try {
    await pool.query(
      `DELETE FROM public.users WHERE LOWER(email) = LOWER($1)`,
      [E2E_TEST_EMAIL]
    )
  } finally {
    await pool.end()
  }
}

test.describe('Autentikasi, RBAC, Wajib Ganti Sandi, dan Manajemen User', () => {
  test.beforeAll(async () => {
    await cleanupE2eUser()
  })

  test.afterAll(async () => {
    await cleanupE2eUser()
  })

  test('1. Akses /admin tanpa login diarahkan ke /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
    await expect(
      page.getByRole('heading', { name: 'Masuk Portal Pengelola' })
    ).toBeVisible()
  })

  test('2. ADMIN_BERITA dapat membuka /admin/berita tetapi ditolak dari /admin/pengaturan dan /admin/users', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('adminberita@sukabumikota.go.id')
    await page.locator('#login-password').fill('BeritaSukabumi123!')
    await page.getByRole('button', { name: 'Masuk ke Portal' }).click()

    await expect(page).toHaveURL(/\/admin$/)

    await page.goto('/admin/berita')
    await expect(page).toHaveURL(/\/admin\/berita$/)

    await page.goto('/admin/pengaturan')
    await expect(page).toHaveURL(/\/admin\/berita$/)

    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/admin\/berita$/)
  })

  test('3. REPORTER diarahkan ke /reporter/berita dan ditolak saat mencoba membuka /admin', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('reporter@sukabumikota.go.id')
    await page.locator('#login-password').fill('ReporterSukabumi123!')
    await page.getByRole('button', { name: 'Masuk ke Portal' }).click()

    await expect(page).toHaveURL(/\/reporter\/berita$/)

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/reporter\/berita$/)
  })

  test('4. SUPER_ADMIN membuat user baru, user wajib ganti sandi, tolak sandi sama, dan masuk ke dashboard setelah ganti sandi', async ({
    page,
  }) => {
    await cleanupE2eUser()

    try {
      await page.goto('/login')
      await page.locator('#login-email').fill('superadmin@sukabumikota.go.id')
      await page.locator('#login-password').fill('AdminSukabumi123!')
      await page.getByRole('button', { name: 'Masuk ke Portal' }).click()
      await expect(page).toHaveURL(/\/admin$/)

      await page.goto('/admin/users')
      await expect(
        page.getByRole('heading', { name: 'Manajemen User' })
      ).toBeVisible()

      await page.getByRole('button', { name: 'Tambah User Baru' }).click()

      const createDialog = page.getByRole('dialog', {
        name: 'Tambah User Baru',
      })
      await expect(createDialog).toBeVisible()

      await createDialog.locator('#create-user-name').fill('Staf Uji E2E')
      await createDialog.locator('#create-user-email').fill(E2E_TEST_EMAIL)
      await createDialog
        .locator('#create-user-role')
        .selectOption('ADMIN_BERITA')
      await createDialog
        .locator('#create-user-password')
        .fill('SandiSementara123!')
      await createDialog.getByRole('button', { name: 'Simpan Akun' }).click()

      const createdDialog = page.getByRole('dialog', {
        name: 'Akun Baru Berhasil Dibuat',
      })
      await expect(createdDialog).toBeVisible()
      await expect(
        createdDialog.getByRole('button', { name: 'Salin Info Login' })
      ).toBeVisible()
      await expect(async () => {
        if (await createdDialog.isVisible()) {
          await createdDialog.getByRole('button', { name: 'Selesai' }).click()
        }
        await expect(createdDialog).toBeHidden({ timeout: 2000 })
      }).toPass({ timeout: 10000 })

      await expect(page.getByText(E2E_TEST_EMAIL)).toBeVisible()

      // Keluar dari sesi Super Admin lalu masuk menggunakan akun baru.
      await page.locator('aside button[aria-haspopup="menu"]').click()
      await page.getByRole('menuitem', { name: 'Keluar' }).click()
      await expect(page).toHaveURL(/\/login(\?.*)?$/)

      await page.locator('#login-email').fill(E2E_TEST_EMAIL)
      await page.locator('#login-password').fill('SandiSementara123!')
      await page.getByRole('button', { name: 'Masuk ke Portal' }).click()

      await expect(page).toHaveURL(/\/ganti-sandi-wajib$/)
      await expect(
        page.getByRole('heading', { name: 'Perbarui Kata Sandi' })
      ).toBeVisible()

      // Uji penolakan saat sandi baru sama dengan sandi sementara.
      await page
        .locator('#force-current-password')
        .fill('SandiSementara123!')
      await page.locator('#force-new-password').fill('SandiSementara123!')
      await page
        .locator('#force-confirm-password')
        .fill('SandiSementara123!')
      await page
        .getByRole('button', { name: 'Simpan Kata Sandi Baru' })
        .click()

      await expect(page.locator('form [role="alert"]')).toContainText(
        /tidak boleh sama dengan kata sandi yang pernah digunakan/i
      )
      await expect(page).toHaveURL(/\/ganti-sandi-wajib$/)

      // Ganti dengan sandi baru yang memenuhi kebijakan.
      await page
        .locator('#force-current-password')
        .fill('SandiSementara123!')
      await page.locator('#force-new-password').fill('SandiBaruValid456!')
      await page
        .locator('#force-confirm-password')
        .fill('SandiBaruValid456!')
      await page
        .getByRole('button', { name: 'Simpan Kata Sandi Baru' })
        .click()

      await expect(page).toHaveURL(/\/admin$/)
    } finally {
      await cleanupE2eUser()
    }
  })
})
