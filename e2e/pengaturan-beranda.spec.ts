import { test, expect } from '@playwright/test'

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
})
