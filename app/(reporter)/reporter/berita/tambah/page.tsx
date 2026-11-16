import { redirect } from 'next/navigation'
import { getAvailableCategories, getNewsByUuid } from '@/lib/db'
import type { BeritaEditData } from '@/lib/types/berita'
import ReporterBeritaForm from './ReporterBeritaForm'

export const dynamic = 'force-dynamic'

interface ReporterTambahBeritaPageProps {
    searchParams?: Promise<{
        ref?: string
    }>
}

export default async function ReporterTambahBeritaPage({
    searchParams,
}: ReporterTambahBeritaPageProps) {
    const resolvedParams = searchParams ? await searchParams : {}
    const rawRef = resolvedParams.ref ? resolvedParams.ref.trim() : null

    let initialData: BeritaEditData | null = null

    if (rawRef) {
        initialData = await getNewsByUuid(rawRef, {
            role: 'REPORTER',
            authorName: 'Budi Santoso',
        })
        if (!initialData || initialData.status !== 'DRAFT') {
            redirect('/reporter/berita')
        }
    }

    const availableCategories = await getAvailableCategories()

    return (
        <ReporterBeritaForm
            key={initialData?.uuid ?? 'new'}
            initialData={initialData}
            notFoundId={null}
            availableCategories={availableCategories}
        />
    )
}
