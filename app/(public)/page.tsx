import { getSiteSettings } from '@/lib/site-settings/actions'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const settings = await getSiteSettings()

  return <HomeClient settings={settings} />
}
