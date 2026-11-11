import {
    getPengumumanList,
    type PengumumanItem,
} from '@/lib/pengumuman/actions'
import PengumumanClient from './PengumumanClient'

export type { PengumumanItem }

export const dynamic = 'force-dynamic'

export default async function AdminPengumumanPage() {
    const initialData = await getPengumumanList()

    return <PengumumanClient initialData={initialData} />
}
