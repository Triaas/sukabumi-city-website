import { revalidatePath } from 'next/cache';

/**
 * Merevalidasi seluruh jalur cache yang berkaitan dengan berita
 * (halaman daftar berita publik, detail berita opsional, beranda, panel admin, dan panel reporter).
 */
export function revalidateBeritaPaths(slug?: string): void {
  revalidatePath('/berita');
  if (slug) {
    revalidatePath(`/berita/${slug}`);
  }
  revalidatePath('/');
  revalidatePath('/admin/berita');
  revalidatePath('/reporter/berita');
}

