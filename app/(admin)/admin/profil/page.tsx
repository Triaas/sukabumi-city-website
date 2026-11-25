import { requireRole } from '@/lib/auth';
import ProfileSettingsClient from '@/components/ProfileSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProfilPage() {
  const user = await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);

  return (
    <ProfileSettingsClient
      initialName={user.name}
      email={user.email}
      role={user.role}
    />
  );
}
