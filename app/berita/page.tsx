import { Suspense } from 'react'
import { getAllNews } from '@/lib/db'
import BeritaClient from './BeritaClient'

export const revalidate = 180 // Menyimpan halaman di memori selama 180 detik

export default async function BeritaPage() {
  const newsData = await getAllNews()

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Memuat berita...</div>}>
      <BeritaClient initialNews={newsData} />
    </Suspense>
  )
}