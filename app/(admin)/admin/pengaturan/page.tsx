import { getSiteSettings } from '@/lib/site-settings/actions'
import PengaturanClient from './PengaturanClient'

export const dynamic = 'force-dynamic'

export default async function AdminPengaturanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [initialSettings, resolvedSearchParams] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ])

  return (
    <PengaturanClient
      initialSettings={initialSettings}
      initialTab={resolvedSearchParams?.tab}
    />
  )
}
