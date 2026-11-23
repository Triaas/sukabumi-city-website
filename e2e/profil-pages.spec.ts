import { test, expect } from '@playwright/test'

test.describe('CMS Halaman Detail Profil Kota (/admin/pengaturan/profil/[slug])', () => {
  test('1. Navigasi dari ProfileTab & Edit Konten Umum (UKS), verifikasi di /uks, lalu Reset ke Default', async ({
    page,
  }) => {
    await page.goto('/admin/pengaturan')
    await expect(
      page.getByRole('heading', { name: 'Pengaturan Beranda Pengunjung' })
    ).toBeVisible()

    // Buka tab Profil Kota
    await page.getByRole('tab', { name: /Profil Kota/i }).click()

    // Klik tombol Edit Halaman Detail pada kartu yang mengarah ke /admin/pengaturan/profil/uks
    const uksDetailLink = page.locator(
      'a[href="/admin/pengaturan/profil/uks"]'
    )
    await expect(uksDetailLink).toBeVisible()
    await uksDetailLink.click()

    await expect(page).toHaveURL(/\/admin\/pengaturan\/profil\/uks$/)
    await expect(
      page.getByRole('heading', { name: /Edit Halaman:.*UKS/i })
    ).toBeVisible()

    const descInput = page.locator('#profile-page-description')
    await expect(descInput).toBeVisible()

    try {
      await descInput.fill('Deskripsi UKS E2E Test')
      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

      await expect(
        page.getByRole('status').filter({ hasText: /berhasil disimpan/i })
      ).toBeVisible()

      // Verifikasi perubahan langsung muncul di halaman publik /uks
      await page.goto('/uks')
      await expect(page.locator('main')).toContainText('Deskripsi UKS E2E Test')
    } finally {
      // Pastikan database selalu kembali ke default
      await page.goto('/admin/pengaturan/profil/uks')
      await page.getByRole('button', { name: 'Reset ke Default' }).click()

      const resetDialog = page.locator(
        '[role="dialog"][aria-labelledby="confirm-reset-profile-title"]'
      )
      await expect(resetDialog).toBeVisible()
      await resetDialog.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /berhasil dikembalikan ke default/i })
      ).toBeVisible()
    }

    // Pastikan halaman publik /uks kembali ke deskripsi bawaan
    await page.goto('/uks')
    await expect(page.locator('main')).toContainText(
      'Program pembinaan kesehatan komprehensif di lingkungan sekolah'
    )
    await expect(page.locator('main')).not.toContainText(
      'Deskripsi UKS E2E Test'
    )
  })

  test('2. Pill Switcher Antar Halaman & Editor Khusus (Lambang dan Sejarah)', async ({
    page,
  }) => {
    await page.goto('/admin/pengaturan/profil/uks')

    const switcherNav = page.getByRole('navigation', {
      name: 'Navigasi Cepat Halaman Profil Kota',
    })
    await expect(switcherNav).toBeVisible()

    // Pindah ke Lambang
    await switcherNav.getByRole('link', { name: 'Lambang', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/pengaturan\/profil\/lambang$/)
    await expect(
      page.getByRole('heading', { name: /Arti & Makna Elemen Lambang/i })
    ).toBeVisible()
    await expect(page.locator('#meaning-item-0-title')).toHaveValue('Perisai')

    // Pindah ke Sejarah
    await switcherNav.getByRole('link', { name: 'Sejarah', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/pengaturan\/profil\/sejarah$/)
    await expect(
      page.getByRole('heading', { name: /Timeline Nomenklatur/i })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Daftar Pimpinan \/ Wali Kota/i })
    ).toBeVisible()
  })

  test('3. Mutasi Daftar Pimpinan di Sejarah & Sinkronisasi ke /sejarah/pemimpin/[slug], lalu Reset', async ({
    page,
  }) => {
    await page.goto('/admin/pengaturan/profil/sejarah')
    await expect(
      page.getByRole('heading', { name: /Daftar Pimpinan \/ Wali Kota/i })
    ).toBeVisible()

    try {
      await page.getByRole('button', { name: 'Tambah Pimpinan' }).click()

      const leaderModal = page.locator(
        '[role="dialog"][aria-labelledby="leader-modal-title"]'
      )
      await expect(leaderModal).toBeVisible()

      await leaderModal.locator('#leader-draft-name').fill('Wali Kota E2E Test')
      await expect(leaderModal.locator('#leader-draft-slug')).toHaveValue(
        'wali-kota-e2e-test'
      )
      await leaderModal.locator('#leader-draft-period').fill('2030 - 2035')
      await leaderModal
        .locator('#leader-draft-bio')
        .fill('Biografi singkat Wali Kota E2E Test.')
      await leaderModal
        .locator('#leader-draft-fullbio')
        .fill('Paragraf lengkap biografi Wali Kota E2E Test untuk verifikasi.')

      await leaderModal.getByRole('button', { name: 'Terapkan Tokoh' }).click()
      await expect(leaderModal).toBeHidden()

      await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
      await expect(
        page.getByRole('status').filter({ hasText: /berhasil disimpan/i })
      ).toBeVisible()

      // Verifikasi tampil di galeri /sejarah (klik Lihat Semua jika perlu)
      await page.goto('/sejarah')
      const hallOfFame = page.locator('#hall-of-fame')
      await expect(hallOfFame).toBeVisible()
      const expandBtn = hallOfFame.getByRole('button', { name: /Lihat Semua/i })
      if (await expandBtn.isVisible()) {
        await expandBtn.click()
      }
      await expect(hallOfFame).toContainText('2030 - 2035')

      // Verifikasi halaman detail tokoh langsung sinkron dari DB
      await page.goto('/sejarah/pemimpin/wali-kota-e2e-test')
      await expect(
        page.getByRole('heading', { name: 'Wali Kota E2E Test' })
      ).toBeVisible()
      await expect(page.locator('main')).toContainText(
        'Paragraf lengkap biografi Wali Kota E2E Test untuk verifikasi.'
      )
    } finally {
      // Kembalikan halaman Sejarah ke default agar database tetap bersih
      await page.goto('/admin/pengaturan/profil/sejarah')
      await page.getByRole('button', { name: 'Reset ke Default' }).click()

      const resetDialog = page.locator(
        '[role="dialog"][aria-labelledby="confirm-reset-profile-title"]'
      )
      await expect(resetDialog).toBeVisible()
      await resetDialog.getByRole('button', { name: 'Ya, Reset' }).click()

      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /berhasil dikembalikan ke default/i })
      ).toBeVisible()
    }

    // Pastikan slug uji coba tidak lagi tersedia (404)
    const afterResetRes = await page.goto('/sejarah/pemimpin/wali-kota-e2e-test')
    expect(afterResetRes?.status()).toBe(404)
  })
})
