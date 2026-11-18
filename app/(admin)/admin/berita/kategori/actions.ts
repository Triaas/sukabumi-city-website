'use server';

import { revalidatePath } from 'next/cache';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getNewsByCategoryId,
  reassignAndDeleteCategory,
  type CategoryMutationResult,
  type CategoryLinkedNewsItem,
} from '@/lib/berita/category';

function revalidateCategoryRoutes() {
  revalidatePath('/admin/berita');
  revalidatePath('/admin/berita/kategori');
  revalidatePath('/admin/berita/tambah');
  revalidatePath('/reporter/berita');
  revalidatePath('/reporter/berita/tambah');
  revalidatePath('/berita');
  revalidatePath('/');
}

/**
 * Server Action untuk menambahkan kategori berita baru.
 */
export async function createCategoryAction(
  formData: FormData
): Promise<CategoryMutationResult> {
  const name = ((formData.get('name') as string) || '').trim();
  const result = await createCategory(name);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

/**
 * Server Action untuk memperbarui nama kategori berita berdasarkan ID.
 */
export async function updateCategoryAction(
  id: number,
  formData: FormData
): Promise<CategoryMutationResult> {
  const name = ((formData.get('name') as string) || '').trim();
  const result = await updateCategory(id, name);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

/**
 * Server Action untuk menghapus kategori berita jika tidak digunakan oleh berita mana pun.
 */
export async function deleteCategoryAction(
  id: number
): Promise<CategoryMutationResult> {
  const result = await deleteCategory(id);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

/**
 * Server Action untuk mengambil daftar berita yang masih terikat pada suatu kategori.
 */
export async function getCategoryLinkedNewsAction(
  categoryId: number
): Promise<CategoryLinkedNewsItem[]> {
  return getNewsByCategoryId(categoryId);
}

/**
 * Server Action untuk memindahkan seluruh berita dari satu kategori ke kategori tujuan
 * lalu menghapus kategori asalnya dalam satu transaksi.
 */
export async function reassignAndDeleteCategoryAction(
  sourceCategoryId: number,
  targetCategoryId: number
): Promise<CategoryMutationResult> {
  const result = await reassignAndDeleteCategory(
    sourceCategoryId,
    targetCategoryId
  );

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}
