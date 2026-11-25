import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getProfilePageBySlug } from '@/lib/profile-pages/queries';
import ProfilePageEditorClient from './ProfilePageEditorClient';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole(['SUPER_ADMIN']);
  const { slug } = await params;
  const page = await getProfilePageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <ProfilePageEditorClient key={page.slug} initialPage={page} />;
}
