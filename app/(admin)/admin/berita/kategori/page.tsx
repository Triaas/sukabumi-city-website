import { getCategoriesWithCount } from '@/lib/berita/category';
import CategoryManagementTable from './CategoryManagementTable';

export const dynamic = 'force-dynamic';

export default async function AdminKategoriBeritaPage() {
  const categories = await getCategoriesWithCount();

  return <CategoryManagementTable initialCategories={categories} />;
}

