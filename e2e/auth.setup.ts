import fs from 'fs'
import path from 'path'
import { test as setup, expect } from '@playwright/test'

const authFile = path.join(
  process.cwd(),
  'playwright',
  '.auth',
  'superadmin.json'
)

setup('authenticate as super admin', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')
  await expect(
    page.getByRole('heading', { name: 'Masuk Portal Pengelola' })
  ).toBeVisible()

  await page.locator('#login-email').fill('superadmin@sukabumikota.go.id')
  await page.locator('#login-password').fill('AdminSukabumi123!')
  await page.locator('#login-remember').check()
  await page.getByRole('button', { name: 'Masuk ke Portal' }).click()

  await expect(page).toHaveURL(/\/admin$/)

  await page.context().storageState({ path: authFile })
})
