import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getAvailableCategories, getNewsByUuid } from '@/lib/db';
import type { BeritaEditData } from '@/lib/types/berita';
import ReporterBeritaForm from './ReporterBeritaForm';

export const dynamic = 'force-dynamic';

interface ReporterTambahBeritaPageProps {
  searchParams?: Promise<{
    ref?: string;
  }>;
}

export default async function ReporterTambahBeritaPage({
  searchParams,
}: ReporterTambahBeritaPageProps) {
  const user = await requireRole(['REPORTER', 'SUPER_ADMIN']);
  const resolvedParams = searchParams ? await searchParams : {};
  const rawRef = resolvedParams.ref ? resolvedParams.ref.trim() : null;

  let initialData: BeritaEditData | null = null;

  if (rawRef) {
    initialData = await getNewsByUuid(rawRef, {
      role: user.role,
      authorId: user.id,
    });
    if (!initialData || initialData.status !== 'DRAFT') {
      redirect('/reporter/berita');
    }
  }

  const availableCategories = await getAvailableCategories();

  return (
    <ReporterBeritaForm
      key={initialData?.uuid ?? 'new'}
      initialData={initialData}
      notFoundId={null}
      availableCategories={availableCategories}
      currentUser={{ name: user.name, role: user.role }}
    />
  );
}
