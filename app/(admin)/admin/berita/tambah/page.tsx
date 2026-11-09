import { getNewsById } from '@/lib/db'
import type { BeritaEditData } from '@/lib/types/berita'
import AdminBeritaForm from './AdminBeritaForm'

export const dynamic = 'force-dynamic'

interface TambahBeritaPageProps {
    searchParams?: Promise<{
        id?: string
    }>
}

export default async function TambahBeritaPage({
    searchParams,
}: TambahBeritaPageProps) {
    const resolvedParams = searchParams ? await searchParams : {}
    const rawId = resolvedParams.id ? Number(resolvedParams.id) : null

    let initialData: BeritaEditData | null = null
    let notFoundId: number | null = null

    if (rawId && Number.isFinite(rawId) && rawId > 0) {
        initialData = await getNewsById(rawId)
        if (!initialData) {
            notFoundId = rawId
        }
    }

    return (
        <AdminBeritaForm
            key={initialData?.id ?? 'new'}
            initialData={initialData}
            notFoundId={notFoundId}
        />
    )
}
