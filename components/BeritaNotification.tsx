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
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200"
        >
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{visibleMessage}</span>
            </div>
            <button
                type="button"
                onClick={() => setVisibleMessage(null)}
                title="Tutup notifikasi"
                aria-label="Tutup notifikasi"
                className="text-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    )
}

