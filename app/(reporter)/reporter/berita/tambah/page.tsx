import { getNewsById } from '@/lib/db'
import type { BeritaEditData } from '@/lib/types/berita'
import ReporterBeritaForm from './ReporterBeritaForm'

export const dynamic = 'force-dynamic'

interface ReporterTambahBeritaPageProps {
    searchParams?: Promise<{
        id?: string
    }>
}

export default async function ReporterTambahBeritaPage({
    searchParams,
}: ReporterTambahBeritaPageProps) {
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
        <ReporterBeritaForm
            key={initialData?.id ?? 'new'}
            initialData={initialData}
            notFoundId={notFoundId}
        />
    )
}
