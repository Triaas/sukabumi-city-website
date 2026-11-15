import { getBannerList, type BannerItem } from '@/lib/banner/actions'
import BannerClient from './BannerClient'

export type { BannerItem }

export const dynamic = 'force-dynamic'

export default async function AdminBannerPage() {
    const initialData = await getBannerList()

    return <BannerClient initialData={initialData} />
}
