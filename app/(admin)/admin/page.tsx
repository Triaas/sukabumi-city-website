import { requireRole } from '@/lib/auth';
import { getDashboardAnalytics } from '@/lib/analytics/ga4';
import { getAdminNewsList } from '@/lib/db';
import { getPengumumanList } from '@/lib/pengumuman/actions';
import { getTransparansiList } from '@/lib/transparansi/actions';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const [beritaList, pengumumanList, transparansiList, analytics] =
    await Promise.all([
      getAdminNewsList({ role: user.role }),
      isSuperAdmin ? getPengumumanList() : Promise.resolve([]),
      isSuperAdmin ? getTransparansiList() : Promise.resolve([]),
      getDashboardAnalytics(),
    ]);

  const statsCounts = {
    beritaPublished: beritaList.filter((item) => item.status === 'PUBLISHED')
      .length,
    beritaReview: beritaList.filter((item) => item.status === 'SUBMITTED')
      .length,
    pengumumanPublished: pengumumanList.filter(
      (item) => item.status === 'Diterbitkan'
    ).length,
    pengumumanDraft: pengumumanList.filter((item) => item.status === 'Draf')
      .length,
    dokumenPublished: transparansiList.filter(
      (item) => item.status === 'Diterbitkan'
    ).length,
  };

  return (
    <DashboardClient
      statsCounts={statsCounts}
      analytics={analytics}
      userName={user.name}
      userRole={user.role as 'SUPER_ADMIN' | 'ADMIN_BERITA'}
    />
  );
}
