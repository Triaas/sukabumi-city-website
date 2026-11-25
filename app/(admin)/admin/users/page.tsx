import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { getUsersList } from '@/lib/users/actions';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manajemen User | Portal Admin Kota Sukabumi',
  description:
    'Pengelolaan akun pengelola portal, penetapan jabatan, dan reset kata sandi kedinasan.',
};

export default async function AdminUsersPage() {
  const currentUser = await requireRole(['SUPER_ADMIN']);
  const initialUsers = await getUsersList();

  return (
    <UsersClient initialUsers={initialUsers} currentUserId={currentUser.id} />
  );
}
