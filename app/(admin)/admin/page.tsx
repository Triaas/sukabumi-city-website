import { getAdminNewsList } from '@/lib/db'
import { getPengumumanList } from '@/lib/pengumuman/actions'
import { getTransparansiList } from '@/lib/transparansi/actions'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [beritaList, pengumumanList, transparansiList] = await Promise.all([
    getAdminNewsList(),
    getPengumumanList(),
    getTransparansiList(),
  ])

  const statsCounts = {
    beritaPublished: beritaList.filter((item) => item.status === 'PUBLISHED').length,
    beritaReview: beritaList.filter((item) => item.status === 'SUBMITTED').length,
    pengumumanPublished: pengumumanList.filter((item) => item.status === 'Diterbitkan').length,
    pengumumanDraft: pengumumanList.filter((item) => item.status === 'Draf').length,
    dokumenPublished: transparansiList.filter((item) => item.status === 'Diterbitkan').length,
  }

  return <DashboardClient statsCounts={statsCounts} />
}
