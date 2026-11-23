import fs from 'fs'
import path from 'path'
import { test, expect } from '@playwright/test'

// Valid 1x1 transparent PNG in memory for upload testing
const ONE_BY_ONE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64'
)

test.describe('Pengaturan Beranda Super Admin (/admin/pengaturan)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pengaturan')
    await expect(
      page.getByRole('heading', { name: 'Pengaturan Beranda Pengunjung' })
    ).toBeVisible()
  })

  test('1. Hero Section & Revalidation: ubah judul, verifikasi di /, lalu reset ke default', async ({
    page,
  }) => {
    const heroTab = page.getByRole('tab', { name: /Hero Section/i })
    await heroTab.click()

    const titleInput = page.locator('#hero-title')
    await expect(titleInput).toBeVisible()

    try {
      await titleInput.fill('Sukabumi Test')
      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

      await expect(page.getByRole('status')).toContainText(
        /Hero Section berhasil disimpan/i
      )

      // Verifikasi perubahan langsung muncul di halaman publik (/)
      await page.goto('/')
      await expect(
        page.locator('#beranda h1')
      ).toHaveText('Sukabumi Test')
    } finally {
      // Pastikan database selalu dikembalikan ke default walau assertion gagal
      await page.goto('/admin/pengaturan')
      await page.getByRole('tab', { name: /Hero Section/i }).click()
      await page.getByRole('button', { name: 'Reset ke Default' }).click()
      await page.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(page.getByRole('status')).toContainText(
        /Hero Section berhasil dikembalikan ke pengaturan awal/i
      )
    }

    await page.goto('/')
    await expect(page.locator('#beranda h1')).toHaveText('Kota Sukabumi')
  })

  test('2. Media YouTube Auto-Convert: konversi URL youtu.be ke format /embed/', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Media & GPR/i }).click()

    const youtubeInput = page.locator('#media-youtube-url')
    await expect(youtubeInput).toBeVisible()

    await youtubeInput.fill('https://youtu.be/p2gcx5S5QJE')
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

    await expect(page.getByRole('status')).toContainText(
      /Media & GPR Komdigi berhasil disimpan/i
    )

    const expectedEmbedUrl = 'https://www.youtube.com/embed/p2gcx5S5QJE'
    await expect(youtubeInput).toHaveValue(expectedEmbedUrl)
    await expect(page.locator('[role="tabpanel"] iframe')).toHaveAttribute(
      'src',
      expectedEmbedUrl
    )
  })

  test('3. Daftar OPD & Nested Modal Escape: urutan 7 kategori kanonik dan Escape hanya tutup modal teratas', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Daftar OPD/i }).click()

    const expectedCategories = [
      'Sekretariat Daerah',
      'Sekretariat Dewan',
      'Inspektorat',
      'Badan',
      'Dinas',
      'Kecamatan',
      'Mitra',
    ]

    const categoryButtons = page.locator('[role="tabpanel"] button[aria-pressed]')
    await expect(categoryButtons).toHaveCount(expectedCategories.length)

    const actualCategories = await categoryButtons.evaluateAll((buttons) =>
      buttons.map((btn) => {
        const textNode = Array.from(btn.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        )
        return (textNode?.textContent ?? '').trim()
      })
    )
    expect(actualCategories).toEqual(expectedCategories)

    // Buka kategori Dinas
    await categoryButtons.filter({ hasText: 'Dinas' }).first().click()

    // Buka modal Kelola Sub-Layanan pada Dinkes (memiliki sub-layanan)
    const dinkesRow = page.locator('[role="tabpanel"] li', { hasText: 'Dinkes' }).first()
    await expect(dinkesRow).toBeVisible()
    await dinkesRow.getByRole('button', { name: /Kelola Sub-Layanan/i }).click()

    const subModal = page.locator('[role="dialog"][aria-labelledby="opd-sub-title"]')
    await expect(subModal).toBeVisible()

    // Klik tombol hapus pada salah satu item di dalam modal sub-layanan
    await subModal
      .getByRole('button', { name: /^Hapus layanan/i })
      .first()
      .click()

    const confirmModal = page.locator(
      '[role="dialog"][aria-labelledby="confirm-delete-title"]'
    )
    await expect(confirmModal).toBeVisible()

    // Tekan Escape -> hanya modal konfirmasi yang tertutup, modal sub-layanan tetap terbuka
    await page.keyboard.press('Escape')

    await expect(confirmModal).toBeHidden()
    await expect(subModal).toBeVisible()
  })

  test('4. Validasi Form Kosong: tambah kartu profil kosong lalu klik Simpan menampilkan Toast error', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Profil Kota/i }).click()

    await page.getByRole('button', { name: 'Tambah Kartu' }).click()
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

    const errorToast = page.getByRole('alert').filter({ hasText: /wajib memiliki judul dan gambar/i })
    await expect(errorToast).toBeVisible()
    await expect(errorToast).toContainText(/wajib memiliki judul dan gambar/i)
  })

  test('5. Mutasi & Simpan Data OPD + Sinkronisasi Beranda: edit OPD, verifikasi di /, lalu reset', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Daftar OPD/i }).click()

    const categoryButtons = page.locator('[role="tabpanel"] button[aria-pressed]')
    await categoryButtons.filter({ hasText: 'Dinas' }).first().click()

    const disnakerRow = page
      .locator('[role="tabpanel"] li', { hasText: 'Disnaker' })
      .first()
    await expect(disnakerRow).toBeVisible()

    try {
      await disnakerRow.getByRole('button', { name: /Edit Disnaker/i }).click()

      const editModal = page.locator('[role="dialog"]').filter({
        hasText: 'Edit Layanan',
      })
      await expect(editModal).toBeVisible()

      await editModal.getByLabel('Nama Instansi / Layanan').fill('Disnaker E2E Test')
      await editModal.getByRole('button', { name: 'Terapkan' }).click()
      await expect(editModal).toBeHidden()

      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
      await expect(
        page.getByRole('status').filter({ hasText: /Daftar OPD berhasil disimpan/i })
      ).toBeVisible()

      // Verifikasi perubahan tampil di beranda (/) pada kategori Dinas
      await page.goto('/')
      const opdSection = page.locator('#opd')
      await opdSection.getByRole('button', { name: 'Dinas', exact: true }).click()
      await expect(opdSection).toContainText('Disnaker E2E Test')
    } finally {
      await page.goto('/admin/pengaturan')
      await page.getByRole('tab', { name: /Daftar OPD/i }).click()
      await page.getByRole('button', { name: 'Reset ke Default' }).click()
      await page.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Daftar OPD berhasil dikembalikan ke pengaturan awal/i })
      ).toBeVisible()
    }

    // Pastikan data di beranda kembali normal
    await page.goto('/')
    const opdSection = page.locator('#opd')
    await opdSection.getByRole('button', { name: 'Dinas', exact: true }).click()
    await expect(opdSection).toContainText('Disnaker')
    await expect(opdSection).not.toContainText('Disnaker E2E Test')
  })

  test('6. Upload File Gambar Fisik & Pembersihan Aset: upload di Welcome, verifikasi di /, reset & hapus file', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Welcome \(Foto\)/i }).click()

    let uploadedSrc: string | null = null

    try {
      await page.locator('#upload-left-container').setInputFiles({
        name: 'e2e-test-upload.png',
        mimeType: 'image/png',
        buffer: ONE_BY_ONE_PNG,
      })

      await expect(
        page.getByRole('status').filter({ hasText: /Foto berhasil diunggah/i })
      ).toBeVisible()

      const uploadedPreviewImg = page
        .locator('[role="tabpanel"] img[src^="/uploads/site/"]')
        .first()
      await expect(uploadedPreviewImg).toBeVisible()
      uploadedSrc = await uploadedPreviewImg.getAttribute('src')
      expect(uploadedSrc).toMatch(/^\/uploads\/site\/.+\.png$/)

      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Foto pada bagian Welcome berhasil diperbarui/i })
      ).toBeVisible()

      // Verifikasi gambar tampil di beranda (/) dan termuat valid (naturalWidth > 0)
      await page.goto('/')
      const publicWelcomeImg = page.locator(`img[src="${uploadedSrc}"]`).first()
      await expect(publicWelcomeImg).toBeVisible()
      const naturalWidth = await publicWelcomeImg.evaluate(
        (img: HTMLImageElement) => img.naturalWidth
      )
      expect(naturalWidth).toBeGreaterThan(0)
    } finally {
      await page.goto('/admin/pengaturan')
      await page.getByRole('tab', { name: /Welcome \(Foto\)/i }).click()
      await page.getByRole('button', { name: 'Reset ke Default' }).click()
      await page.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Bagian Welcome berhasil dikembalikan ke pengaturan awal/i })
      ).toBeVisible()

      // Hapus file fisik hasil upload tes agar repositori tetap bersih
      if (uploadedSrc && uploadedSrc.startsWith('/uploads/site/')) {
        const filePath = path.join(
          process.cwd(),
          'public',
          uploadedSrc.replace(/^\//, '')
        )
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }
  })

  test('7. Cakupan Header & Footer Lintas Halaman: ubah telepon, verifikasi di /berita, lalu reset', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Header & Footer/i }).click()

    const phoneInput = page.locator('#hf-phone-display')
    await expect(phoneInput).toBeVisible()

    try {
      await phoneInput.fill('Telp : (0266) 999-E2E')
      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Header & Footer berhasil disimpan/i })
      ).toBeVisible()

      // Verifikasi perubahan Footer langsung ter-update di halaman publik lain (/berita)
      await page.goto('/berita')
      await expect(page.locator('#footer')).toContainText('(0266) 999-E2E')
    } finally {
      await page.goto('/admin/pengaturan')
      await page.getByRole('tab', { name: /Header & Footer/i }).click()
      await page.getByRole('button', { name: 'Reset ke Default' }).click()
      await page.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Header & Footer berhasil dikembalikan ke pengaturan awal/i })
      ).toBeVisible()
    }

    // Verifikasi Footer di /berita sudah kembali ke default
    await page.goto('/berita')
    await expect(page.locator('#footer')).toContainText('+62 (266) 20229715')
    await expect(page.locator('#footer')).not.toContainText('(0266) 999-E2E')
  })
})
