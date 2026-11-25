import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ReporterShell from './ReporterShell';

export default async function ReporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.mustChangePassword || user.isPasswordExpired) {
    redirect('/ganti-sandi-wajib');
  }

  if (user.role === 'ADMIN_BERITA') {
    redirect('/admin/berita');
  }

  return (
    <ReporterShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </ReporterShell>
  );
}
