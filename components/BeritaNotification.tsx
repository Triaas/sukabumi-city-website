'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const NOTIFICATION_MESSAGES: Record<string, string> = {
    draft_saved: 'Draf berita berhasil disimpan.',
    draft_updated: 'Perubahan draf berita berhasil disimpan.',
    published: 'Berita berhasil diterbitkan ke portal publik.',
    published_updated: 'Berita berhasil diperbarui dan diterbitkan ke portal publik.',
    submitted: 'Berita berhasil dikirim untuk peninjauan redaksi.',
}

interface BeritaNotificationProps {
    notifKey?: string
}

export default function BeritaNotification({ notifKey }: BeritaNotificationProps) {
    const message = notifKey ? NOTIFICATION_MESSAGES[notifKey] ?? null : null
    const [visibleMessage, setVisibleMessage] = useState<string | null>(message)

    useEffect(() => {
        if (!notifKey || !NOTIFICATION_MESSAGES[notifKey]) {
            setVisibleMessage(null)
            return
        }

        setVisibleMessage(NOTIFICATION_MESSAGES[notifKey])

        // Bersihkan query parameter ?notif=... dari URL agar tidak muncul ulang saat halaman di-refresh
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            if (url.searchParams.has('notif')) {
                url.searchParams.delete('notif')
                const cleanUrl =
                    url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '')
                window.history.replaceState({}, '', cleanUrl)
            }
        }

        const timer = setTimeout(() => {
            setVisibleMessage(null)
        }, 5000)

        return () => clearTimeout(timer)
    }, [notifKey])

    if (!visibleMessage) return null

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-6 right-6 z-[110] max-w-md w-[calc(100vw-3rem)] sm:w-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[15px] font-semibold shadow-xl animate-in fade-in slide-in-from-top-3 duration-200"
        >
            <div className="flex items-center gap-3">
                <CheckCircle2 size={21} className="shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{visibleMessage}</span>
            </div>
            <button
                type="button"
                onClick={() => setVisibleMessage(null)}
                title="Tutup notifikasi"
                aria-label="Tutup notifikasi"
                className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
                <X size={18} aria-hidden="true" />
            </button>
        </div>
    )
}

