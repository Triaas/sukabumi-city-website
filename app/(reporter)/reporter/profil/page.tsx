import { requireRole } from '@/lib/auth';
import ProfileSettingsClient from '@/components/ProfileSettingsClient';

export const dynamic = 'force-dynamic';

export default async function ReporterProfilPage() {
  const user = await requireRole(['REPORTER', 'SUPER_ADMIN']);

  return (
    <ProfileSettingsClient
      initialName={user.name}
      email={user.email}
      role={user.role}
    />
  );
}
