import {
    getTransparansiList,
    type TransparansiItem,
} from '@/lib/transparansi/actions'
import TransparansiClient from './TransparansiClient'

export type { TransparansiItem }

export const dynamic = 'force-dynamic'

export default async function AdminTransparansiPage() {
    const initialData = await getTransparansiList()

    return <TransparansiClient initialData={initialData} />
}
