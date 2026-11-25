import { requireRole } from '@/lib/auth';
import { getCategoriesWithCount } from '@/lib/berita/category';
import CategoryManagementTable from './CategoryManagementTable';

export const dynamic = 'force-dynamic';

export default async function AdminKategoriBeritaPage() {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const categories = await getCategoriesWithCount();

  return <CategoryManagementTable initialCategories={categories} />;
}
