'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
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

export async function createCategoryAction(
  formData: FormData
): Promise<CategoryMutationResult> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const name = ((formData.get('name') as string) || '').trim();
  const result = await createCategory(name);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

export async function updateCategoryAction(
  id: number,
  formData: FormData
): Promise<CategoryMutationResult> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const name = ((formData.get('name') as string) || '').trim();
  const result = await updateCategory(id, name);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

export async function deleteCategoryAction(
  id: number
): Promise<CategoryMutationResult> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const result = await deleteCategory(id);

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}

export async function getCategoryLinkedNewsAction(
  categoryId: number
): Promise<CategoryLinkedNewsItem[]> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  return getNewsByCategoryId(categoryId);
}

export async function reassignAndDeleteCategoryAction(
  sourceCategoryId: number,
  targetCategoryId: number
): Promise<CategoryMutationResult> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const result = await reassignAndDeleteCategory(
    sourceCategoryId,
    targetCategoryId
  );

  if (result.success) {
    revalidateCategoryRoutes();
  }

  return result;
}
