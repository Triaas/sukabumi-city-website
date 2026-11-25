import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminShell from './AdminShell';

export default async function AdminLayout({
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

  if (user.role === 'REPORTER') {
    redirect('/reporter/berita');
  }

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
