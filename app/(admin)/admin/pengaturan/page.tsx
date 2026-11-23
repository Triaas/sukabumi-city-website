import { getSiteSettings } from '@/lib/site-settings/actions'
import PengaturanClient from './PengaturanClient'

export const dynamic = 'force-dynamic'

export default async function AdminPengaturanPage() {
  const initialSettings = await getSiteSettings()

  return <PengaturanClient initialSettings={initialSettings} />
}
