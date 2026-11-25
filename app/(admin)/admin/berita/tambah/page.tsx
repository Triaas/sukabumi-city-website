import { requireRole } from '@/lib/auth';
import { getAvailableCategories, getNewsByUuid } from '@/lib/db';
import type { BeritaEditData } from '@/lib/types/berita';
import AdminBeritaForm from './AdminBeritaForm';

export const dynamic = 'force-dynamic';

interface TambahBeritaPageProps {
  searchParams?: Promise<{
    ref?: string;
  }>;
}

export default async function TambahBeritaPage({
  searchParams,
}: TambahBeritaPageProps) {
  const user = await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const resolvedParams = searchParams ? await searchParams : {};
  const rawRef = resolvedParams.ref ? resolvedParams.ref.trim() : null;

  let initialData: BeritaEditData | null = null;
  let notFoundId: string | null = null;

  if (rawRef) {
    initialData = await getNewsByUuid(rawRef, { role: user.role });
    if (!initialData) {
      notFoundId = rawRef;
    }
  }

  const availableCategories = await getAvailableCategories();

  return (
    <AdminBeritaForm
      key={initialData?.uuid ?? 'new'}
      initialData={initialData}
      notFoundId={notFoundId}
      availableCategories={availableCategories}
      currentUser={{ name: user.name, role: user.role }}
    />
  );
}
